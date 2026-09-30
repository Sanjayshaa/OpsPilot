from typing import Dict, List, Any, Optional
from app.providers.base import BaseInfrastructureProvider
from app.models.domain import ProviderType, DeploymentSpec
from docker_service import docker_service

class DockerProvider(BaseInfrastructureProvider):
    """
    Docker Infrastructure Provider implementation.
    Delegates to the production-tested DockerService with built-in resilient mock fallbacks.
    """

    def __init__(self, service=None):
        self._service = service or docker_service

    @property
    def provider_type(self) -> ProviderType:
        return ProviderType.DOCKER

    def check_connection(self) -> Dict[str, Any]:
        return self._service.get_connection_status()

    def get_dashboard_stats(self) -> Dict[str, Any]:
        return self._service.get_dashboard_stats()

    def list_workloads(self) -> List[Dict[str, Any]]:
        return self._service.list_containers()

    def inspect_workload(self, workload_id: str) -> Dict[str, Any]:
        return self._service.inspect_container(workload_id)

    def deploy(self, spec: DeploymentSpec) -> Dict[str, Any]:
        return self._service.deploy_container(
            image=spec.image,
            name=spec.name,
            ports=spec.ports,
            env=spec.env,
            restart_policy=spec.restart_policy or "unless-stopped"
        )

    def start_workload(self, workload_id: str) -> Dict[str, Any]:
        return self._service.start_container(workload_id)

    def stop_workload(self, workload_id: str) -> Dict[str, Any]:
        return self._service.stop_container(workload_id)

    def restart_workload(self, workload_id: str) -> Dict[str, Any]:
        return self._service.restart_container(workload_id)

    def remove_workload(self, workload_id: str) -> Dict[str, Any]:
        return self._service.remove_container(workload_id)

    def get_logs(self, workload_id: str, tail: int = 200) -> Dict[str, Any]:
        return self._service.get_container_logs(workload_id, tail=tail)

    def get_telemetry(self, workload_id: str) -> Dict[str, Any]:
        return self._service.get_container_stats(workload_id)

    def get_resources(self) -> Dict[str, Any]:
        return self._service.get_docker_resources()

    def cleanup_resources(self) -> Dict[str, Any]:
        return self._service.prune_resources()
