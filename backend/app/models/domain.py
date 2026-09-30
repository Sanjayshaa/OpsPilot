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

class EnvironmentType(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    CUSTOM = "custom"

class EnvironmentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PROVISIONING = "provisioning"
    ERROR = "error"
    DELETING = "deleting"

class HealthStatus(str, Enum):
    UNKNOWN = "unknown"
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"

class Environment(BaseModel):
    id: str
    project_id: str
    name: str
    env_type: str = EnvironmentType.DEVELOPMENT.value
    provider_type: ProviderType = ProviderType.DOCKER
    provider_connection_id: Optional[str] = None
    provider_config: Dict[str, Any] = Field(default_factory=dict)
    status: str = EnvironmentStatus.ACTIVE.value
    health_status: str = HealthStatus.UNKNOWN.value
    is_default: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class Project(BaseModel):
    id: str
    name: str
    description: str = ""
    is_default: bool = False
    environments: List[Environment] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    id: Optional[str] = None

class EnvironmentCreateRequest(BaseModel):
    name: str
    env_type: Optional[str] = EnvironmentType.DEVELOPMENT.value
    provider_type: Optional[ProviderType] = ProviderType.DOCKER
    provider_connection_id: Optional[str] = None
    provider_config: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = False

class Workload(BaseModel):
    id: str
    name: str
    image: str
    status: WorkloadStatus = WorkloadStatus.UNKNOWN
    provider_type: ProviderType = ProviderType.DOCKER
    environment_id: Optional[str] = "env_default_dev"
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

class DeploymentSpec(BaseModel):
    image: str
    name: Optional[str] = None
    ports: Optional[Dict[str, str]] = None
    env: Optional[Dict[str, str]] = None
    restart_policy: Optional[str] = "unless-stopped"
    environment_id: Optional[str] = "env_default_dev"
    provider_type: Optional[ProviderType] = ProviderType.DOCKER

class ExecutionResult(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None
