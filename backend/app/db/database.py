import sqlite3
import os
import json
from contextlib import contextmanager
from typing import Generator

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
DB_PATH = os.path.join(DB_DIR, "opspilot.db")

def get_db_path() -> str:
    os.makedirs(DB_DIR, exist_ok=True)
    return DB_PATH

@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager providing an isolated SQLite database connection with row factory
    and enforced foreign key constraints.
    """
    db_file = get_db_path()
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

class DatabaseSession:
    """
    Wrapper around get_db_connection for programmatic repository access.
    Abstracts DB operations to facilitate future PostgreSQL adapter swapping.
    """
    def __enter__(self):
        self._cm = get_db_connection()
        self.conn = self._cm.__enter__()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        return self._cm.__exit__(exc_type, exc_val, exc_tb)

def init_db():
    """
    Idempotent schema initialization.
    Creates projects and environments tables with indexes if not already present.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            is_default INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS environments (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            env_type TEXT NOT NULL,
            provider_type TEXT NOT NULL,
            provider_connection_id TEXT,
            provider_config TEXT DEFAULT '{}',
            status TEXT NOT NULL,
            health_status TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        """)

        cursor.execute("CREATE INDEX IF NOT EXISTS idx_env_project_id ON environments(project_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_projects_is_default ON projects(is_default);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_env_is_default ON environments(is_default);")
