#!/usr/bin/env python3
"""
Minimal smoke test for admin endpoint with Keycloak token.

Usage:
  export API_BASE=http://localhost:8001/api/v1
  export TOKEN="<bearer token>"
  python backends/makrcave/scripts/smoke_admin_ping.py

Returns non-zero exit if request fails or status != 200.
"""
import json
import os
import sys
import urllib.error
import urllib.request

API_BASE = os.getenv("API_BASE", "http://localhost:8001/api/v1")
TOKEN = os.getenv("TOKEN")
URL = f"{API_BASE}/analytics/dashboard"

if not TOKEN:
    print(
        "ERROR: TOKEN env var not set. Please set a valid Bearer token.",
        file=sys.stderr,
    )
    sys.exit(2)

req = urllib.request.Request(URL)
req.add_header("Authorization", f"Bearer {TOKEN}")
req.add_header("Accept", "application/json")

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        status = resp.getcode()
        body = resp.read().decode("utf-8")
        print(f"Status: {status}")
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            print("ERROR: Response is not valid JSON")
            sys.exit(3)
        # Print a brief summary
        ok = data.get("success") is True or "data" in data
        summary = data.get("data", {})
        dashboard_keys = list(summary.keys())[:5]
        print(f"Keys: {dashboard_keys}")
        if status == 200 and ok:
            sys.exit(0)
        else:
            print("ERROR: Unexpected response payload", data)
            sys.exit(4)
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} {e.reason}", file=sys.stderr)
    try:
        print(e.read().decode("utf-8"), file=sys.stderr)
    except Exception:
        pass
    sys.exit(5)
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(6)
