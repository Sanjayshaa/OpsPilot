from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any, List

from app.models.domain import (
    Project,
    Environment,
    ProjectCreateRequest,
    EnvironmentCreateRequest,
    ProviderType
)
from app.repositories.project_repository import project_repository
from app.providers.registry import provider_registry

router = APIRouter(tags=["Projects & Environments"])

def make_response(data: Any = None, error: Optional[str] = None, success: bool = True):
    return {
        "success": success if error is None else False,
        "data": data if error is None else None,
        "error": error
    }

@router.get("/api/projects")
def list_projects():
    try:
        projects = project_repository.list_projects()
        return make_response([p.model_dump() for p in projects])
    except Exception as e:
        return make_response(error=str(e), success=False)

@router.post("/api/projects")
def create_project(req: ProjectCreateRequest):
    try:
        if not req.name or not req.name.strip():
            return make_response(error="Project name cannot be empty.", success=False)
        project = project_repository.create_project(
            name=req.name.strip(),
            description=req.description or "",
            project_id=req.id
        )
        return make_response(project.model_dump())
    except Exception as e:
        return make_response(error=str(e), success=False)

@router.get("/api/projects/{project_id}")
def get_project(project_id: str):
    project = project_repository.get_project(project_id)
    if not project:
        return make_response(error=f"Project '{project_id}' not found.", success=False)
    return make_response(project.model_dump())

@router.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    try:
        success = project_repository.delete_project(project_id)
        if not success:
            return make_response(error=f"Project '{project_id}' not found.", success=False)
        return make_response({"deleted_id": project_id, "message": "Project removed successfully."})
    except ValueError as ve:
        return make_response(error=str(ve), success=False)
    except Exception as e:
        return make_response(error=str(e), success=False)

@router.get("/api/projects/{project_id}/environments")
def list_project_environments(project_id: str):
    project = project_repository.get_project(project_id)
    if not project:
        return make_response(error=f"Project '{project_id}' not found.", success=False)
    envs = project_repository.list_environments(project_id)
    return make_response([e.model_dump() for e in envs])

@router.post("/api/projects/{project_id}/environments")
def create_environment(project_id: str, req: EnvironmentCreateRequest):
    try:
        if not req.name or not req.name.strip():
            return make_response(error="Environment name cannot be empty.", success=False)
        
        # Verify provider type exists in registry
        ptype = req.provider_type or ProviderType.DOCKER
        if ptype.value not in provider_registry.list_providers():
            return make_response(error=f"Provider '{ptype}' is not registered or supported.", success=False)

        env = project_repository.create_environment(
            project_id=project_id,
            name=req.name.strip(),
            env_type=req.env_type or "development",
            provider_type=ptype,
            provider_connection_id=req.provider_connection_id,
            provider_config=req.provider_config,
            is_default=bool(req.is_default)
        )
        return make_response(env.model_dump())
    except KeyError as ke:
        return make_response(error=str(ke), success=False)
    except Exception as e:
        return make_response(error=str(e), success=False)

@router.get("/api/environments/{environment_id}")
def get_environment(environment_id: str):
    env = project_repository.get_environment(environment_id)
    if not env:
        return make_response(error=f"Environment '{environment_id}' not found.", success=False)
    return make_response(env.model_dump())

@router.delete("/api/environments/{environment_id}")
def delete_environment(environment_id: str):
    try:
        success = project_repository.delete_environment(environment_id)
        if not success:
            return make_response(error=f"Environment '{environment_id}' not found.", success=False)
        return make_response({"deleted_id": environment_id, "message": "Environment removed successfully."})
    except ValueError as ve:
        return make_response(error=str(ve), success=False)
    except Exception as e:
        return make_response(error=str(e), success=False)
