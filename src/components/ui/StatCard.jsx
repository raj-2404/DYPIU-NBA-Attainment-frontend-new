import React from 'react';

/**
 * StatCard - Standardized KPI & Metric display card.
 * Uses glass surface styling with theme-aware accent and status colors.
 */
export default function StatCard({
  label,
  value,
  trend,
  trendDirection = 'neutral', // 'up' | 'down' | 'neutral'
  subtitle,
  icon: IconComponent,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger'
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const variantColors = {
    primary: {
      bg: 'var(--brand-subtle)',
      color: 'var(--brand-primary)',
      border: 'rgba(37, 99, 235, 0.22)',
    },
    success: {
      bg: 'var(--status-success-bg)',
      color: 'var(--status-success)',
      border: 'var(--status-success-border)',
    },
    warning: {
      bg: 'var(--status-warning-bg)',
      color: 'var(--status-warning)',
      border: 'var(--status-warning-border)',
    },
    danger: {
      bg: 'var(--status-danger-bg)',
      color: 'var(--status-danger)',
      border: 'var(--status-danger-border)',
    },
  };

  const currentVariant = variantColors[variant] || variantColors.primary;

  return (
    <div
      className={`stat-card-glass ${className}`.trim()}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...props}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            margin: '4px 0 0',
            fontSize: 24,
            fontWeight: 900,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        {(trend || subtitle) && (
          <div
            style={{
              marginTop: 4,
              fontSize: 11.5,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color:
                trendDirection === 'up'
                  ? 'var(--status-success)'
                  : trendDirection === 'down'
                  ? 'var(--status-danger)'
                  : 'var(--text-muted)',
            }}
          >
            {trend && <span style={{ fontWeight: 800 }}>{trend}</span>}
            {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
          </div>
        )}
      </div>

      {IconComponent && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: currentVariant.bg,
            border: `1px solid ${currentVariant.border}`,
            color: currentVariant.color,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          {typeof IconComponent === 'function' ? (
            <IconComponent size={22} />
          ) : (
            IconComponent
          )}
        </div>
      )}
    </div>
  );
}
