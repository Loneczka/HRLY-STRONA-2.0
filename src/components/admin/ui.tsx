import type { ReactNode, CSSProperties } from 'react';
export const ADMIN_COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  border: '#334155',
  text: '#f1f5f9',
  textDim: '#94a3b8',
  textMuted: '#64748b',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  accent: '#06b6d4',
};

export function AdminButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  style,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const variants: Record<string, CSSProperties> = {
    primary: { background: ADMIN_COLORS.primary, color: 'white' },
    secondary: { background: ADMIN_COLORS.surfaceLight, color: ADMIN_COLORS.text },
    ghost: { background: 'transparent', color: ADMIN_COLORS.textDim, border: `1px solid ${ADMIN_COLORS.border}` },
    danger: { background: ADMIN_COLORS.error, color: 'white' },
    success: { background: ADMIN_COLORS.success, color: 'white' },
  };
  const sizes: Record<string, CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 18px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        border: 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontWeight: 600,
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function AdminInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  style,
  onKeyDown,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  style?: CSSProperties;
  onKeyDown?: (e: { key: string; preventDefault: () => void }) => void;
  autoFocus?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      style={{
        background: ADMIN_COLORS.bg,
        border: `1px solid ${ADMIN_COLORS.border}`,
        borderRadius: '8px',
        padding: '10px 14px',
        color: ADMIN_COLORS.text,
        fontSize: '14px',
        width: '100%',
        transition: 'border-color 0.2s',
        ...style,
      }}
      onFocus={(e) => { e.target.style.borderColor = ADMIN_COLORS.primary; }}
      onBlur={(e) => { e.target.style.borderColor = ADMIN_COLORS.border; }}
    />
  );
}

export function AdminTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  style?: CSSProperties;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        background: ADMIN_COLORS.bg,
        border: `1px solid ${ADMIN_COLORS.border}`,
        borderRadius: '8px',
        padding: '10px 14px',
        color: ADMIN_COLORS.text,
        fontSize: '14px',
        width: '100%',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.6,
        transition: 'border-color 0.2s',
        ...style,
      }}
      onFocus={(e) => { e.target.style.borderColor = ADMIN_COLORS.primary; }}
      onBlur={(e) => { e.target.style.borderColor = ADMIN_COLORS.border; }}
    />
  );
}

export function AdminLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <label style={{
      display: 'block',
      fontSize: '13px',
      fontWeight: 600,
      color: ADMIN_COLORS.textDim,
      marginBottom: '6px',
      ...style,
    }}>
      {children}
    </label>
  );
}

export function AdminCard({ children, style, onClick, ...rest }: { children: ReactNode; style?: CSSProperties; onClick?: () => void } & Record<string, unknown>) {
  return (
    <div
      onClick={onClick}
      style={{
        background: ADMIN_COLORS.surface,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${ADMIN_COLORS.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, color = 'primary' }: { children: ReactNode; color?: 'primary' | 'success' | 'warning' | 'error' | 'gray' | 'accent' }) {
  const colors: Record<string, string> = {
    primary: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    gray: '#64748b',
    accent: '#06b6d4',
  };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      background: `${colors[color]}22`,
      color: colors[color],
      border: `1px solid ${colors[color]}44`,
    }}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, subtitle, action }: { icon: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      color: ADMIN_COLORS.textMuted,
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ color: ADMIN_COLORS.text, fontSize: '18px', marginBottom: '8px' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: '14px', marginBottom: '20px' }}>{subtitle}</p>}
      {action}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Potwierd\u017a',
  cancelText = 'Anuluj',
  danger = false,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: ADMIN_COLORS.surface,
        borderRadius: '16px',
        padding: '28px',
        maxWidth: '440px',
        width: '100%',
        border: `1px solid ${ADMIN_COLORS.border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <h3 style={{ color: ADMIN_COLORS.text, fontSize: '18px', marginBottom: '12px' }}>{title}</h3>
        <p style={{ color: ADMIN_COLORS.textDim, fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <AdminButton variant="ghost" onClick={onCancel}>{cancelText}</AdminButton>
          <AdminButton variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmText}</AdminButton>
        </div>
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 600,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: ADMIN_COLORS.surface,
        borderRadius: '16px',
        padding: '28px',
        maxWidth: `${maxWidth}px`,
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        border: `1px solid ${ADMIN_COLORS.border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: ADMIN_COLORS.text, fontSize: '18px' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: ADMIN_COLORS.textMuted,
            cursor: 'pointer',
            fontSize: '24px',
            lineHeight: 1,
          }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
