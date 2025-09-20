import os
import uuid

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("ENVIRONMENT", "test")

from backends.makrcave.database import get_db_session, init_db
from backends.makrcave.dependencies import CurrentUser, get_current_user
from backends.makrcave.main import app
from backends.makrcave.models.inventory import Makerspace
from backends.makrcave.models.membership_plans import (
    BillingCycle,
    MembershipPlan,
    PlanType,
)


@pytest.fixture(scope="session")
def client():
    init_db()
    return TestClient(app)


@pytest.fixture()
def fake_admin_user():
    return CurrentUser(
        user_id="test-admin",
        email="admin@example.com",
        first_name="Admin",
        last_name="User",
        makerspace_id="",
        roles=["admin"],
        model=None,
    )


@pytest.fixture()
def seed_makerspace_and_plan(fake_admin_user):
    session = get_db_session()
    try:
        makerspace_id = str(uuid.uuid4())
        ms = Makerspace(id=makerspace_id, name="Test Makerspace")
        session.add(ms)
        session.flush()

        # Create Membership plan (UUID PK)
        plan = MembershipPlan(
            makerspace_id=uuid.UUID(makerspace_id),
            name="Basic",
            description="Basic plan",
            plan_type=PlanType.BASIC,
            price=0.0,
            currency="USD",
            billing_cycle=BillingCycle.MONTHLY,
            access_type=None,
            is_active=True,
            is_public=True,
        )
        session.add(plan)
        session.commit()
        return makerspace_id, str(plan.id)
    finally:
        session.close()


@pytest.fixture()
def auth_override(fake_admin_user):
    def _override():
        return fake_admin_user

    app.dependency_overrides[get_current_user] = _override
    yield
    app.dependency_overrides = {}
