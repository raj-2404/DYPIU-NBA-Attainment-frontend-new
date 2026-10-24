import React from 'react';

/**
 * EmptyState - Clean, theme-aware empty state presentation card.
 */
export default function EmptyState({
  title = 'No Data Available',
  description = 'There are no records matching your selected parameters.',
  icon: IconComponent,
  action,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`glass-card ${className}`.trim()}
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        ...style,
      }}
    >
      {IconComponent && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'var(--brand-subtle)',
            color: 'var(--brand-primary)',
            border: '1px solid rgba(37, 99, 235, 0.22)',
            display: 'grid',
            placeItems: 'center',
            marginBottom: 4,
          }}
        >
          {typeof IconComponent === 'function' ? <IconComponent size={26} /> : IconComponent}
        </div>
      )}
      <div style={{ maxWidth: 440 }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
          {title}
        </h4>
        {description && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
