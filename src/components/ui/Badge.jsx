import React from 'react';

/**
 * Badge - Standardized status pill badge with glassmorphism styling.
 */
export default function Badge({
  children,
  variant = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  className = '',
  style = {},
  dot = false,
  ...props
}) {
  const variantClasses = {
    success: 'glass-badge-success',
    warning: 'glass-badge-warning',
    danger: 'glass-badge-danger',
    info: 'glass-badge-info',
    neutral: '',
  };

  const badgeClass = variantClasses[variant] ?? variantClasses.info;

  return (
    <span
      className={`glass-badge ${badgeClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
}
