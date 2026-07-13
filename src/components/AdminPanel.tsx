import { useState, useEffect } from 'react';
import { useSiteConfig, DEFAULT_CONFIG } from '../hooks/useSiteConfig';
import { ToastProvider } from './admin/Toast';
import { AdminSidebar, MobileMenuButton, type AdminTab } from './admin/Sidebar';
import { DashboardTab } from './admin/DashboardTab';
import { BlogTab } from './admin/BlogTab';
import { SocialTab } from './admin/SocialTab';
import { CalendarTab } from './admin/CalendarTab';
import { NewsletterTab } from './admin/NewsletterTab';
import { LeadsTab } from './admin/LeadsTab';
import { AIAgentTab } from './admin/AIAgentTab';
import { SettingsTab } from './admin/SettingsTab';
import { ADMIN_COLORS, AdminButton, AdminInput } from './admin/ui';

export function AdminPanel() {
  return (
    <ToastProvider>
      <AdminPanelInner />
    </ToastProvider>
  );
}

function AdminPanelInner() {
  const { config, updateConfig } = useSiteConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const authed = sessionStorage.getItem('hrly_admin_authed') === 'true';
    if (authed) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (password === config.global.adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('hrly_admin_authed', 'true');
      setPassword('');
      setAuthError('');
    } else {
      setAuthError('Nieprawid\u0142owe has\u0142o');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hrly_admin_authed');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${ADMIN_COLORS.bg}, #1a1a2e)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: ADMIN_COLORS.surface,
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          border: `1px solid ${ADMIN_COLORS.border}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '40px',
              fontWeight: 800,
              background: `linear-gradient(135deg, ${ADMIN_COLORS.primary}, ${ADMIN_COLORS.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px',
            }}>HRly Admin</div>
            <div style={{ color: ADMIN_COLORS.textDim, fontSize: '14px' }}>
              Panel zarz\u0105dzania tre\u015Bci\u0105
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <AdminInput
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Has\u0142o administratora"
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              autoFocus
            />
          </div>
          {authError && (
            <div style={{ color: ADMIN_COLORS.error, fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              {authError}
            </div>
          )}
          <AdminButton onClick={handleLogin} style={{ width: '100%', justifyContent: 'center' }}>
            Zaloguj si\u0119
          </AdminButton>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => {
                setIsAuthenticated(true);
                sessionStorage.setItem('hrly_admin_authed', 'true');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: ADMIN_COLORS.textMuted,
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Demo: pomi\u0144 logowanie
            </button>
          </div>
        </div>
      </div>
    );
  }

  const unreadLeads = config.leads.filter((l) => !l.read).length;
  const blogCount = config.blogPosts.length;
  const allSocialPosts = config.blogPosts.flatMap((p) => p.socialPosts);
  const socialCount = allSocialPosts.length;
  const subscriberCount = config.subscribers.length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: ADMIN_COLORS.bg }}>
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadLeads={unreadLeads}
        blogCount={blogCount}
        socialCount={socialCount}
        subscriberCount={subscriberCount}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          background: ADMIN_COLORS.surface,
          borderBottom: `1px solid ${ADMIN_COLORS.border}`,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MobileMenuButton onClick={() => setMobileSidebarOpen(true)} />
            <h1 style={{
              color: ADMIN_COLORS.text,
              fontSize: '18px',
              fontWeight: 700,
              margin: 0,
            }}>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'blog' && 'Artyku\u0142y'}
              {activeTab === 'social' && 'Social Media'}
              {activeTab === 'calendar' && 'Kalendarz'}
              {activeTab === 'newsletter' && 'Newsletter'}
              {activeTab === 'leads' && 'Leady'}
              {activeTab === 'ai-agent' && 'Agent AI'}
              {activeTab === 'settings' && 'Ustawienia'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="/"
              target="_blank"
              style={{
                color: ADMIN_COLORS.textDim,
                fontSize: '13px',
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${ADMIN_COLORS.border}`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = ADMIN_COLORS.text; e.currentTarget.style.borderColor = ADMIN_COLORS.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ADMIN_COLORS.textDim; e.currentTarget.style.borderColor = ADMIN_COLORS.border; }}
            >
              Otw\u00F3rz stron\u0119 \u2197
            </a>
            <AdminButton variant="ghost" size="sm" onClick={handleLogout}>
              Wyloguj
            </AdminButton>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardTab config={config} onTabChange={setActiveTab} />}
          {activeTab === 'blog' && <BlogTab config={config} updateConfig={updateConfig} />}
          {activeTab === 'social' && <SocialTab config={config} updateConfig={updateConfig} />}
          {activeTab === 'calendar' && <CalendarTab config={config} onTabChange={setActiveTab} />}
          {activeTab === 'newsletter' && <NewsletterTab config={config} updateConfig={updateConfig} />}
          {activeTab === 'leads' && <LeadsTab config={config} updateConfig={updateConfig} />}
          {activeTab === 'ai-agent' && <AIAgentTab config={config} updateConfig={updateConfig} />}
          {activeTab === 'settings' && <SettingsTab config={config} updateConfig={updateConfig} />}
        </main>
      </div>
    </div>
  );
}
