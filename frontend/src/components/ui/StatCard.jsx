const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: IconComponent,
  color = '#f59e0b',
}) => {
  const changeColor = changeType === 'increase' ? '#10b981'
    : changeType === 'decrease' ? '#ef4444' : '#94a3b8';
  const changeSymbol = changeType === 'increase' ? '↑'
    : changeType === 'decrease' ? '↓' : '→';

  return (
    <div
      className="stat-card"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>{title}</div>
          <div style={{ color, fontSize: 28, fontWeight: 700 }}>{value}</div>
        </div>
        {IconComponent && (
          <div style={{
            padding: 10, borderRadius: 12,
            background: `${color}22`, color,
          }}>
            <IconComponent size={22} />
          </div>
        )}
      </div>

      {change && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: `${changeColor}20`, color: changeColor,
        }}>
          {changeSymbol} {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;
