"""0001_initial

Revision ID: 0001_initial
Revises:
Create Date: 2025-09-05 19:11:18.019351

Initial canonical schema for makrx-events backend with
foreign keys, unique constraints, and indexes.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        'users',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('username', sa.Text()),
        sa.Column('email', sa.Text()),
        sa.Column('keycloak_id', sa.String()),
        sa.Column('first_name', sa.Text()),
        sa.Column('last_name', sa.Text()),
        sa.Column('profile_image_url', sa.Text()),
        sa.Column('role', sa.String(), server_default='user'),
        sa.Column('status', sa.String(), server_default='active'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.UniqueConstraint('email', name='uq_users_email'),
        sa.UniqueConstraint('keycloak_id', name='uq_users_keycloak_id'),
    )
    op.create_index('ix_users_status', 'users', ['status'])
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_keycloak_id', 'users', ['keycloak_id'])

    # events
    op.create_table(
        'events',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('slug', sa.Text(), nullable=False),
        sa.Column('title', sa.Text()),
        sa.Column('organizer_id', sa.String()),
        sa.Column('status', sa.String(), server_default='draft'),
        sa.Column('start_date', sa.DateTime()),
        sa.Column('end_date', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.UniqueConstraint('slug', name='uq_events_slug'),
    )
    op.create_index('ix_events_slug', 'events', ['slug'])
    op.create_index('ix_events_status', 'events', ['status'])
    op.create_index('ix_events_status_created', 'events', ['status', 'created_at'])

    # event_features
    op.create_table(
        'event_features',
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('enable_teams', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('enable_sponsors', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('enable_tournaments', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # microsites
    op.create_table(
        'microsites',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('slug', sa.Text(), nullable=False),
        sa.Column('title', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.UniqueConstraint('slug', name='uq_microsites_slug'),
    )
    op.create_index('ix_microsites_slug', 'microsites', ['slug'])

    # sub_events
    op.create_table(
        'sub_events',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('microsite_id', sa.String(), sa.ForeignKey('microsites.id', ondelete='CASCADE'), nullable=False),
        sa.Column('slug', sa.Text()),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('type', sa.String()),
        sa.Column('track', sa.String()),
        sa.Column('capacity', sa.Integer()),
        sa.Column('price', sa.Numeric()),
        sa.Column('currency', sa.String()),
        sa.Column('registration_type', sa.String()),
        sa.Column('status', sa.String(), server_default='draft'),
        sa.Column('registration_deadline', sa.DateTime()),
        sa.Column('starts_at', sa.DateTime()),
        sa.Column('ends_at', sa.DateTime()),
        sa.Column('location', sa.Text()),
        sa.Column('short_desc', sa.Text()),
        sa.Column('long_desc', sa.Text()),
        sa.Column('rules_md', sa.Text()),
        sa.Column('prizes_md', sa.Text()),
        sa.Column('waitlist', sa.Boolean()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.UniqueConstraint('microsite_id', 'slug', name='uq_sub_events_microsite_slug'),
    )
    op.create_index('ix_sub_events_microsite_id', 'sub_events', ['microsite_id'])
    op.create_index('ix_sub_events_slug', 'sub_events', ['slug'])
    op.create_index('ix_sub_events_status', 'sub_events', ['status'])

    # teams
    op.create_table(
        'teams',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_teams_event_id', 'teams', ['event_id'])

    # team_members
    op.create_table(
        'team_members',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('team_id', sa.String(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(), server_default='member'),
        sa.UniqueConstraint('team_id', 'user_id', name='uq_team_members_team_user'),
    )
    op.create_index('ix_team_members_team_id', 'team_members', ['team_id'])
    op.create_index('ix_team_members_user_id', 'team_members', ['user_id'])

    # tournaments
    op.create_table(
        'tournaments',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('format', sa.String()),
        sa.Column('status', sa.String(), server_default='scheduled'),
        sa.Column('max_participants', sa.Integer()),
        sa.Column('current_round', sa.Integer()),
        sa.Column('activity_id', sa.String()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('started_at', sa.DateTime()),
        sa.Column('completed_at', sa.DateTime()),
    )
    op.create_index('ix_tournaments_event_id', 'tournaments', ['event_id'])

    # sponsors
    op.create_table(
        'sponsors',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('tier', sa.String()),
        sa.Column('status', sa.String(), server_default='active'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.UniqueConstraint('event_id', 'name', name='uq_sponsors_event_name'),
    )
    op.create_index('ix_sponsors_event_id', 'sponsors', ['event_id'])

    # event_registrations
    op.create_table(
        'event_registrations',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='CASCADE')),
        sa.Column('microsite_id', sa.String(), sa.ForeignKey('microsites.id', ondelete='SET NULL')),
        sa.Column('sub_event_id', sa.String(), sa.ForeignKey('sub_events.id', ondelete='SET NULL')),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(), server_default='confirmed'),
        sa.Column('payment_intent_id', sa.String()),
        sa.Column('paid_at', sa.DateTime()),
        sa.Column('checked_in_at', sa.DateTime()),
        sa.Column('participant_info', sa.Text()),
        sa.Column('answers', sa.Text()),
        sa.Column('terms_accepted', sa.String()),
        sa.Column('marketing_consent', sa.String()),
        sa.Column('amount_paid', sa.String()),
        sa.Column('payment_status', sa.String()),
        sa.Column('registered_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('meta', sa.Text()),
        sa.UniqueConstraint('event_id', 'user_id', name='uq_event_registrations_event_user'),
    )
    op.create_index('ix_event_registrations_event_id', 'event_registrations', ['event_id'])
    op.create_index('ix_event_registrations_user_id', 'event_registrations', ['user_id'])
    op.create_index('ix_event_registrations_status', 'event_registrations', ['status'])

    # user_activities
    op.create_table(
        'user_activities',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_id', sa.String(), sa.ForeignKey('events.id', ondelete='SET NULL')),
        sa.Column('activity', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('meta', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_user_activities_user_id', 'user_activities', ['user_id'])
    op.create_index('ix_user_activities_event_id', 'user_activities', ['event_id'])


def downgrade() -> None:
    op.drop_index('ix_user_activities_event_id', table_name='user_activities')
    op.drop_index('ix_user_activities_user_id', table_name='user_activities')
    op.drop_table('user_activities')

    op.drop_index('ix_event_registrations_status', table_name='event_registrations')
    op.drop_index('ix_event_registrations_user_id', table_name='event_registrations')
    op.drop_index('ix_event_registrations_event_id', table_name='event_registrations')
    op.drop_table('event_registrations')

    op.drop_index('ix_sponsors_event_id', table_name='sponsors')
    op.drop_table('sponsors')

    op.drop_index('ix_tournaments_event_id', table_name='tournaments')
    op.drop_table('tournaments')

    op.drop_index('ix_team_members_user_id', table_name='team_members')
    op.drop_index('ix_team_members_team_id', table_name='team_members')
    op.drop_table('team_members')

    op.drop_index('ix_teams_event_id', table_name='teams')
    op.drop_table('teams')

    op.drop_index('ix_sub_events_status', table_name='sub_events')
    op.drop_index('ix_sub_events_slug', table_name='sub_events')
    op.drop_index('ix_sub_events_microsite_id', table_name='sub_events')
    op.drop_table('sub_events')

    op.drop_index('ix_microsites_slug', table_name='microsites')
    op.drop_table('microsites')

    op.drop_table('event_features')

    op.drop_index('ix_events_status_created', table_name='events')
    op.drop_index('ix_events_status', table_name='events')
    op.drop_index('ix_events_slug', table_name='events')
    op.drop_table('events')

    op.drop_index('ix_users_keycloak_id', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_status', table_name='users')
    op.drop_table('users')
