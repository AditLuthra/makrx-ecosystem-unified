"""0002_domain_constraints

Revision ID: 0002_domain_constraints
Revises: 0001_initial
Create Date: 2025-09-06 00:00:00

Add DB-level domain constraints for statuses, roles and slug patterns
to align with code-level expectations.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0002_domain_constraints"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        # SQLite lacks ALTER TABLE ADD CONSTRAINT; skip checks in tests
        return
    # Enforce lowercase/slug pattern for slugs (events, microsites, sub_events)
    op.create_check_constraint(
        "ck_events_slug_pattern", "events", "slug ~ '^[a-z0-9-]+'"
    )
    op.create_check_constraint(
        "ck_microsites_slug_pattern", "microsites", "slug ~ '^[a-z0-9-]+'"
    )
    op.create_check_constraint(
        "ck_sub_events_slug_pattern",
        "sub_events",
        "slug IS NULL OR slug ~ '^[a-z0-9-]+'",
    )

    # Enumerated status/role checks
    op.create_check_constraint(
        "ck_events_status", "events", "status IN ('draft','published')"
    )
    op.create_check_constraint(
        "ck_sub_events_status",
        "sub_events",
        "status IN ('draft','published','closed','cancelled')",
    )
    op.create_check_constraint(
        "ck_sponsors_status", "sponsors", "status IN ('active','inactive')"
    )
    op.create_check_constraint(
        "ck_tournaments_status",
        "tournaments",
        "status IN ('scheduled','ongoing','completed','cancelled')",
    )
    op.create_check_constraint(
        "ck_team_members_role",
        "team_members",
        "role IN ('member','admin','owner')",
    )
    op.create_check_constraint(
        "ck_event_registrations_status",
        "event_registrations",
        "status IN ('confirmed','pending','cancelled','checked_in')",
    )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        return
    op.drop_constraint(
        "ck_event_registrations_status", "event_registrations", type_="check"
    )
    op.drop_constraint("ck_team_members_role", "team_members", type_="check")
    op.drop_constraint("ck_tournaments_status", "tournaments", type_="check")
    op.drop_constraint("ck_sponsors_status", "sponsors", type_="check")
    op.drop_constraint("ck_sub_events_status", "sub_events", type_="check")
    op.drop_constraint("ck_sub_events_slug_pattern", "sub_events", type_="check")
    op.drop_constraint("ck_microsites_slug_pattern", "microsites", type_="check")
    op.drop_constraint("ck_events_status", "events", type_="check")
    op.drop_constraint("ck_events_slug_pattern", "events", type_="check")
