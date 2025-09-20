#!/usr/bin/env python3
"""
Local development seed script for MakrCave backend

Creates a default makerspace, membership plan, and an admin member.

Usage (from repo root or backends/makrcave):

  export DATABASE_URL=postgresql://makrx:password@localhost:5433/makrx_ecosystem
  python makrx-ecosystem-unified/backends/makrcave/seed.py

or

  cd makrx-ecosystem-unified/backends/makrcave
  python seed.py

The script is idempotent and will not create duplicates on rerun.
"""

import os
import sys
import uuid
from datetime import datetime

from dotenv import load_dotenv

from backends.makrcave.database import get_db_session, init_db  # type: ignore
from backends.makrcave.models.enhanced_member import (  # type: ignore
    Member,
    MemberRole,
    MemberStatus,
)
from backends.makrcave.models.inventory import (
    InventoryItem,
    ItemStatus,
    Makerspace,
    SupplierType,
)  # type: ignore
from backends.makrcave.models.membership_plans import (  # type: ignore
    AccessType,
    BillingCycle,
    MembershipPlan,
    PlanType,
)
from backends.makrcave.models.notifications import (  # type: ignore
    NotificationChannel,
    NotificationPriority,
    NotificationTemplate,
    NotificationType,
)

load_dotenv()

try:
    # Allow running from repo root
    sys.path.append(
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    )
except Exception:
    pass


def get_or_create_makerspace(session) -> Makerspace:
    ms = session.query(Makerspace).first()
    if ms:
        return ms
    ms_id = str(uuid.uuid4())
    ms = Makerspace(
        id=ms_id,
        name="Dev Makerspace",
        location="Local",
        description="Seeded makerspace",
    )
    session.add(ms)
    session.commit()
    return ms


def get_or_create_plan(session, makerspace_uuid: uuid.UUID) -> MembershipPlan | None:
    try:
        plan = (
            session.query(MembershipPlan)
            .filter(
                MembershipPlan.name == "Basic",
                MembershipPlan.makerspace_id == makerspace_uuid,
            )
            .first()
        )
        if plan:
            return plan
        plan = MembershipPlan(
            makerspace_id=makerspace_uuid,
            name="Basic",
            description="Basic developer plan",
            plan_type=PlanType.BASIC,
            price=0.0,
            currency="USD",
            billing_cycle=BillingCycle.MONTHLY,
            access_type=AccessType.UNLIMITED,
            is_active=True,
            is_public=True,
        )
        session.add(plan)
        session.commit()
        session.refresh(plan)
        return plan
    except Exception as e:
        # If FK types mismatch (e.g., makerspaces.id not UUID), skip plan seeding
        print(f"[warn] Skipping MembershipPlan seed due to: {e}")
        session.rollback()
        return None


def get_or_create_admin(
    session, makerspace_uuid: uuid.UUID, plan: MembershipPlan | None
) -> Member:
    admin = session.query(Member).filter(Member.email == "admin@example.com").first()
    if admin:
        return admin
    admin = Member(
        keycloak_user_id="seed-admin",
        email="admin@example.com",
        first_name="Dev",
        last_name="Admin",
        role=MemberRole.ADMIN,
        status=MemberStatus.ACTIVE,
        membership_plan_id=str(plan.id) if plan else None,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow(),
        makerspace_id=makerspace_uuid,
        is_active=True,
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


def get_or_create_inventory_item(
    session, makerspace_id_str: str, admin_id: str
) -> InventoryItem | None:
    item = (
        session.query(InventoryItem)
        .filter(InventoryItem.product_code == "PLA-175")
        .first()
    )
    if item:
        return item
    try:
        item = InventoryItem(
            id=f"ITEM-{uuid.uuid4().hex[:8].upper()}",
            name="PLA Filament 1.75mm",
            category="Materials",
            subcategory="Filament",
            quantity=5,
            unit="roll",
            min_threshold=1,
            location="Storage A",
            status=ItemStatus.ACTIVE,
            supplier_type=SupplierType.MAKRX,
            product_code="PLA-175",
            linked_makerspace_id=makerspace_id_str,
            created_by=admin_id,
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        return item
    except Exception as e:
        print(f"[warn] Skipping InventoryItem seed due to: {e}")
        session.rollback()
        return None


def get_or_create_notification_template(
    session, makerspace_uuid: uuid.UUID, admin_uuid: uuid.UUID
) -> NotificationTemplate | None:
    tpl = (
        session.query(NotificationTemplate)
        .filter(
            NotificationTemplate.template_name == "inventory_low_stock_default",
            NotificationTemplate.notification_type
            == NotificationType.INVENTORY_LOW_STOCK,
        )
        .first()
    )
    if tpl:
        return tpl
    try:
        tpl = NotificationTemplate(
            makerspace_id=makerspace_uuid,
            template_name="inventory_low_stock_default",
            notification_type=NotificationType.INVENTORY_LOW_STOCK,
            channel=NotificationChannel.IN_APP,
            language="en",
            title_template="Low stock: {{ item_name }}",
            message_template=(
                "{{ item_name }} is low ({{ current }} {{ unit }}) at {{ location }}."
            ),
            is_active=True,
            is_default=True,
            priority=NotificationPriority.HIGH,
            required_variables=["item_name", "current", "unit", "location"],
            created_by=admin_uuid,
        )
        session.add(tpl)
        session.commit()
        session.refresh(tpl)
        return tpl
    except Exception as e:
        print(f"[warn] Skipping NotificationTemplate seed due to: {e}")
        session.rollback()
        return None


def main() -> None:
    # Safety guard: avoid seeding in production unless explicitly allowed
    if os.getenv("ENVIRONMENT", "development").lower() == "production" and os.getenv(
        "SEED_ALLOW_PROD", "false"
    ).lower() not in (
        "1",
        "true",
        "yes",
    ):
        print(
            "[seed] Refusing to run: ENVIRONMENT=production. "
            "Set SEED_ALLOW_PROD=true to override."
        )
        sys.exit(1)
    print("[seed] Initializing database (apply metadata if needed)...")
    init_db()
    session = get_db_session()
    try:
        ms = get_or_create_makerspace(session)
        # enhanced_member.Member expects UUID for makerspace_id; convert
        makerspace_uuid = (
            uuid.UUID(str(ms.id)) if not isinstance(ms.id, uuid.UUID) else ms.id
        )
        plan = get_or_create_plan(session, makerspace_uuid)
        admin = get_or_create_admin(session, makerspace_uuid, plan)
        # Seed inventory item and notification template
        inv = get_or_create_inventory_item(session, str(ms.id), str(admin.id))
        tpl = get_or_create_notification_template(
            session, makerspace_uuid, uuid.UUID(str(admin.id))
        )
        print("[seed] Done.")
        print(f"  Makerspace: {ms.id} ({ms.name})")
        if plan:
            print(f"  Plan: {plan.id} ({plan.name})")
        else:
            print("  Plan: skipped (see warning above)")
        print(f"  Admin: {admin.email} (id={admin.id})")
        if inv:
            print(f"  Inventory Item: {inv.id} ({inv.name})")
        else:
            print("  Inventory Item: skipped (see warning above)")
        if tpl:
            print(f"  Notification Template: {tpl.id} ({tpl.template_name})")
        else:
            print("  Notification Template: skipped (see warning above)")
    finally:
        session.close()


if __name__ == "__main__":
    main()
