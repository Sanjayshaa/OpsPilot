import os
from pydantic import BaseModel
from typing import List

class Settings(BaseModel):
    app_name: str = "OpsPilot — Multi-Agent AI DevOps & Cloud Operations Platform"
    app_version: str = "2.0.0"
    api_prefix: str = "/api"
    default_provider: str = os.getenv("DEFAULT_PROVIDER", "docker")
    docker_host: str = os.getenv("DOCKER_HOST", "/var/run/docker.sock")
    cors_origins: List[str] = ["*"]
    debug: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

settings = Settings()
