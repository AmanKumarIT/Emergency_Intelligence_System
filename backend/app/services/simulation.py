"""
Simulation service — generates fake real-time data for demo purposes
when no live camera or video file is available.
"""
import time
import random
from typing import Dict, Any, List
from app.core.config import settings


class SimulationService:
    def __init__(self):
        self._running = False
        self._tick = 0

    def generate_heatmap(self) -> Dict[str, int]:
        """Return a random zone density map that looks realistic."""
        self._tick += 1
        densities = {}
        for r in range(settings.GRID_ROWS):
            for c in range(settings.GRID_COLS):
                # Simulate a "hotspot" that drifts
                base = random.randint(0, 4)
                # Centre zones are denser
                if r == 1 and c == 1:
                    base += random.randint(3, 8)
                # Periodic surge
                if self._tick % 20 < 5:
                    base += random.randint(2, 6)
                densities[f"Zone_{r}_{c}"] = base
        return densities

    def generate_alerts(self, densities: Dict[str, int]) -> List[Dict[str, Any]]:
        """Quick rule check on simulated densities."""
        from app.services.decision_engine import decision_engine
        return decision_engine.analyze(densities)

    def generate_scenario(self, scenario: str = "normal") -> Dict[str, Any]:
        """
        Pre-built scenarios for demo:
          - "normal"   : low-density across all zones
          - "crowded"  : several zones above warning
          - "panic"    : multiple zones at critical + directional chaos
        """
        now = time.time()
        densities = {}
        alerts = []

        if scenario == "panic":
            for r in range(settings.GRID_ROWS):
                for c in range(settings.GRID_COLS):
                    densities[f"Zone_{r}_{c}"] = random.randint(
                        settings.DENSITY_CRITICAL - 2,
                        settings.DENSITY_CRITICAL + 10
                    )
            # Force critical alerts
            from app.services.decision_engine import decision_engine
            # Reset cooldowns so alerts fire
            decision_engine._cooldowns.clear()
            alerts = decision_engine.analyze(densities)

        elif scenario == "crowded":
            for r in range(settings.GRID_ROWS):
                for c in range(settings.GRID_COLS):
                    densities[f"Zone_{r}_{c}"] = random.randint(
                        settings.DENSITY_WARNING - 2,
                        settings.DENSITY_CRITICAL + 2
                    )
            from app.services.decision_engine import decision_engine
            decision_engine._cooldowns.clear()
            alerts = decision_engine.analyze(densities)

        else:  # normal
            for r in range(settings.GRID_ROWS):
                for c in range(settings.GRID_COLS):
                    densities[f"Zone_{r}_{c}"] = random.randint(0, settings.DENSITY_WARNING - 1)

        return {
            "scenario": scenario,
            "timestamp": now,
            "zone_densities": densities,
            "alerts": alerts,
        }


simulation_service = SimulationService()
