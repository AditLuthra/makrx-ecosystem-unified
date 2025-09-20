# Auth Contract: Keycloak configuration

This document defines the unified environment variables and expectations for Keycloak authentication across the MakrX ecosystem (frontends and backends).

## Env variables

Backends (FastAPI):

- KEYCLOAK_URL: Base URL to Keycloak (e.g., http://localhost:8081)
- KEYCLOAK_REALM: Realm name (e.g., makrx)
- KEYCLOAK_CLIENT_ID: This service's audience (client) the tokens are issued for
- KEYCLOAK_ISSUER: Optional override, defaults to `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`
- KEYCLOAK_VERIFY_AUD: true/false to enforce `aud` claim equals KEYCLOAK_CLIENT_ID
- KEYCLOAK_USE_JWKS: true/false to fetch keys from JWKS endpoint (recommended true)
- KEYCLOAK_PK_TTL_SECONDS: cache time for Keycloak public key/JWKS

Frontends (Next.js):

- NEXT_PUBLIC_KEYCLOAK_URL: Base URL to Keycloak
- NEXT_PUBLIC_KEYCLOAK_REALM: Realm name
- NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: Public client ID used by SPA
- NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI: Optional explicit redirect URI (defaults handled in code)
- NEXT_PUBLIC_KEYCLOAK_POST_LOGOUT_REDIRECT_URI: Optional post-logout redirect

## Local development defaults

We align all apps and services to these defaults when running via docker-compose:

- KEYCLOAK_URL / NEXT_PUBLIC_KEYCLOAK_URL = http://localhost:8081
- KEYCLOAK_REALM / NEXT_PUBLIC_KEYCLOAK_REALM = makrx
- Backend API client IDs (audience):
  - makrcave backend: KEYCLOAK_CLIENT_ID=makrcave-api (verify_aud true)
  - events backend: KEYCLOAK_CLIENT_ID=makrx-events-api
  - services backend: KEYCLOAK_CLIENT_ID=makrx-services-api
- Frontend SPA client IDs:
  - makrcave frontend: NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrcave
  - gateway frontend: NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrx-gateway-frontend
  - events frontend: NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrx-events

Note: Frontend SPA and backend API typically use separate client IDs. If KEYCLOAK_VERIFY_AUD=true on a backend, ensure the token being sent has `aud` that matches the backend's KEYCLOAK_CLIENT_ID (e.g., when using service-to-service or exchanging tokens).

## Issuer and JWKS

- Issuer is `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}` by default. All JWTs should have `iss` set to this value.
- JWKS endpoint is `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs` and is used to verify signatures when KEYCLOAK_USE_JWKS=true.

## Token roles and scopes

- Realm roles are in `realm_access.roles`
- Client roles for a given client (e.g., KEYCLOAK_CLIENT_ID) are in `resource_access[CLIENT_ID].roles`
- Frontends may use `openid profile email` scopes during authorization.

## Required setup in Keycloak

- Create public client for each frontend (e.g., makrcave), with redirect URIs including:
  - http://localhost:5000/\* for local dev (adjust per app)
- Create confidential/client credentials client for each backend API (e.g., makrcave-api) if you plan to do token exchanges or service-to-service calls.
- Assign realm and client roles as needed; the backends interpret roles from realm_access and resource_access.

## Examples

MakrCave frontend `.env.local` example:

```
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=makrx
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrcave
```

MakrCave backend `.env` example:

```
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=makrx
KEYCLOAK_CLIENT_ID=makrcave-api
KEYCLOAK_ISSUER=http://localhost:8081/realms/makrx
KEYCLOAK_VERIFY_AUD=true
KEYCLOAK_USE_JWKS=true
KEYCLOAK_PK_TTL_SECONDS=3600
```

## Notes

- If you see 401 with audience errors, check that the token `aud` matches KEYCLOAK_CLIENT_ID configured on the backend verifying it.
- For production, use HTTPS for KEYCLOAK_URL and configure CORS and redirect URIs accordingly.
