export default function StatsBar({ densities, alertCount, wsConnected, videoSource }) {
  const totalPeople = Object.values(densities).reduce((s, v) => s + v, 0);
  const maxZone = Object.entries(densities).reduce(
    (max, [k, v]) => (v > max.count ? { zone: k, count: v } : max),
    { zone: '-', count: 0 }
  );

  const stats = [
    {
      icon: '👥',
      value: totalPeople,
      label: 'Total People',
      color: 'var(--accent-blue)',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      icon: '⚠️',
      value: alertCount,
      label: 'Active Alerts',
      color: alertCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
      bg: alertCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
    },
    {
      icon: '📍',
      value: maxZone.count,
      label: `Hotspot: ${maxZone.zone.replace('Zone_', '').replace('_', ',')}`,
      color: maxZone.count >= 10 ? 'var(--accent-red)' : 'var(--accent-yellow)',
      bg: maxZone.count >= 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
    },
    {
      icon: '📡',
      value: videoSource === 'mock' ? 'Simulated' : 'Live',
      label: 'Video Source',
      color: 'var(--accent-cyan)',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
  ];

  return (
    <div className="stats-bar animate-fade-in">
      {stats.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
            {s.icon}
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
