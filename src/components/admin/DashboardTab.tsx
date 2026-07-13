import { ADMIN_COLORS, AdminCard, Badge } from './ui';
import type { SiteConfig } from '../../hooks/useSiteConfig';
import type { AdminTab } from './Sidebar';

export function DashboardTab({
  config,
  onTabChange,
}: {
  config: SiteConfig;
  onTabChange: (tab: AdminTab) => void;
}) {
  const publishedPosts = config.blogPosts.filter((p) => p.status === 'published');
  const draftPosts = config.blogPosts.filter((p) => p.status === 'draft');
  const scheduledPosts = config.blogPosts.filter((p) => p.status === 'scheduled');
  const unreadLeads = config.leads.filter((l) => !l.read).length;
  const starredLeads = config.leads.filter((l) => l.starred).length;
  const allSocialPosts = config.blogPosts.flatMap((p) => p.socialPosts);
  const scheduledSocial = allSocialPosts.filter((s) => s.status === 'scheduled' || s.status === 'approved');

  const stats = [
    { label: 'Opublikowane artyku\u0142y', value: publishedPosts.length, icon: '📝', color: ADMIN_COLORS.success, tab: 'blog' as AdminTab },
    { label: 'Szkice', value: draftPosts.length, icon: '📖', color: ADMIN_COLORS.warning, tab: 'blog' as AdminTab },
    { label: 'Zaplanowane', value: scheduledPosts.length, icon: '🕒', color: ADMIN_COLORS.primary, tab: 'calendar' as AdminTab },
    { label: 'Posty SM', value: allSocialPosts.length, icon: '📱', color: ADMIN_COLORS.accent, tab: 'social' as AdminTab },
    { label: 'Subskrybenci', value: config.subscribers.length, icon: '📧', color: ADMIN_COLORS.primary, tab: 'newsletter' as AdminTab },
    { label: 'Leady', value: config.leads.length, icon: '📈', color: ADMIN_COLORS.error, tab: 'leads' as AdminTab },
  ];

  return (
    <div>
      <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
        Dashboard
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {stats.map((stat) => (
          <AdminCard
            key={stat.label}
            onClick={() => onTabChange(stat.tab)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
          >
            <div
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '32px' }}>{stat.icon}</div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: stat.color,
                }}>{stat.value}</div>
              </div>
              <div style={{ color: ADMIN_COLORS.textDim, fontSize: '13px', marginTop: '8px' }}>
                {stat.label}
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="admin-dashboard-grid">
        <AdminCard>
          <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px', marginBottom: '16px' }}>
            Ostatnie leady
          </h3>
          {config.leads.length === 0 ? (
            <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '14px' }}>Brak lead\u00F3w</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {config.leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: ADMIN_COLORS.bg,
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: lead.read ? ADMIN_COLORS.surfaceLight : ADMIN_COLORS.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: ADMIN_COLORS.text, fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lead.name}
                    </div>
                    <div style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px' }}>
                      {lead.subject || lead.type}
                    </div>
                  </div>
                  {!lead.read && <Badge color="primary">Nowy</Badge>}
                  {lead.starred && <span style={{ color: ADMIN_COLORS.warning }}>\u2605</span>}
                </div>
              ))}
              {config.leads.length > 5 && (
                <button
                  onClick={() => onTabChange('leads')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: ADMIN_COLORS.primary,
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  Zobacz wszystkie ({config.leads.length}) \u2192
                </button>
              )}
            </div>
          )}
        </AdminCard>

        <AdminCard>
          <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px', marginBottom: '16px' }}>
            Zaplanowane publikacje
          </h3>
          {scheduledPosts.length === 0 && scheduledSocial.length === 0 ? (
            <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '14px' }}>Brak zaplanowanych publikacji</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scheduledPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: ADMIN_COLORS.bg,
                  }}
                >
                  <span style={{ fontSize: '16px' }}>📝</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: ADMIN_COLORS.text, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title}
                    </div>
                    <div style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px' }}>
                      {post.scheduledAt || post.publishedAt}
                    </div>
                  </div>
                  <Badge color="primary">Blog</Badge>
                </div>
              ))}
              {scheduledSocial.slice(0, 3).map((sp) => (
                <div
                  key={sp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: ADMIN_COLORS.bg,
                  }}
                >
                  <span style={{ fontSize: '16px' }}>📱</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: ADMIN_COLORS.text, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sp.platform}
                    </div>
                    <div style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px' }}>
                      {sp.scheduledAt || 'Draft'}
                    </div>
                  </div>
                  <Badge color="accent">{sp.platform}</Badge>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      {unreadLeads > 0 && (
        <AdminCard style={{ marginTop: '20px', borderLeft: `4px solid ${ADMIN_COLORS.error}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: ADMIN_COLORS.text, fontWeight: 600 }}>
                Masz {unreadLeads} nieprzeczytanych lead\u00F3w
              </div>
              <div style={{ color: ADMIN_COLORS.textDim, fontSize: '13px' }}>
                {starredLeads > 0 && `${starredLeads} oznaczonych gwiazdk\u0105 \u2605`}
              </div>
            </div>
            <button
              onClick={() => onTabChange('leads')}
              style={{
                background: ADMIN_COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Przejrzyj \u2192
            </button>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
