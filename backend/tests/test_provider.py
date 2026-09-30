import pytest
from fastapi.testclient import TestClient

from main import app
from app.providers.registry import provider_registry, ProviderRegistry
from app.providers.base import BaseInfrastructureProvider
from app.providers.docker_provider import DockerProvider
from app.models.domain import ProviderType, DeploymentSpec

client = TestClient(app)

def test_provider_registry():
    providers = provider_registry.list_providers()
    assert "docker" in providers
    docker_provider = provider_registry.get(ProviderType.DOCKER)
    assert isinstance(docker_provider, DockerProvider)
    assert docker_provider.provider_type == ProviderType.DOCKER

def test_docker_provider_methods():
    provider = provider_registry.get(ProviderType.DOCKER)
    status = provider.check_connection()
    assert isinstance(status, dict)

    stats = provider.get_dashboard_stats()
    assert isinstance(stats, dict)

    containers = provider.list_workloads()
    assert isinstance(containers, list)

    resources = provider.get_resources()
    assert isinstance(resources, dict)

def test_api_providers_endpoint():
    res = client.get("/api/providers")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert "docker" in json_data["data"]["available_providers"]

def test_api_dashboard_endpoint():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert "containers" in json_data["data"]

def test_api_containers_endpoint():
    res = client.get("/api/containers")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert isinstance(json_data["data"], list)

def test_api_resources_endpoint():
    res = client.get("/api/resources")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert "images" in json_data["data"]

def test_api_deploy_validation():
    # Deploy without image should gracefully fail validation
    res = client.post("/api/deploy", json={"image": ""})
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is False
    assert "required" in json_data["error"]
