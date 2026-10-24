import React from 'react';

/**
 * GlassCard - Reusable iOS-inspired glassmorphism card container.
 * Theme-aware via CSS variables and .glass-card token.
 */
export default function GlassCard({
  children,
  title,
  subtitle,
  actions,
  className = '',
  style = {},
  padding = 20,
  ...props
}) {
  return (
    <div
      className={`glass-card ${className}`.trim()}
      style={{
        padding,
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
