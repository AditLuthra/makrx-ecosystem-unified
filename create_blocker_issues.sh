#!/usr/bin/env bash
set -euo pipefail

REPO="AditLuthra/makrx-ecosystem-unified"
ASSIGNEE="${ASSIGNEE:-}"
MILESTONE="${MILESTONE:-}"

gh label create "priority: high"        --color FF8C00 --description "High priority hardening" --repo "$REPO" || true
gh label create "area: frontend"        --color 006B75 --description "Web apps"                --repo "$REPO" || true
gh label create "area: ci"              --color 5319E7 --description "Continuous Integration"  --repo "$REPO" || true
gh label create "area: observability"   --color 1D76DB --description "Logs/metrics/tracing"    --repo "$REPO" || true
gh label create "area: docs"            --color D4C5F9 --description "Documentation"           --repo "$REPO" || true

mk () {
  gh issue create --repo "$REPO" --title "$1" --body "$2" \
    --label "$3" ${ASSIGNEE:+--assignee "$ASSIGNEE"} ${MILESTONE:+--milestone "$MILESTONE"}
}

mk "Pin Docker image tags; run as non-root; add healthchecks" $'**Tasks**\n- Pin all images (no `latest`).\n- Add `USER` non-root in Dockerfiles; read-only FS where possible.\n- Add `HEALTHCHECK` to every service.\n- Separate public vs internal Docker networks.\n\n**Done**: Compose/K8s show pinned tags, non-root users, healthchecks green.' \
"priority: high,area: infra,area: security"

mk "Readiness/Liveness checks + startup gating for backends" $'**Tasks**\n- `/healthz` + DB/Redis checks in each FastAPI.\n- K8s/Compose health probes wired.\n- App waits for DB migrations before serving.\n\n**Done**: Probes pass; no traffic before DB ready.' \
"priority: high,area: backend,area: infra"

mk "Harden Nginx security headers (HSTS, CSP, etc.)" $'**Tasks**\n- Add HSTS, X-Frame-Options, Referrer-Policy, X-Content-Type-Options.\n- Nonced CSP compatible with Next.js.\n- Rate-limit `/auth/*` and `/api/*`.\n\n**Done**: Security headers verified via `curl -I` and observability.\n' \
"priority: high,area: security,area: infra,area: frontend"

mk "Keycloak: separate realms per env + token policies" $'**Tasks**\n- Distinct realms for dev/stage/prod.\n- Short-lived access tokens; refresh reuse detection.\n- Export realm JSON (without secrets) to infra.\n\n**Done**: Realm exports present; policies applied.' \
"priority: high,area: auth,area: security"

mk "Strict CORS + schema validation (FastAPI)" $'**Tasks**\n- Allow list exact origins; no `*`.\n- Pydantic models reject unknown fields.\n\n**Done**: Requests from unexpected origins blocked; validation errors logged.' \
"priority: high,area: backend,area: security"

mk "Structured logs + correlation IDs across stack" $'**Tasks**\n- JSON logs with request IDs in Nginx, backends, and FE proxy.\n- Propagate `x-correlation-id` header end-to-end.\n\n**Done**: Single request traceable across services in logs.' \
"priority: high,area: observability,area: infra"

mk "Prometheus metrics & SLO dashboards" $'**Tasks**\n- Expose HTTP latency/error metrics; DB pool stats; Redis ops.\n- Dashboards for p95/p99; alerting on SLO burn.\n\n**Done**: Grafana boards live; alerts firing to channel.' \
"priority: high,area: observability,area: infra"

mk "SAST/SCA in CI (Trivy/Grype) + strict lint/typecheck" $'**Tasks**\n- Add image & filesystem scans to CI, fail on critical vulns.\n- Enforce `eslint --max-warnings=0` and `tsc --noEmit` in CI.\n\n**Done**: CI fails on vulns/lint/type errors.' \
"priority: high,area: ci,area: security,area: devex"

mk "CI gates on PRs to main: lint/type/build/test" $'**Tasks**\n- Require green checks for PR merge.\n- Add minimal e2e smoke against docker-compose.\n\n**Done**: Branch protection enabled; CI pipeline visible and green.' \
"priority: high,area: ci"

mk "Docs: align paths; add high-level architecture diagram" $'**Tasks**\n- Fix mentions of deprecated `nginx/` path.\n- Add one-page diagram (apps, backends, KC, DB, Redis, MinIO, Nginx).\n\n**Done**: README reflects reality; diagram checked into `docs/`.' \
"priority: high,area: docs"

echo "✅ Created high-priority issues in $REPO"
