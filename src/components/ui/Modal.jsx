import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal - Reusable iOS-styled modal dialog.
 * Handles backdrop click, ESC key, scroll-locking, and glass styling.
 */
export default function Modal({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 560,
  className = '',
  style = {},
}) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        display: 'grid',
        placeItems: 'center',
        padding: '20px',
        backgroundColor: 'var(--modal-backdrop)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className={`glass-modal ${className}`.trim()}
        style={{
          width: '100%',
          maxWidth,
          boxSizing: 'border-box',
          padding: 24,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: 12.5,
                  color: 'var(--text-muted)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-primary)',
                color: 'var(--text-muted)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div style={{ color: 'var(--text-primary)', fontSize: 13.5 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10,
              paddingTop: 12,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
