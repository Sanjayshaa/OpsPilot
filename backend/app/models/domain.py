from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ProviderType(str, Enum):
    DOCKER = "docker"
    KUBERNETES = "kubernetes"
    TERRAFORM = "terraform"
    CLOUD = "cloud"

class WorkloadStatus(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    PENDING = "pending"
    FAILED = "failed"
    UNKNOWN = "unknown"

class Workload(BaseModel):
    id: str
    name: str
    image: str
    status: WorkloadStatus = WorkloadStatus.UNKNOWN
    provider_type: ProviderType = ProviderType.DOCKER
    ports: Dict[str, Any] = Field(default_factory=dict)
    env_vars: Dict[str, str] = Field(default_factory=dict)
    created_at: Optional[str] = None
    labels: Dict[str, str] = Field(default_factory=dict)

class HostStats(BaseModel):
    cpu_percent: float = 0.0
    ram_used_mb: float = 0.0
    ram_total_mb: float = 0.0
    ram_percent: float = 0.0
    disk_used_gb: float = 0.0
    disk_total_gb: float = 0.0
    disk_percent: float = 0.0

class Environment(BaseModel):
    id: str
    name: str
    project_id: str
    env_type: str = "development" # development, staging, production
    default_provider: ProviderType = ProviderType.DOCKER
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Project(BaseModel):
    id: str
    name: str
    description: str = ""
    environments: List[Environment] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class DeploymentSpec(BaseModel):
    image: str
    name: Optional[str] = None
    ports: Optional[Dict[str, str]] = None
    env: Optional[Dict[str, str]] = None
    restart_policy: Optional[str] = "unless-stopped"
    environment_id: Optional[str] = "default"
    provider_type: Optional[ProviderType] = ProviderType.DOCKER

class ExecutionResult(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None
