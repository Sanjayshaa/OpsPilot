from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from app.models.domain import ProviderType, DeploymentSpec

class BaseInfrastructureProvider(ABC):
    """
    Abstract Infrastructure Provider Interface.
    Enables OpsPilot to be infrastructure-agnostic across Docker, Kubernetes, Terraform, and Cloud.
    """

    @property
    @abstractmethod
    def provider_type(self) -> ProviderType:
        """Returns the specific provider type."""
        pass

    @abstractmethod
    def check_connection(self) -> Dict[str, Any]:
        """Verify provider health, connectivity status, and version metadata."""
        pass

    @abstractmethod
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Aggregate high-level health, workload counts, and host resource utilization."""
        pass

    @abstractmethod
    def list_workloads(self) -> List[Dict[str, Any]]:
        """List active and stopped workloads (containers/pods/services)."""
        pass

    @abstractmethod
    def inspect_workload(self, workload_id: str) -> Dict[str, Any]:
        """Fetch granular inspection metadata for a workload."""
        pass

    @abstractmethod
    def deploy(self, spec: DeploymentSpec) -> Dict[str, Any]:
        """Instantiate and start a new workload specification."""
        pass

    @abstractmethod
    def start_workload(self, workload_id: str) -> Dict[str, Any]:
        """Start a stopped workload."""
        pass

    @abstractmethod
    def stop_workload(self, workload_id: str) -> Dict[str, Any]:
        """Stop a running workload."""
        pass

    @abstractmethod
    def restart_workload(self, workload_id: str) -> Dict[str, Any]:
        """Restart an active workload."""
        pass

    @abstractmethod
    def remove_workload(self, workload_id: str) -> Dict[str, Any]:
        """Terminate and remove a workload."""
        pass

    @abstractmethod
    def get_logs(self, workload_id: str, tail: int = 200) -> Dict[str, Any]:
        """Fetch stdout/stderr log stream for a workload."""
        pass

    @abstractmethod
    def get_telemetry(self, workload_id: str) -> Dict[str, Any]:
        """Fetch live resource telemetry (CPU, RAM, Net I/O)."""
        pass

    @abstractmethod
    def get_resources(self) -> Dict[str, Any]:
        """List provider-managed infrastructure artifacts (images, volumes, networks)."""
        pass

    @abstractmethod
    def cleanup_resources(self) -> Dict[str, Any]:
        """Prune unused or dangling provider resources."""
        pass
