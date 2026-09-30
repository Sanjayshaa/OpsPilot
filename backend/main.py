import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.core.config import settings
from app.models.domain import ProviderType, DeploymentSpec
from app.providers.registry import provider_registry
from app.repositories.project_repository import project_repository
from app.api.projects import router as projects_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="DevOps & Cloud Operations API for multi-provider infrastructure, telemetry, and automated investigations."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Project and Environment management routes
app.include_router(projects_router)

def make_response(data: Any = None, error: Optional[str] = None, success: bool = True):
    return {
        "success": success if error is None else False,
        "data": data if error is None else None,
        "error": error
    }

class DeployRequest(BaseModel):
    image: str
    name: Optional[str] = None
    ports: Optional[Dict[str, str]] = None
    env: Optional[Dict[str, str]] = None
    restart_policy: Optional[str] = "unless-stopped"
    provider: Optional[str] = None
    environment_id: Optional[str] = None

class ActionRequest(BaseModel):
    container_id: str
    provider: Optional[str] = None
    environment_id: Optional[str] = None

def _resolve_provider_and_env(provider_name: Optional[str] = None, environment_id: Optional[str] = None):
    """
    Resolves the target environment and infrastructure provider.
    Defaults to the seeded 'env_default_dev' and 'DockerProvider' if not specified.
    """
    env = None
    if environment_id:
        env = project_repository.get_environment(environment_id)
    if not env:
        env = project_repository.get_default_environment()

    ptype = None
    if provider_name:
        try:
            ptype = ProviderType(provider_name)
        except Exception:
            pass
    elif env and env.provider_type:
        ptype = env.provider_type

    try:
        provider = provider_registry.get(ptype)
    except Exception:
        provider = provider_registry.get()

    return provider, env

@app.get("/")
def read_root():
    provider, _ = _resolve_provider_and_env()
    return make_response(provider.check_connection())

@app.get("/api/providers")
def list_providers():
    return make_response({
        "available_providers": provider_registry.list_providers(),
        "default_provider": settings.default_provider
    })

@app.get("/api/engine/status")
def get_engine_status(environment_id: Optional[str] = Query(None)):
    provider, _ = _resolve_provider_and_env(environment_id=environment_id)
    return make_response(provider.check_connection())

@app.get("/api/debug/docker")
def get_debug_docker():
    provider, _ = _resolve_provider_and_env()
    if hasattr(provider, "_service") and hasattr(provider._service, "get_debug_info"):
        return provider._service.get_debug_info()
    return {"info": "Debug information available via DockerProvider."}

@app.get("/api/dashboard")
def get_dashboard(provider: Optional[str] = Query(None), environment_id: Optional[str] = Query(None)):
    try:
        p, env = _resolve_provider_and_env(provider_name=provider, environment_id=environment_id)
        data = p.get_dashboard_stats()
        if isinstance(data, dict):
            data["environment"] = {
                "id": env.id if env else "env_default_dev",
                "name": env.name if env else "Local Docker Development",
                "env_type": env.env_type if env else "development",
                "provider_type": env.provider_type.value if env else "docker"
            }
        return make_response(data)
    except Exception as e:
        return make_response(error=str(e), success=False)

@app.get("/api/containers")
def list_containers(provider: Optional[str] = Query(None), environment_id: Optional[str] = Query(None)):
    try:
        p, env = _resolve_provider_and_env(provider_name=provider, environment_id=environment_id)
        data = p.list_workloads()
        return make_response(data)
    except Exception as e:
        return make_response(error=str(e), success=False)

@app.get("/api/container/{container_id}/inspect")
def inspect_container(container_id: str, provider: Optional[str] = Query(None), environment_id: Optional[str] = Query(None)):
    p, _ = _resolve_provider_and_env(provider_name=provider, environment_id=environment_id)
    res = p.inspect_workload(container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Container inspection failed"), success=False)
    return make_response(res.get("inspection"))

@app.post("/api/deploy")
def deploy_container(req: DeployRequest):
    if not req.image:
        return make_response(error="Image name is required", success=False)
    p, env = _resolve_provider_and_env(provider_name=req.provider, environment_id=req.environment_id)
    spec = DeploymentSpec(
        image=req.image,
        name=req.name,
        ports=req.ports,
        env=req.env,
        restart_policy=req.restart_policy or "unless-stopped",
        environment_id=env.id if env else "env_default_dev",
        provider_type=p.provider_type
    )
    res = p.deploy(spec)
    if not res.get("success"):
        return make_response(error=res.get("error", "Deployment failed"), success=False)
    return make_response(res)

@app.post("/api/container/start")
def start_container(req: ActionRequest):
    p, _ = _resolve_provider_and_env(provider_name=req.provider, environment_id=req.environment_id)
    res = p.start_workload(req.container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to start container"), success=False)
    return make_response(res)

@app.post("/api/container/stop")
def stop_container(req: ActionRequest):
    p, _ = _resolve_provider_and_env(provider_name=req.provider, environment_id=req.environment_id)
    res = p.stop_workload(req.container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to stop container"), success=False)
    return make_response(res)

@app.post("/api/container/restart")
def restart_container(req: ActionRequest):
    p, _ = _resolve_provider_and_env(provider_name=req.provider, environment_id=req.environment_id)
    res = p.restart_workload(req.container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to restart container"), success=False)
    return make_response(res)

@app.delete("/api/container/{container_id}")
def remove_container(container_id: str, provider: Optional[str] = Query(None), environment_id: Optional[str] = Query(None)):
    p, _ = _resolve_provider_and_env(provider_name=provider, environment_id=environment_id)
    res = p.remove_workload(container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to delete container"), success=False)
    return make_response(res)

@app.get("/api/logs/{container_id}")
def get_logs(container_id: str, tail: int = Query(200, ge=10, le=2000), provider: Optional[str] = Query(None), environment_id: Optional[str] = Query(None)):
    p, _ = _resolve_provider_and_env(provider_name=provider, environment_id=environment_id)
    res = p.get_logs(container_id, tail=tail)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to fetch logs"), success=False)
    return make_response(res)

@app.get("/api/stats/{container_id}")
def get_stats(container_id: str, provider: Optional[str] = Query(None), environment_id: Optional[str] = Query(None)):
    p, _ = _resolve_provider_and_env(provider_name=provider, environment_id=environment_id)
    res = p.get_telemetry(container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to fetch stats"), success=False)
    return make_response(res)

@app.get("/api/resources")
def get_resources(provider: Optional[str] = Query(None), environment_id: Optional[str] = Query(None)):
    try:
        p, _ = _resolve_provider_and_env(provider_name=provider, environment_id=environment_id)
        data = p.get_resources()
        return make_response(data)
    except Exception as e:
        return make_response(error=str(e), success=False)

@app.post("/api/cleanup")
def cleanup_resources(provider: Optional[str] = Query(None), environment_id: Optional[str] = Query(None)):
    p, _ = _resolve_provider_and_env(provider_name=provider, environment_id=environment_id)
    res = p.cleanup_resources()
    if not res.get("success"):
        return make_response(error=res.get("error", "Cleanup failed"), success=False)
    return make_response(res)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
