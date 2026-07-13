import { useState } from 'react';
import { ADMIN_COLORS } from './ui';

export type AdminTab =
  | 'dashboard'
  | 'blog'
  | 'social'
  | 'calendar'
  | 'newsletter'
  | 'leads'
  | 'ai-agent'
  | 'settings';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: string;
  badge?: number;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  unreadLeads,
  blogCount,
  socialCount,
  subscriberCount,
  isMobileOpen,
  onMobileClose,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  unreadLeads: number;
  blogCount: number;
  socialCount: number;
  subscriberCount: number;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'blog', label: 'Artyku\u0142y', icon: '📝', badge: blogCount },
    { id: 'social', label: 'Social Media', icon: '📱', badge: socialCount },
    { id: 'calendar', label: 'Kalendarz', icon: '📅' },
    { id: 'newsletter', label: 'Newsletter', icon: '📧', badge: subscriberCount },
    { id: 'leads', label: 'Leady', icon: '📈', badge: unreadLeads },
    { id: 'ai-agent', label: 'Agent AI', icon: '🤖' },
    { id: 'settings', label: 'Ustawienia', icon: '\u2699\uFE0F' },
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'block',
          }}
          className="admin-overlay"
        />
      )}
      <aside
        className="admin-sidebar"
        style={{
          background: ADMIN_COLORS.bg,
          borderRight: `1px solid ${ADMIN_COLORS.border}`,
          width: '240px',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          transition: 'transform 0.3s ease',
          zIndex: 50,
        }}
        data-mobile-open={isMobileOpen}
      >
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${ADMIN_COLORS.border}` }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 800,
            background: `linear-gradient(135deg, ${ADMIN_COLORS.primary}, ${ADMIN_COLORS.accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>HRly Admin</div>
          <div style={{ fontSize: '12px', color: ADMIN_COLORS.textMuted, marginTop: '4px' }}>
            Panel zarz\u0105dzania tre\u015bci\u0105
          </div>
        </div>
        <nav style={{ padding: '12px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onMobileClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? ADMIN_COLORS.primary : 'transparent',
                  color: isActive ? 'white' : ADMIN_COLORS.textDim,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = ADMIN_COLORS.surface; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : ADMIN_COLORS.primary,
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    minWidth: '20px',
                    textAlign: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', marginTop: 'auto' }}>
          <div style={{
            fontSize: '11px',
            color: ADMIN_COLORS.textMuted,
            textAlign: 'center',
            padding: '12px',
            borderTop: `1px solid ${ADMIN_COLORS.border}`,
          }}>
            HRly v2.0 \u00B7 Supabase
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'none',
        border: 'none',
        color: ADMIN_COLORS.text,
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        fontSize: '22px',
        transition: 'background 0.2s',
        background: hovered ? ADMIN_COLORS.surface : 'transparent',
      }}
    >
      \u2630
    </button>
  );
}
