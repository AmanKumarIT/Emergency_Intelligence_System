"""
Decision Engine — rule-based anomaly detection with cooldown logic.

Inputs : per-zone person counts
Outputs: list of alert dicts ready for WebSocket broadcast
"""
import time
from typing import Dict, Any, List
from app.core.config import settings


class DecisionEngine:
    def __init__(self):
        self.DENSITY_WARNING = settings.DENSITY_WARNING
        self.DENSITY_CRITICAL = settings.DENSITY_CRITICAL
        self._cooldowns: Dict[str, float] = {}
        self.COOLDOWN_SECS = 15  # suppress duplicate alerts for this long

    def analyze(self, zone_densities: Dict[str, int]) -> List[Dict[str, Any]]:
        alerts: List[Dict[str, Any]] = []
        now = time.time()

        for zone, count in zone_densities.items():
            level = None
            action = ""

            if count >= self.DENSITY_CRITICAL:
                level = "critical"
                action = f"CRITICAL congestion in {zone} ({count} people). Immediately reroute crowd and dispatch staff."
            elif count >= self.DENSITY_WARNING:
                level = "warning"
                action = f"Elevated density in {zone} ({count} people). Monitor closely; prepare to open alternative exits."

            if level is not None:
                key = f"{zone}_{level}"
                last = self._cooldowns.get(key, 0)
                if now - last > self.COOLDOWN_SECS:
                    alerts.append({
                        "id": f"alert-{int(now * 1000)}-{zone}",
                        "timestamp": now,
                        "zone": zone,
                        "level": level,
                        "count": count,
                        "action": action,
                    })
                    self._cooldowns[key] = now

        return alerts

    def simulate_alert(self, zone: str, level: str) -> Dict[str, Any]:
        """Create a manual/simulated alert (bypasses cooldown)."""
        now = time.time()
        actions = {
            "critical": f"SIMULATED critical alert for {zone}. Dispatch emergency team.",
            "warning": f"SIMULATED warning for {zone}. Increase monitoring.",
            "info": f"SIMULATED info for {zone}. Routine check.",
        }
        return {
            "id": f"sim-{int(now * 1000)}-{zone}",
            "timestamp": now,
            "zone": zone,
            "level": level,
            "count": 0,
            "action": actions.get(level, f"Simulated {level} alert for {zone}"),
            "simulated": True,
        }


decision_engine = DecisionEngine()
