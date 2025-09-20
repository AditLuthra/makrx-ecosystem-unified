#!/usr/bin/env bash
set -euo pipefail

# Import a Keycloak realm JSON using the Admin REST API via kcadm.sh
# Prereqs: Keycloak installed with kcadm.sh available or running in the keycloak container.
# Usage:
#   KC_URL=${KC_URL:-http://localhost:8081}
#   REALM_FILE=services/keycloak/realm-config/makrx-realm.json
#   ./services/keycloak/import_realm.sh "$REALM_FILE"

REALM_FILE=${1:-}
if [[ -z "$REALM_FILE" || ! -f "$REALM_FILE" ]]; then
  echo "Usage: $0 <realm-json-file>" >&2
  exit 2
fi

KC_URL=${KC_URL:-http://localhost:8081}
KC_USER=${KC_USER:-admin}
KC_PASS=${KC_PASS:-admin}

if ! command -v kcadm.sh >/dev/null 2>&1; then
  echo "kcadm.sh not found. Run this inside the Keycloak container or add Keycloak bin to PATH." >&2
  exit 3
fi

kcadm.sh config credentials --server "$KC_URL" --realm master --user "$KC_USER" --password "$KC_PASS"

# Try to create realm; if exists, update
REALM_NAME=$(jq -r '.realm' < "$REALM_FILE")
if [[ -z "$REALM_NAME" || "$REALM_NAME" == "null" ]]; then
  echo "Invalid realm file: missing .realm" >&2
  exit 4
fi

echo "Importing realm: $REALM_NAME from $REALM_FILE"
# Keycloak lacks a simple PUT for realm import; use create with overwrite flags when available.
# As a fallback, delete then create.
set +e
kcadm.sh create realms -f "$REALM_FILE" 2>/tmp/kc_err.log
RC=$?
set -e
if [[ $RC -ne 0 ]]; then
  echo "Create failed, attempting update..." >&2
  kcadm.sh update realms/$REALM_NAME -f "$REALM_FILE"
fi

echo "Realm import completed for $REALM_NAME"
