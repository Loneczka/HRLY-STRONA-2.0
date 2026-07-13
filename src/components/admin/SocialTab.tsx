import { useState } from 'react';
import { ADMIN_COLORS, AdminButton, AdminInput, AdminTextarea, AdminLabel, AdminCard, Badge, EmptyState } from './ui';
import { useToast } from './Toast';
import { COPYWRITING_FRAMEWORKS } from '../../hooks/useSiteConfig';
import type { SocialPost, SocialPlatform, SiteConfig } from '../../hooks/useSiteConfig';

const PLATFORM_CONFIG: Record<SocialPlatform, { icon: string; label: string; limit: number; color: string }> = {
  linkedin: { icon: '💼', label: 'LinkedIn', limit: 3000, color: '#0a66c2' },
  facebook: { icon: '📲', label: 'Facebook', limit: 5000, color: '#1877f2' },
  instagram: { icon: '📷', label: 'Instagram', limit: 2200, color: '#e4405f' },
};

export function SocialTab({
  config,
  updateConfig,
}: {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'list' | 'composer'>('list');
  const [filter, setFilter] = useState<string>('all');

  const allSocialPosts = config.blogPosts.flatMap((p) => p.socialPosts);
  const filteredPosts = filter === 'all'
    ? allSocialPosts
    : allSocialPosts.filter((s) => s.platform === filter);

  const handleSendWebhook = async (postId: string, blogPostId: string) => {
    const blogPost = config.blogPosts.find((p) => p.id === blogPostId);
    if (!blogPost) return;
    const socialPost = blogPost.socialPosts.find((s) => s.id === postId);
    if (!socialPost) return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const markSent = (updates: Partial<SocialPost>) => {
      const updatedPosts = config.blogPosts.map((p) => {
        if (p.id !== blogPostId) return p;
        return {
          ...p,
          socialPosts: p.socialPosts.map((s) =>
            s.id === postId ? { ...s, ...updates } : s
          ),
        };
      });
      updateConfig({ blogPosts: updatedPosts });
    };

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/post-to-social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          platform: socialPost.platform,
          content: socialPost.content,
          hashtags: socialPost.hashtags,
          framework: socialPost.framework,
          scheduledAt: socialPost.scheduledAt,
          mediaUrls: socialPost.mediaUrls,
          blogPostId,
          blogPostTitle: blogPost.title,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        markSent({
          makeWebhookSent: true,
          status: 'sent',
          sentAt: new Date().toISOString(),
          webhookError: undefined,
        });
        toast(`Post wys\u0142any na ${socialPost.platform}`, 'success');
      } else {
        const errorText = await response.text();
        markSent({ webhookError: errorText, status: 'error' });
        toast(`B\u0142\u0105d wysy\u0142ki: ${errorText}`, 'error');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nieznany b\u0142\u0105d';
      markSent({ webhookError: errorMsg, status: 'error' });
      toast(`B\u0142\u0105d: ${errorMsg}`, 'error');
    }
  };

  const handleDelete = (postId: string, blogPostId: string) => {
    const updatedPosts = config.blogPosts.map((p) => {
      if (p.id !== blogPostId) return p;
      return { ...p, socialPosts: p.socialPosts.filter((s) => s.id !== postId) };
    });
    updateConfig({ blogPosts: updatedPosts });
    toast('Post usuni\u0119ty', 'success');
  };

  if (activeView === 'composer') {
    return (
      <MultiChannelComposer
        config={config}
        updateConfig={updateConfig}
        onBack={() => setActiveView('list')}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700 }}>
          Social Media ({allSocialPosts.length})
        </h2>
        <AdminButton onClick={() => setActiveView('composer')}>+ Nowy post multi-channel</AdminButton>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <FilterChip label="Wszystkie" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="LinkedIn" icon="💼" active={filter === 'linkedin'} onClick={() => setFilter('linkedin')} />
        <FilterChip label="Facebook" icon="📲" active={filter === 'facebook'} onClick={() => setFilter('facebook')} />
        <FilterChip label="Instagram" icon="📷" active={filter === 'instagram'} onClick={() => setFilter('instagram')} />
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState
          icon="📱"
          title="Brak post\u00F3w Social Media"
          subtitle="Utw\u00F3rz post i wy\u015Blij go na wiele platform jednocze\u015Bnie"
          action={<AdminButton onClick={() => setActiveView('composer')}>+ Nowy post</AdminButton>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPosts.map((sp) => {
            const blogPost = config.blogPosts.find((p) => p.socialPosts.some((s) => s.id === sp.id));
            const blogPostId = blogPost?.id || '';
            const pc = PLATFORM_CONFIG[sp.platform];
            const statusColors: Record<string, 'success' | 'warning' | 'error' | 'primary' | 'gray'> = {
              draft: 'gray', approved: 'primary', scheduled: 'warning', sent: 'success', error: 'error',
            };
            return (
              <AdminCard key={sp.id}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: `${pc.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}>{pc.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ color: ADMIN_COLORS.text, fontSize: '14px', fontWeight: 600 }}>{pc.label}</span>
                      <Badge color={statusColors[sp.status]}>{sp.status}</Badge>
                      {sp.makeWebhookSent && <Badge color="success">Wysłany</Badge>}
                      {sp.framework && <Badge color="gray">{sp.framework}</Badge>}
                    </div>
                    <p style={{ color: ADMIN_COLORS.textDim, fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                      {sp.content.substring(0, 200)}
                      {sp.content.length > 200 ? '...' : ''}
                    </p>
                    {sp.hashtags && (
                      <p style={{ color: ADMIN_COLORS.accent, fontSize: '12px', margin: '4px 0 0 0' }}>{sp.hashtags}</p>
                    )}
                    {sp.webhookError && (
                      <p style={{ color: ADMIN_COLORS.error, fontSize: '12px', margin: '4px 0 0 0' }}>
                        B\u0142\u0105d: {sp.webhookError}
                      </p>
                    )}
                    {sp.scheduledAt && (
                      <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '11px', margin: '4px 0 0 0' }}>
                        Zaplanowane: {sp.scheduledAt}
                      </p>
                    )}
                    {blogPost && (
                      <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '11px', margin: '4px 0 0 0' }}>
                        Artyku\u0142: {blogPost.title}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                  {!sp.makeWebhookSent && (
                    <AdminButton
                      size="sm"
                      variant="success"
                      onClick={() => handleSendWebhook(sp.id, blogPostId)}
                    >
                      Wy\u015Blij
                    </AdminButton>
                  )}
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(sp.id, blogPostId)}
                  >
                    Usu\u0144
                  </AdminButton>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, icon, active, onClick }: { label: string; icon?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '20px',
        border: `1px solid ${active ? ADMIN_COLORS.primary : ADMIN_COLORS.border}`,
        background: active ? `${ADMIN_COLORS.primary}22` : ADMIN_COLORS.surface,
        color: active ? ADMIN_COLORS.primary : ADMIN_COLORS.textDim,
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

function MultiChannelComposer({
  config,
  updateConfig,
  onBack,
}: {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [framework, setFramework] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['linkedin']);
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<Record<string, 'pending' | 'sending' | 'success' | 'error'>>({});

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSend = async () => {
    if (!content.trim()) {
      toast('Tre\u015B\u0107 jest wymagana', 'error');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast('Wybierz co najmniej jedn\u0105 platform\u0119', 'error');
      return;
    }

    setSending(true);
    const progress: Record<string, 'pending' | 'sending' | 'success' | 'error'> = {};
    selectedPlatforms.forEach((p) => { progress[p] = 'pending'; });
    setSendProgress(progress);

    const newPosts: SocialPost[] = selectedPlatforms.map((platform) => ({
      id: `sp_${Date.now()}_${platform}`,
      platform,
      content,
      hashtags,
      framework,
      status: 'approved' as const,
      scheduledAt: scheduledAt || undefined,
      mediaUrls: [],
      mediaTypes: [],
      makeWebhookSent: false,
    }));

    const tempBlogPost = {
      id: `bp_social_${Date.now()}`,
      title: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
      slug: `social-${Date.now()}`,
      excerpt: '',
      content: '',
      category: 'Social Media',
      tags: ['Social Media'],
      author: 'Admin',
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'draft' as const,
      seoTitle: '',
      seoDescription: '',
      copywritingFramework: framework,
      socialPosts: newPosts,
    };

    const updatedPosts = [...config.blogPosts, tempBlogPost];
    updateConfig({ blogPosts: updatedPosts });

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    for (const platform of selectedPlatforms) {
      progress[platform] = 'sending';
      setSendProgress({ ...progress });
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/post-to-social`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            platform,
            content,
            hashtags,
            framework,
            scheduledAt,
          }),
        });
        if (response.ok) {
          progress[platform] = 'success';
        } else {
          progress[platform] = 'error';
        }
      } catch {
        progress[platform] = 'error';
      }
      setSendProgress({ ...progress });
    }

    const finalUpdatedPosts = updatedPosts.map((p) => {
      if (p.id !== tempBlogPost.id) return p;
      return {
        ...p,
        socialPosts: p.socialPosts.map((s) => {
          const status = progress[s.platform];
          return {
            ...s,
            makeWebhookSent: status === 'success',
            status: status === 'success' ? 'sent' as const : status === 'error' ? 'error' as const : 'approved' as const,
            sentAt: status === 'success' ? new Date().toISOString() : undefined,
            webhookError: status === 'error' ? 'Edge function failed' : undefined,
          };
        }),
      };
    });
    updateConfig({ blogPosts: finalUpdatedPosts });

    const successCount = Object.values(progress).filter((s) => s === 'success').length;
    const errorCount = Object.values(progress).filter((s) => s === 'error').length;
    if (errorCount === 0) {
      toast(`Post wysłany na ${successCount} platform`, 'success');
    } else {
      toast(`Wysłano: ${successCount}, błędy: ${errorCount}`, 'warning');
    }

    setSending(false);
    setTimeout(() => onBack(), 1500);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AdminButton variant="ghost" onClick={onBack}>\u2190 Powr\u00F3t</AdminButton>
          <h2 style={{ color: ADMIN_COLORS.text, fontSize: '20px', fontWeight: 700 }}>
            Composer multi-channel
          </h2>
        </div>
        <AdminButton onClick={handleSend} disabled={sending}>
          {sending ? 'Wysy\u0142anie...' : 'Wy\u015Blij na wszystkie'}
        </AdminButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="admin-composer-grid">
        <AdminCard>
          <AdminLabel>Wybierz platformy</AdminLabel>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {(Object.keys(PLATFORM_CONFIG) as SocialPlatform[]).map((p) => {
              const pc = PLATFORM_CONFIG[p];
              const selected = selectedPlatforms.includes(p);
              const status = sendProgress[p];
              return (
                <button
                  key={p}
                  onClick={() => !sending && togglePlatform(p)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: `2px solid ${selected ? pc.color : ADMIN_COLORS.border}`,
                    background: selected ? `${pc.color}22` : ADMIN_COLORS.bg,
                    color: selected ? pc.color : ADMIN_COLORS.textDim,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: sending && !selected ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{pc.icon}</span>
                  {pc.label}
                  {status === 'sending' && <span style={{ fontSize: '12px' }}>\u23F3</span>}
                  {status === 'success' && <span style={{ fontSize: '12px', color: ADMIN_COLORS.success }}>\u2713</span>}
                  {status === 'error' && <span style={{ fontSize: '12px', color: ADMIN_COLORS.error }}>\u2717</span>}
                </button>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard>
          <AdminLabel>Tre\u015B\u0107 postu</AdminLabel>
          <AdminTextarea
            value={content}
            onChange={setContent}
            rows={8}
            placeholder="Napisz tre\u015B\u0107 posta..."
          />
          <div style={{ marginTop: '8px' }}>
            {selectedPlatforms.map((p) => {
              const pc = PLATFORM_CONFIG[p];
              const progress = content.length / pc.limit;
              const color = progress > 0.9 ? ADMIN_COLORS.error : progress > 0.7 ? ADMIN_COLORS.warning : ADMIN_COLORS.success;
              return (
                <div key={p} style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ color: ADMIN_COLORS.textMuted, fontSize: '11px' }}>{pc.icon} {pc.label}</span>
                    <span style={{ color, fontSize: '11px', fontWeight: 600 }}>
                      {content.length} / {pc.limit}
                    </span>
                  </div>
                  <div style={{
                    height: '3px',
                    background: ADMIN_COLORS.surfaceLight,
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(progress * 100, 100)}%`,
                      background: color,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="admin-composer-row">
          <AdminCard>
            <AdminLabel>Hashtagi</AdminLabel>
            <AdminInput
              value={hashtags}
              onChange={setHashtags}
              placeholder="#hr #hrly #analityka"
            />
            {config.social.savedHashtags && config.social.savedHashtags.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {config.social.savedHashtags.map((hs) => (
                  <button
                    key={hs.id}
                    onClick={() => setHashtags(hashtags ? `${hashtags} ${hs.tags}` : hs.tags)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: `1px solid ${ADMIN_COLORS.border}`,
                      background: ADMIN_COLORS.bg,
                      color: ADMIN_COLORS.textDim,
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    {hs.name}
                  </button>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard>
            <AdminLabel>Framework copywriterski</AdminLabel>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              style={{
                background: ADMIN_COLORS.bg,
                border: `1px solid ${ADMIN_COLORS.border}`,
                borderRadius: '8px',
                padding: '10px 14px',
                color: ADMIN_COLORS.text,
                fontSize: '14px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <option value="">Brak</option>
              {COPYWRITING_FRAMEWORKS.map((fw) => (
                <option key={fw.id} value={fw.id}>{fw.icon} {fw.name}</option>
              ))}
            </select>
          </AdminCard>
        </div>

        <AdminCard>
          <AdminLabel>Data publikacji (opcjonalnie)</AdminLabel>
          <AdminInput
            type="datetime-local"
            value={scheduledAt}
            onChange={setScheduledAt}
          />
        </AdminCard>
      </div>
    </div>
  );
}
