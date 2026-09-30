from typing import Dict, Optional, List
from app.providers.base import BaseInfrastructureProvider
from app.providers.docker_provider import DockerProvider
from app.models.domain import ProviderType

class ProviderRegistry:
    """
    Central registry for all infrastructure providers in OpsPilot.
    Allows runtime resolution and pluggability of Docker, Kubernetes, Cloud, and Terraform providers.
    """

    def __init__(self):
        self._providers: Dict[ProviderType, BaseInfrastructureProvider] = {}
        self._default_provider_type: ProviderType = ProviderType.DOCKER
        self._register_defaults()

    def _register_defaults(self):
        # Register default Docker provider
        self.register(DockerProvider())

    def register(self, provider: BaseInfrastructureProvider):
        self._providers[provider.provider_type] = provider

    def get(self, provider_type: Optional[ProviderType] = None) -> BaseInfrastructureProvider:
        target = provider_type or self._default_provider_type
        if target not in self._providers:
            raise KeyError(f"Infrastructure provider '{target}' is not registered.")
        return self._providers[target]

    def list_providers(self) -> List[str]:
        return [p.value for p in self._providers.keys()]

    def set_default(self, provider_type: ProviderType):
        if provider_type not in self._providers:
            raise KeyError(f"Cannot set unregistered provider '{provider_type}' as default.")
        self._default_provider_type = provider_type

# Singleton registry instance
provider_registry = ProviderRegistry()
