import { useState, useEffect, useRef } from 'react';

export default function AlertPanel({ alerts }) {
  const listRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to top on new alerts
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [alerts]);

  const formatTime = (ts) => {
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString('en-US', { hour12: false });
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      default: return '🔵';
    }
  };

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon red">⚠</div>
          <span className="card-title">Alerts</span>
        </div>
        <span className="card-badge live" style={{ opacity: alerts.length > 0 ? 1 : 0.4 }}>
          {alerts.length} active
        </span>
      </div>
      <div className="card-body">
        <div className="alert-list" ref={listRef}>
          {alerts.length === 0 ? (
            <div className="alert-empty">
              <div className="alert-empty-icon">✅</div>
              <div>No active alerts — all zones nominal</div>
            </div>
          ) : (
            alerts.map((alert, i) => (
              <div
                key={alert.id || i}
                className={`alert-item ${alert.level}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`alert-severity-dot ${alert.level}`}></div>
                <div className="alert-content">
                  <div className="alert-title">
                    {getLevelIcon(alert.level)} {alert.zone} — {alert.level.toUpperCase()}
                    {alert.simulated && <span style={{ color: 'var(--accent-purple)', marginLeft: 6, fontSize: '0.7rem' }}>SIM</span>}
                  </div>
                  <div className="alert-action">{alert.action}</div>
                  <div className="alert-time">{formatTime(alert.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
