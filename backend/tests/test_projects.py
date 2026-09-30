import pytest
import os
from fastapi.testclient import TestClient

from main import app
from app.db.database import get_db_path, init_db, get_db_connection
from app.repositories.project_repository import project_repository, sanitize_provider_config
from app.models.domain import ProviderType, EnvironmentType

client = TestClient(app)

def test_db_initialization_and_default_seed():
    db_path = get_db_path()
    assert os.path.exists(db_path)

    # Verify default project
    prj = project_repository.get_project("prj_default")
    assert prj is not None
    assert prj.name == "Default Workspace"
    assert prj.is_default is True

    # Verify default environment
    env = project_repository.get_environment("env_default_dev")
    assert env is not None
    assert env.name == "Local Docker Development"
    assert env.project_id == "prj_default"
    assert env.provider_type == ProviderType.DOCKER
    assert env.is_default is True

    # Verify staging/production were NOT auto-created
    envs = project_repository.list_environments("prj_default")
    env_names = [e.name for e in envs]
    assert "Staging" not in env_names
    assert "Production" not in env_names

def test_sensitive_config_sanitization():
    raw_config = {
        "socket_path": "/var/run/docker.sock",
        "api_key": "secret123",
        "password": "mypassword",
        "auth_token": "tokenxyz",
        "timeout": 30
    }
    sanitized = sanitize_provider_config(raw_config)
    assert "socket_path" in sanitized
    assert "timeout" in sanitized
    assert "api_key" not in sanitized
    assert "password" not in sanitized
    assert "auth_token" not in sanitized

def test_project_crud_and_protection():
    # 1. Create project
    create_res = client.post("/api/projects", json={
        "name": "Test Platform",
        "description": "Platform for automated integration testing"
    })
    assert create_res.status_code == 200
    p_data = create_res.json()
    assert p_data["success"] is True
    project_id = p_data["data"]["id"]
    assert project_id.startswith("prj_")
    assert p_data["data"]["name"] == "Test Platform"

    # 2. Get project
    get_res = client.get(f"/api/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == project_id

    # 3. List projects
    list_res = client.get("/api/projects")
    assert list_res.status_code == 200
    projects = list_res.json()["data"]
    assert any(p["id"] == project_id for p in projects)

    # 4. Attempt to delete default project (Must be rejected)
    del_default_res = client.delete("/api/projects/prj_default")
    assert del_default_res.status_code == 200
    assert del_default_res.json()["success"] is False
    assert "protected" in del_default_res.json()["error"].lower()

    # 5. Delete created project
    del_res = client.delete(f"/api/projects/{project_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

def test_environment_crud_and_protection():
    # 1. Create custom environment under prj_default
    create_res = client.post("/api/projects/prj_default/environments", json={
        "name": "QA Testing",
        "env_type": "staging",
        "provider_type": "docker",
        "provider_config": {"socket_path": "/var/run/docker.sock", "password": "omit"}
    })
    assert create_res.status_code == 200
    e_data = create_res.json()
    assert e_data["success"] is True
    env_id = e_data["data"]["id"]
    assert e_data["data"]["name"] == "QA Testing"
    # Verify sensitive password was excluded
    assert "password" not in e_data["data"]["provider_config"]

    # 2. Get environment details
    get_res = client.get(f"/api/environments/{env_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == env_id

    # 3. List environments for project
    list_res = client.get("/api/projects/prj_default/environments")
    assert list_res.status_code == 200
    envs = list_res.json()["data"]
    assert any(e["id"] == env_id for e in envs)

    # 4. Attempt to delete default development environment (Must be rejected)
    del_default_res = client.delete("/api/environments/env_default_dev")
    assert del_default_res.status_code == 200
    assert del_default_res.json()["success"] is False
    assert "protected" in del_default_res.json()["error"].lower()

    # 5. Delete created custom environment
    del_res = client.delete(f"/api/environments/{env_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

def test_existing_docker_api_regression():
    # 1. Dashboard without environment_id (defaults to env_default_dev)
    dash_res = client.get("/api/dashboard")
    assert dash_res.status_code == 200
    d_json = dash_res.json()
    assert d_json["success"] is True
    assert "containers" in d_json["data"]
    assert d_json["data"]["environment"]["id"] == "env_default_dev"

    # 2. Dashboard with explicit environment_id
    dash_env_res = client.get("/api/dashboard?environment_id=env_default_dev")
    assert dash_env_res.status_code == 200
    assert dash_env_res.json()["success"] is True

    # 3. Containers list
    cont_res = client.get("/api/containers")
    assert cont_res.status_code == 200
    assert cont_res.json()["success"] is True
    assert isinstance(cont_res.json()["data"], list)

    # 4. Providers list
    prov_res = client.get("/api/providers")
    assert prov_res.status_code == 200
    assert "docker" in prov_res.json()["data"]["available_providers"]
