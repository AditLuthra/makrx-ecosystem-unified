# Keycloak Setup (Unified)

This folder contains the Keycloak realm configuration for the unified MakrX ecosystem.

## Contents

- `realm-config/makrx-realm.json` – realm `makrx` with roles, users, frontend clients, and API clients.
  - Frontend clients (confidential):
    - `makrx-gateway-frontend`, `makrx-gateway-frontend-hacker`, `makrx-makrcave`, `makrx-store`, `makrx-events`
  - API clients (bearer-only):
    - `makrcave-api`, `makrx-store-api`, `makrx-events-api`
  - Audience mappers on frontend clients to include API audiences in tokens.

## Run Locally (Dev)

```
# Bring up deps
docker compose up -d postgres redis keycloak

# Verify Keycloak
curl -sf http://localhost:8081/health/ready
curl -sf http://localhost:8081/realms/makrx/.well-known/openid-configuration
curl -sf http://localhost:8081/realms/makrx/protocol/openid-connect/certs
```

## Reverse Proxy (Prod)

- Keycloak runs behind Nginx at `auth.makrx.org` with `KC_PROXY=edge` and `KC_HOSTNAME=auth.makrx.org`.
- Compose: `docker-compose.prod.yml` under `services.keycloak`.

## Frontend Env (Dev)

- Compose injects Next public envs so clients point to Keycloak:
  - `NEXT_PUBLIC_KEYCLOAK_URL=http://keycloak:8080`
  - `NEXT_PUBLIC_KEYCLOAK_REALM=makrx`
  - `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=<clientId>`

## Backend Env

- Validate tokens with issuer/audience:
  - `KEYCLOAK_URL=http://keycloak:8080`
  - `KEYCLOAK_REALM=makrx`
  - `KEYCLOAK_CLIENT_ID=<api-clientId>` (e.g., `makrcave-api`)
  - `KEYCLOAK_ISSUER=http://keycloak:8080/realms/makrx`

## Token Checks

- Tokens issued to frontend clients include API audiences via protocol mappers.
- Backends verify via JWKS and `iss`/`aud` checks (MakrCave: python-jose; Events: jose).

## Notes

- If you change client IDs, update:
  - realm JSON and Compose envs for frontends (`NEXT_PUBLIC_*`) and backends (`KEYCLOAK_CLIENT_ID`).
- For pure SPA clients, consider `publicClient=true` + PKCE.
