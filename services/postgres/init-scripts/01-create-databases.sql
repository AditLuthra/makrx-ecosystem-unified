-- Postgres entrypoint already creates ${POSTGRES_DB}, so we skip creating databases here

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'makrx_app') THEN
        CREATE ROLE makrx_app LOGIN PASSWORD 'makrx_app_password';
    END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE makrx_ecosystem TO makrx_app;
-- Keycloak shares the same database instance; grant access only to the primary DB

-- Connect to makrx_ecosystem database to set up schemas
\c makrx_ecosystem;

-- Create schemas for each application
CREATE SCHEMA IF NOT EXISTS gateway;
CREATE SCHEMA IF NOT EXISTS makrcave;
CREATE SCHEMA IF NOT EXISTS store;
CREATE SCHEMA IF NOT EXISTS events;
CREATE SCHEMA IF NOT EXISTS shared;

-- Grant schema permissions
GRANT ALL ON SCHEMA gateway TO makrx_app;
GRANT ALL ON SCHEMA makrcave TO makrx_app;
GRANT ALL ON SCHEMA store TO makrx_app;
GRANT ALL ON SCHEMA events TO makrx_app;
GRANT ALL ON SCHEMA shared TO makrx_app;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create shared tables
CREATE TABLE IF NOT EXISTS shared.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared.user_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES shared.organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON shared.users(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON shared.users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON shared.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON shared.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON shared.user_organizations(organization_id);

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA shared TO makrx_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA shared TO makrx_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA shared GRANT ALL ON TABLES TO makrx_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared GRANT ALL ON SEQUENCES TO makrx_app;
