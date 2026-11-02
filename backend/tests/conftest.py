import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
os.environ["TESTING"] = "1"
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.services.auth_service import get_password_hash, create_access_token

# SQLite in-memory with StaticPool shares connection across threads safely in FastAPI
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app, raise_server_exceptions=True)
    yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    user = db_session.query(User).filter(User.email == "test_dispatcher@delivery.com").first()
    if not user:
        user = User(
            email="test_dispatcher@delivery.com",
            hashed_password=get_password_hash("testpassword123"),
            full_name="Test Dispatcher",
            role="dispatcher",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(data={"sub": test_user.email, "role": test_user.role, "id": test_user.id})
    return {"Authorization": f"Bearer {token}"}
