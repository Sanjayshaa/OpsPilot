import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.core.config import settings
from app.models.domain import ProviderType, DeploymentSpec
from app.providers.registry import provider_registry

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
    provider: Optional[str] = "docker"

class ActionRequest(BaseModel):
    container_id: str
    provider: Optional[str] = "docker"

def _resolve_provider(provider_name: Optional[str] = None):
    try:
        ptype = ProviderType(provider_name) if provider_name else None
        return provider_registry.get(ptype)
    except Exception:
        return provider_registry.get()

@app.get("/")
def read_root():
    provider = _resolve_provider()
    return make_response(provider.check_connection())

@app.get("/api/providers")
def list_providers():
    return make_response({
        "available_providers": provider_registry.list_providers(),
        "default_provider": settings.default_provider
    })

@app.get("/api/engine/status")
def get_engine_status():
    provider = _resolve_provider()
    return make_response(provider.check_connection())

@app.get("/api/debug/docker")
def get_debug_docker():
    provider = _resolve_provider()
    # If underlying service has debug info, expose it
    if hasattr(provider, "_service") and hasattr(provider._service, "get_debug_info"):
        return provider._service.get_debug_info()
    return {"info": "Debug information available via DockerProvider."}

@app.get("/api/dashboard")
def get_dashboard(provider: Optional[str] = Query(None)):
    try:
        p = _resolve_provider(provider)
        data = p.get_dashboard_stats()
        return make_response(data)
    except Exception as e:
        return make_response(error=str(e), success=False)

@app.get("/api/containers")
def list_containers(provider: Optional[str] = Query(None)):
    try:
        p = _resolve_provider(provider)
        data = p.list_workloads()
        return make_response(data)
    except Exception as e:
        return make_response(error=str(e), success=False)

@app.get("/api/container/{container_id}/inspect")
def inspect_container(container_id: str, provider: Optional[str] = Query(None)):
    p = _resolve_provider(provider)
    res = p.inspect_workload(container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Container inspection failed"), success=False)
    return make_response(res.get("inspection"))

@app.post("/api/deploy")
def deploy_container(req: DeployRequest):
    if not req.image:
        return make_response(error="Image name is required", success=False)
    p = _resolve_provider(req.provider)
    spec = DeploymentSpec(
        image=req.image,
        name=req.name,
        ports=req.ports,
        env=req.env,
        restart_policy=req.restart_policy or "unless-stopped"
    )
    res = p.deploy(spec)
    if not res.get("success"):
        return make_response(error=res.get("error", "Deployment failed"), success=False)
    return make_response(res)

@app.post("/api/container/start")
def start_container(req: ActionRequest):
    p = _resolve_provider(req.provider)
    res = p.start_workload(req.container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to start container"), success=False)
    return make_response(res)

@app.post("/api/container/stop")
def stop_container(req: ActionRequest):
    p = _resolve_provider(req.provider)
    res = p.stop_workload(req.container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to stop container"), success=False)
    return make_response(res)

@app.post("/api/container/restart")
def restart_container(req: ActionRequest):
    p = _resolve_provider(req.provider)
    res = p.restart_workload(req.container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to restart container"), success=False)
    return make_response(res)

@app.delete("/api/container/{container_id}")
def remove_container(container_id: str, provider: Optional[str] = Query(None)):
    p = _resolve_provider(provider)
    res = p.remove_workload(container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to delete container"), success=False)
    return make_response(res)

@app.get("/api/logs/{container_id}")
def get_logs(container_id: str, tail: int = Query(200, ge=10, le=2000), provider: Optional[str] = Query(None)):
    p = _resolve_provider(provider)
    res = p.get_logs(container_id, tail=tail)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to fetch logs"), success=False)
    return make_response(res)

@app.get("/api/stats/{container_id}")
def get_stats(container_id: str, provider: Optional[str] = Query(None)):
    p = _resolve_provider(provider)
    res = p.get_telemetry(container_id)
    if not res.get("success"):
        return make_response(error=res.get("error", "Failed to fetch stats"), success=False)
    return make_response(res)

@app.get("/api/resources")
def get_resources(provider: Optional[str] = Query(None)):
    try:
        p = _resolve_provider(provider)
        data = p.get_resources()
        return make_response(data)
    except Exception as e:
        return make_response(error=str(e), success=False)

@app.post("/api/cleanup")
def cleanup_resources(provider: Optional[str] = Query(None)):
    p = _resolve_provider(provider)
    res = p.cleanup_resources()
    if not res.get("success"):
        return make_response(error=res.get("error", "Cleanup failed"), success=False)
    return make_response(res)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
