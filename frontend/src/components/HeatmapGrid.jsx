export default function HeatmapGrid({ densities }) {
  const getDensityClass = (count) => {
    if (count >= 10) return 'density-critical';
    if (count >= 5) return 'density-high';
    if (count >= 2) return 'density-medium';
    return 'density-low';
  };

  // Build ordered 3x3 grid
  const zones = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const key = `Zone_${r}_${c}`;
      zones.push({ key, count: densities[key] || 0 });
    }
  }

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon cyan">🗺</div>
          <span className="card-title">Density Heatmap</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>3×3 Grid</span>
      </div>
      <div className="card-body">
        <div className="heatmap-grid">
          {zones.map((zone) => (
            <div
              key={zone.key}
              className={`heatmap-cell ${getDensityClass(zone.count)}`}
              title={`${zone.key}: ${zone.count} people`}
            >
              <span className="zone-label">{zone.key.replace('Zone_', '').replace('_', ',')}</span>
              <span className="zone-count">{zone.count}</span>
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px',
          marginTop: '12px', fontSize: '0.68rem', color: 'var(--text-muted)'
        }}>
          <span><span style={{ color: 'var(--accent-green)' }}>●</span> Low</span>
          <span><span style={{ color: 'var(--accent-yellow)' }}>●</span> Medium</span>
          <span><span style={{ color: 'var(--accent-orange)' }}>●</span> High</span>
          <span><span style={{ color: 'var(--accent-red)' }}>●</span> Critical</span>
        </div>
      </div>
    </div>
  );
}
