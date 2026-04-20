"""
WebSocket connection manager — maintains a set of active clients and
provides helpers to broadcast JSON messages.
"""
import json
from typing import Any, Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self._connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self._connections:
            self._connections.remove(ws)

    @property
    def count(self) -> int:
        return len(self._connections)

    async def broadcast(self, message: Dict[str, Any]):
        """Send a JSON payload to every connected client."""
        payload = json.dumps(message)
        dead: List[WebSocket] = []
        for ws in self._connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    async def send_personal(self, ws: WebSocket, message: Dict[str, Any]):
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            self.disconnect(ws)


ws_manager = ConnectionManager()
