import React from 'react';

/**
 * Button - Standardized iOS-styled interactive button primitive.
 * Supports primary, secondary, outline, danger, and ghost variants with size options.
 */
export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: IconComponent,
  disabled = false,
  loading = false,
  className = '',
  style = {},
  type = 'button',
  ...props
}) {
  const sizeStyles = {
    sm: { height: 32, padding: '0 10px', fontSize: 12, borderRadius: 8 },
    md: { height: 40, padding: '0 16px', fontSize: 13, borderRadius: 10 },
    lg: { height: 46, padding: '0 20px', fontSize: 14, borderRadius: 12 },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const variantClass =
    variant === 'primary'
      ? 'glass-btn-primary'
      : variant === 'secondary'
      ? 'glass-btn-secondary'
      : variant === 'danger'
      ? 'glass-btn-danger'
      : variant === 'outline'
      ? 'glass-btn-secondary'
      : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`glass-btn ${variantClass} ${className}`.trim()}
      style={{
        ...currentSize,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : IconComponent ? (
        typeof IconComponent === 'function' ? (
          <IconComponent size={size === 'sm' ? 14 : 16} />
        ) : (
          IconComponent
        )
      ) : null}
      {children}
    </button>
  );
}
