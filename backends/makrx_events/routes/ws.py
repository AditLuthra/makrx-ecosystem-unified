from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Set

router = APIRouter()

connections: Set[WebSocket] = set()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connections.add(ws)
    try:
        while True:
            msg = await ws.receive_text()
            # Broadcast simple echo to all clients
            for conn in list(connections):
                try:
                    await conn.send_text(msg)
                except Exception:
                    try:
                        connections.remove(conn)
                    except KeyError:
                        pass
    except WebSocketDisconnect:
        pass
    finally:
        connections.discard(ws)
