"""Legacy notification CRUD shim.

The unified codebase still imports `crud.notifications`, but the real implementation
is pending. For now we provide no-op placeholders so the FastAPI app can
initialise. Individual endpoints will fail fast if these stubs are invoked.
"""

from __future__ import annotations

from typing import Any


class _NotImplementedNotificationStub(RuntimeError):
    pass


def _stub(*_: Any, **__: Any) -> None:
    raise _NotImplementedNotificationStub(
        "Notification CRUD is not available in this build"
    )


create_notification = _stub
process_notification = _stub
create_bulk_notifications = _stub
process_bulk_notifications = _stub
get_notifications = _stub
get_unread_summary = _stub
get_notification_stats = _stub
get_notification = _stub
update_notification = _stub
mark_as_read = _stub
mark_all_as_read = _stub
delete_notification = _stub
create_template = _stub
get_templates = _stub
update_template = _stub
render_template = _stub
get_user_preferences = _stub
create_user_preferences = _stub
update_user_preferences = _stub
register_push_token = _stub
create_rule = _stub
get_rules = _stub
update_rule = _stub
delete_rule = _stub
get_analytics = _stub
send_test_notification = _stub
get_system_health = _stub
create_export_request = _stub
process_export = _stub
register_websocket_connection = _stub
unregister_websocket_connection = _stub
generate_digest_preview = _stub
