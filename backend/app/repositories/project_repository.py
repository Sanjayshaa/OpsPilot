import json
import uuid
import re
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.db.database import get_db_connection, init_db
from app.models.domain import (
    Project,
    Environment,
    ProviderType,
    EnvironmentType,
    EnvironmentStatus,
    HealthStatus
)

SENSITIVE_KEY_PATTERNS = ["password", "token", "secret", "api_key", "private_key", "auth_header"]

def sanitize_provider_config(config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Ensures no sensitive credentials, secrets, or keys are persisted in provider_config."""
    if not config:
        return {}
    sanitized = {}
    for k, v in config.items():
        k_lower = k.lower()
        if any(pat in k_lower for pat in SENSITIVE_KEY_PATTERNS):
            continue
        sanitized[k] = v
    return sanitized

def _slugify(text: str) -> str:
    cleaned = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "_", cleaned)

class ProjectRepository:
    """
    Data Access Repository for Projects and Environments.
    Backed by SQLite with clean separation of concerns for future PostgreSQL migration.
    """

    def __init__(self):
        init_db()
        self.init_defaults()

    def init_defaults(self):
        """
        Seeds strictly the default project and default development environment if they do not exist:
        - prj_default: 'Default Workspace'
        - env_default_dev: 'Local Docker Development' / 'docker'
        Does NOT automatically create staging or production.
        """
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM projects WHERE id = ?", ("prj_default",))
            if not cursor.fetchone():
                now = datetime.utcnow().isoformat()
                cursor.execute("""
                INSERT INTO projects (id, name, description, is_default, created_at, updated_at)
                VALUES (?, ?, ?, 1, ?, ?);
                """, ("prj_default", "Default Workspace", "Default workspace for local and standalone operations", now, now))

            cursor.execute("SELECT id FROM environments WHERE id = ?", ("env_default_dev",))
            if not cursor.fetchone():
                now = datetime.utcnow().isoformat()
                cursor.execute("""
                INSERT INTO environments (
                    id, project_id, name, env_type, provider_type, provider_connection_id,
                    provider_config, status, health_status, is_default, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, 1, ?, ?);
                """, (
                    "env_default_dev",
                    "prj_default",
                    "Local Docker Development",
                    EnvironmentType.DEVELOPMENT.value,
                    ProviderType.DOCKER.value,
                    json.dumps({"socket_path": "/var/run/docker.sock"}),
                    EnvironmentStatus.ACTIVE.value,
                    HealthStatus.HEALTHY.value,
                    now,
                    now
                ))

    def _row_to_env(self, row) -> Environment:
        raw_config = row["provider_config"]
        try:
            cfg = json.loads(raw_config) if isinstance(raw_config, str) else (raw_config or {})
        except Exception:
            cfg = {}
        return Environment(
            id=row["id"],
            project_id=row["project_id"],
            name=row["name"],
            env_type=row["env_type"],
            provider_type=ProviderType(row["provider_type"]),
            provider_connection_id=row["provider_connection_id"],
            provider_config=cfg,
            status=row["status"],
            health_status=row["health_status"],
            is_default=bool(row["is_default"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"]
        )

    def _row_to_project(self, row, environments: Optional[List[Environment]] = None) -> Project:
        return Project(
            id=row["id"],
            name=row["name"],
            description=row["description"] or "",
            is_default=bool(row["is_default"]),
            environments=environments or [],
            created_at=row["created_at"],
            updated_at=row["updated_at"]
        )

    def list_projects(self) -> List[Project]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects ORDER BY is_default DESC, created_at ASC;")
            project_rows = cursor.fetchall()

            projects = []
            for p_row in project_rows:
                cursor.execute("SELECT * FROM environments WHERE project_id = ? ORDER BY is_default DESC, created_at ASC;", (p_row["id"],))
                env_rows = cursor.fetchall()
                envs = [self._row_to_env(r) for r in env_rows]
                projects.append(self._row_to_project(p_row, envs))
            return projects

    def get_project(self, project_id: str) -> Optional[Project]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE id = ?;", (project_id,))
            p_row = cursor.fetchone()
            if not p_row:
                return None
            cursor.execute("SELECT * FROM environments WHERE project_id = ? ORDER BY is_default DESC, created_at ASC;", (project_id,))
            envs = [self._row_to_env(r) for r in cursor.fetchall()]
            return self._row_to_project(p_row, envs)

    def create_project(self, name: str, description: str = "", project_id: Optional[str] = None) -> Project:
        p_id = project_id or f"prj_{_slugify(name)}_{uuid.uuid4().hex[:6]}"
        now = datetime.utcnow().isoformat()
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO projects (id, name, description, is_default, created_at, updated_at)
            VALUES (?, ?, ?, 0, ?, ?);
            """, (p_id, name, description, now, now))
            
            # Create a single default development environment for the project
            env_id = f"env_{p_id}_dev"
            cursor.execute("""
            INSERT INTO environments (
                id, project_id, name, env_type, provider_type, provider_connection_id,
                provider_config, status, health_status, is_default, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, NULL, '{}', ?, ?, 1, ?, ?);
            """, (
                env_id,
                p_id,
                "Development",
                EnvironmentType.DEVELOPMENT.value,
                ProviderType.DOCKER.value,
                EnvironmentStatus.ACTIVE.value,
                HealthStatus.HEALTHY.value,
                now,
                now
            ))

        return self.get_project(p_id)

    def delete_project(self, project_id: str) -> bool:
        if project_id == "prj_default":
            raise ValueError("The default workspace 'prj_default' is protected and cannot be deleted.")

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT is_default FROM projects WHERE id = ?;", (project_id,))
            row = cursor.fetchone()
            if not row:
                return False
            if bool(row["is_default"]):
                raise ValueError("Protected default project cannot be deleted.")

            cursor.execute("DELETE FROM projects WHERE id = ?;", (project_id,))
            return cursor.rowcount > 0

    def list_environments(self, project_id: str) -> List[Environment]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM environments WHERE project_id = ? ORDER BY is_default DESC, created_at ASC;", (project_id,))
            return [self._row_to_env(r) for r in cursor.fetchall()]

    def get_environment(self, env_id: str) -> Optional[Environment]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM environments WHERE id = ?;", (env_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return self._row_to_env(row)

    def get_default_environment(self, project_id: Optional[str] = None) -> Environment:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if project_id:
                cursor.execute("SELECT * FROM environments WHERE project_id = ? AND is_default = 1 LIMIT 1;", (project_id,))
                row = cursor.fetchone()
                if row:
                    return self._row_to_env(row)
            
            cursor.execute("SELECT * FROM environments WHERE id = 'env_default_dev' LIMIT 1;")
            row = cursor.fetchone()
            if row:
                return self._row_to_env(row)
            
            # Fallback to any default or first available environment
            cursor.execute("SELECT * FROM environments ORDER BY is_default DESC LIMIT 1;")
            row = cursor.fetchone()
            if row:
                return self._row_to_env(row)

        raise RuntimeError("No default environment available in repository.")

    def create_environment(
        self,
        project_id: str,
        name: str,
        env_type: str = EnvironmentType.DEVELOPMENT.value,
        provider_type: ProviderType = ProviderType.DOCKER,
        provider_connection_id: Optional[str] = None,
        provider_config: Optional[Dict[str, Any]] = None,
        is_default: bool = False,
        env_id: Optional[str] = None
    ) -> Environment:
        # Verify parent project exists
        project = self.get_project(project_id)
        if not project:
            raise KeyError(f"Parent project '{project_id}' does not exist.")

        e_id = env_id or f"env_{project_id}_{_slugify(name)}_{uuid.uuid4().hex[:4]}"
        sanitized_cfg = sanitize_provider_config(provider_config)
        now = datetime.utcnow().isoformat()

        with get_db_connection() as conn:
            cursor = conn.cursor()
            if is_default:
                # Reset previous default in this project
                cursor.execute("UPDATE environments SET is_default = 0 WHERE project_id = ?;", (project_id,))

            cursor.execute("""
            INSERT INTO environments (
                id, project_id, name, env_type, provider_type, provider_connection_id,
                provider_config, status, health_status, is_default, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                e_id,
                project_id,
                name,
                env_type,
                provider_type.value if hasattr(provider_type, "value") else str(provider_type),
                provider_connection_id,
                json.dumps(sanitized_cfg),
                EnvironmentStatus.ACTIVE.value,
                HealthStatus.HEALTHY.value,
                1 if is_default else 0,
                now,
                now
            ))

        return self.get_environment(e_id)

    def delete_environment(self, env_id: str) -> bool:
        if env_id == "env_default_dev":
            raise ValueError("The default development environment 'env_default_dev' is protected and cannot be deleted.")

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT is_default FROM environments WHERE id = ?;", (env_id,))
            row = cursor.fetchone()
            if not row:
                return False
            if bool(row["is_default"]):
                raise ValueError("Protected default environment cannot be deleted.")

            cursor.execute("DELETE FROM environments WHERE id = ?;", (env_id,))
            return cursor.rowcount > 0

project_repository = ProjectRepository()
