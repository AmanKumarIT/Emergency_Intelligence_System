export default function SystemStatus({ status, wsConnected }) {
  const getOverallStatus = () => {
    if (!status || status.status !== 'online') return 'critical';
    return 'normal';
  };

  const overall = getOverallStatus();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div className={`system-status-badge ${overall}`}>
        <div className={`status-dot ${overall}`}></div>
        {overall === 'normal' ? 'System Online' : 'System Offline'}
      </div>
      <div className="ws-status">
        <div className={`ws-dot ${wsConnected ? 'connected' : 'disconnected'}`}></div>
        {wsConnected ? 'WS Connected' : 'WS Disconnected'}
      </div>
      {status?.services && (
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>DB: {status.services.mongodb}</span>
          <span>•</span>
          <span>Cache: {status.services.redis}</span>
        </div>
      )}
    </div>
  );
}
