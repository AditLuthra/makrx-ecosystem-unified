"""add_missing_schema_fields_and_tables

Revision ID: 52c517067797
Revises: 0002_domain_constraints
Create Date: 2025-09-18 22:50:35.292374

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '52c517067797'
down_revision = '0002_domain_constraints'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add missing fields to teams table
    op.add_column('teams', sa.Column('description', sa.Text()))
    op.add_column('teams', sa.Column('max_members', sa.Integer()))
    op.add_column('teams', sa.Column('captain_id', sa.String(), sa.ForeignKey('users.id', ondelete='SET NULL')))
    op.add_column('teams', sa.Column('status', sa.String(), server_default='active'))
    op.add_column('teams', sa.Column('invite_code', sa.String()))
    op.add_column('teams', sa.Column('avatar', sa.Text()))

    # Add missing fields to team_members table
    op.add_column('team_members', sa.Column('status', sa.String(), server_default='active'))
    op.add_column('team_members', sa.Column('joined_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')))

    # Add missing field to event_registrations table
    op.add_column('event_registrations', sa.Column('format', sa.String()))

    # Create event_roles table
    op.create_table(
        'event_roles',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('permissions', sa.Text()),
        sa.Column('assigned_by', sa.String(), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('assigned_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
        sa.UniqueConstraint('event_id', 'user_id', 'role', name='uq_event_roles_event_user_role'),
    )
    op.create_index('ix_event_roles_event_id', 'event_roles', ['event_id'])
    op.create_index('ix_event_roles_user_id', 'event_roles', ['user_id'])

    # Create push_subscriptions table
    op.create_table(
        'push_subscriptions',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('endpoint', sa.Text(), nullable=False),
        sa.Column('p256dh', sa.Text(), nullable=False),
        sa.Column('auth', sa.Text(), nullable=False),
        sa.Column('user_agent', sa.Text()),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_push_subscriptions_user_id', 'push_subscriptions', ['user_id'])

    # Create announcements table
    op.create_table(
        'announcements',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('send_push_notification', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('content', sa.Text()),
        sa.Column('priority', sa.String(), server_default='normal'),
        sa.Column('target_audience', sa.Text()),
        sa.Column('status', sa.String(), server_default='draft'),
        sa.Column('scheduled_at', sa.DateTime()),
        sa.Column('sent_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_announcements_event_id', 'announcements', ['event_id'])
    op.create_index('ix_announcements_status', 'announcements', ['status'])

    # Create qr_codes table
    op.create_table(
        'qr_codes',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('code', sa.String(), nullable=False, unique=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='CASCADE')),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('data', sa.Text()),
        sa.Column('expires_at', sa.DateTime()),
        sa.Column('used_at', sa.DateTime()),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_qr_codes_code', 'qr_codes', ['code'])
    op.create_index('ix_qr_codes_user_id', 'qr_codes', ['user_id'])
    op.create_index('ix_qr_codes_event_id', 'qr_codes', ['event_id'])

    # Create payments table (assuming this is for transactions)
    op.create_table(
        'payments',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('registration_id', sa.String(), sa.ForeignKey('event_registrations.id', ondelete='SET NULL')),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='SET NULL')),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(), server_default='USD'),
        sa.Column('status', sa.String(), server_default='pending'),
        sa.Column('payment_method', sa.String()),
        sa.Column('transaction_id', sa.String()),
        sa.Column('payment_intent_id', sa.String()),
        sa.Column('metadata', sa.Text()),
        sa.Column('processed_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_payments_registration_id', 'payments', ['registration_id'])
    op.create_index('ix_payments_user_id', 'payments', ['user_id'])
    op.create_index('ix_payments_status', 'payments', ['status'])


def downgrade() -> None:
    # Drop payments table
    op.drop_index('ix_payments_status', table_name='payments')
    op.drop_index('ix_payments_user_id', table_name='payments')
    op.drop_index('ix_payments_registration_id', table_name='payments')
    op.drop_table('payments')

    # Drop qr_codes table
    op.drop_index('ix_qr_codes_event_id', table_name='qr_codes')
    op.drop_index('ix_qr_codes_user_id', table_name='qr_codes')
    op.drop_index('ix_qr_codes_code', table_name='qr_codes')
    op.drop_table('qr_codes')

    # Drop announcements table
    op.drop_index('ix_announcements_status', table_name='announcements')
    op.drop_index('ix_announcements_event_id', table_name='announcements')
    op.drop_table('announcements')

    # Drop push_subscriptions table
    op.drop_index('ix_push_subscriptions_user_id', table_name='push_subscriptions')
    op.drop_table('push_subscriptions')

    # Drop event_roles table
    op.drop_index('ix_event_roles_user_id', table_name='event_roles')
    op.drop_index('ix_event_roles_event_id', table_name='event_roles')
    op.drop_table('event_roles')

    # Remove added columns from event_registrations
    op.drop_column('event_registrations', 'format')

    # Remove added columns from team_members
    op.drop_column('team_members', 'joined_at')
    op.drop_column('team_members', 'status')

    # Remove added columns from teams
    op.drop_column('teams', 'avatar')
    op.drop_column('teams', 'invite_code')
    op.drop_column('teams', 'status')
    op.drop_column('teams', 'captain_id')
    op.drop_column('teams', 'max_members')
    op.drop_column('teams', 'description')
