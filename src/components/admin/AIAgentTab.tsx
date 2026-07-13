import { useState, useRef, useEffect } from 'react';
import { ADMIN_COLORS, AdminButton, AdminInput, AdminTextarea, AdminLabel, AdminCard, Badge, EmptyState } from './ui';
import { useToast } from './Toast';
import { COPYWRITING_FRAMEWORKS } from '../../hooks/useSiteConfig';
import type { SiteConfig, BlogPost, SocialPost } from '../../hooks/useSiteConfig';
import { sanitizeHtml } from '../../lib/sanitize';

type AgentMode = 'article' | 'social' | 'ideas' | 'rewrite';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  data?: any;
  timestamp: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function AIAgentTab({
  config,
  updateConfig,
}: {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<AgentMode>('article');
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('');
  const [platform, setPlatform] = useState<'linkedin' | 'facebook' | 'instagram'>('linkedin');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generatedArticle, setGeneratedArticle] = useState<any>(null);
  const [generatedSocial, setGeneratedSocial] = useState<any>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [rewriteInput, setRewriteInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = [...new Set(config.blogPosts.map((p) => p.category).filter(Boolean))];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function callAgent(body: Record<string, any>) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-content-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async function handleGenerate() {
    if (mode === 'article' && !topic.trim()) {
      toast('Podaj temat artykułu', 'error');
      return;
    }
    if (mode === 'rewrite' && !rewriteInput.trim()) {
      toast('Podaj tekst do przepisania', 'error');
      return;
    }

    setLoading(true);
    const userMsg: ChatMessage = {
      role: 'user',
      content: mode === 'article' ? `Napisz artykuł: ${topic}` : mode === 'social' ? `Napisz post na ${platform}: ${topic}` : mode === 'ideas' ? 'Wygeneruj pomysły' : 'Przepisz tekst',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const reqBody: Record<string, any> = { type: mode };
      if (mode === 'article') {
        reqBody.topic = topic;
        reqBody.framework = framework;
        reqBody.prompt = prompt;
        reqBody.category = category;
      } else if (mode === 'social') {
        reqBody.topic = topic;
        reqBody.platform = platform;
        reqBody.framework = framework;
        reqBody.prompt = prompt;
      } else if (mode === 'ideas') {
        reqBody.category = category;
        reqBody.prompt = prompt;
      } else if (mode === 'rewrite') {
        reqBody.existingContent = rewriteInput;
        reqBody.prompt = prompt;
      }

      const result = await callAgent(reqBody);

      let assistantContent = '';
      if (mode === 'article' && result.title) {
        setGeneratedArticle(result);
        assistantContent = `Wygenerowano artykuł: "${result.title}"`;
      } else if (mode === 'social' && result.content) {
        setGeneratedSocial(result);
        assistantContent = 'Wygenerowano post social media';
      } else if (mode === 'ideas' && result.ideas) {
        setGeneratedIdeas(result.ideas);
        assistantContent = `Wygenerowano ${result.ideas.length} pomysłów`;
      } else if (mode === 'rewrite' && result.content) {
        assistantContent = 'Tekst przepisany';
        setGeneratedArticle({ content: result.content, title: 'Przepisany tekst', slug: '', excerpt: '', seoTitle: '', seoDescription: '', tags: [], category: '' });
      } else if (result.raw) {
        assistantContent = result.raw;
      } else {
        assistantContent = 'Wynik wygenerowany';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantContent, data: result, timestamp: Date.now() }]);
      toast('Wygenerowano', 'success');
    } catch (err: any) {
      toast(err.message || 'Błąd generowania', 'error');
      setMessages((prev) => [...prev, { role: 'assistant', content: `Błąd: ${err.message}`, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }

  function saveAsDraft() {
    if (!generatedArticle) return;
    const newPost: BlogPost = {
      id: `bp_${Date.now()}`,
      title: generatedArticle.title || 'Nowy artykuł',
      slug: generatedArticle.slug || `artykul-${Date.now()}`,
      excerpt: generatedArticle.excerpt || '',
      content: sanitizeHtml(generatedArticle.content || ''),
      category: generatedArticle.category || category || 'HR',
      tags: generatedArticle.tags || [],
      author: 'AI Agent',
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      seoTitle: generatedArticle.seoTitle || generatedArticle.title || '',
      seoDescription: generatedArticle.seoDescription || generatedArticle.excerpt || '',
      copywritingFramework: framework,
      socialPosts: [],
    };
    updateConfig({ blogPosts: [newPost, ...config.blogPosts] });
    toast('Artykuł zapisany jako szkic', 'success');
  }

  function saveSocialToPost() {
    if (!generatedSocial) return;
    const newPost: SocialPost = {
      id: `sp_${Date.now()}`,
      platform,
      content: generatedSocial.content || '',
      hashtags: generatedSocial.hashtags || '',
      framework: generatedSocial.framework || framework,
      status: 'draft',
      mediaUrls: [],
      mediaTypes: [],
      makeWebhookSent: false,
    };
    toast('Post zapisany (dodaj do artykułu w zakładce Blog)', 'success');
    setGeneratedSocial(null);
  }

  function useIdea(idea: any) {
    setMode('article');
    setTopic(idea.title);
    setCategory(idea.category || '');
    setGeneratedIdeas([]);
    toast('Pomysł załadowany', 'info');
  }

  const modeButtons: { id: AgentMode; label: string; icon: string }[] = [
    { id: 'article', label: 'Artykuł', icon: '📝' },
    { id: 'social', label: 'Post SM', icon: '📱' },
    { id: 'ideas', label: 'Pomysły', icon: '💡' },
    { id: 'rewrite', label: 'Przepisz', icon: '✏️' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700 }}>
          Agent AI
        </h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {modeButtons.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${mode === m.id ? ADMIN_COLORS.primary : ADMIN_COLORS.border}`,
                background: mode === m.id ? `${ADMIN_COLORS.primary}22` : ADMIN_COLORS.surface,
                color: mode === m.id ? ADMIN_COLORS.primary : ADMIN_COLORS.textDim,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: 0 }} className="ai-agent-grid">
        {/* Left: Input panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
          <AdminCard>
            <div style={{ display: 'grid', gap: '14px' }}>
              {mode === 'article' && (
                <>
                  <div>
                    <AdminLabel>Temat artykułu</AdminLabel>
                    <AdminInput value={topic} onChange={setTopic} placeholder="np. Jak AI zmienia rekrutację w 2026" />
                  </div>
                  <div>
                    <AdminLabel>Kategoria</AdminLabel>
                    <AdminInput value={category} onChange={setCategory} placeholder="np. Analityka HR" />
                  </div>
                </>
              )}

              {mode === 'social' && (
                <>
                  <div>
                    <AdminLabel>Temat posta</AdminLabel>
                    <AdminInput value={topic} onChange={setTopic} placeholder="np. 5 sposobów na zaangażowanie zespołu" />
                  </div>
                  <div>
                    <AdminLabel>Platforma</AdminLabel>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(['linkedin', 'facebook', 'instagram'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPlatform(p)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${platform === p ? ADMIN_COLORS.primary : ADMIN_COLORS.border}`,
                            background: platform === p ? `${ADMIN_COLORS.primary}22` : ADMIN_COLORS.bg,
                            color: platform === p ? ADMIN_COLORS.primary : ADMIN_COLORS.textDim,
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mode === 'ideas' && (
                <div>
                  <AdminLabel>Kategoria (opcjonalnie)</AdminLabel>
                  <AdminInput value={category} onChange={setCategory} placeholder="np. Trendy HR" />
                </div>
              )}

              {mode === 'rewrite' && (
                <div>
                  <AdminLabel>Tekst do przepisania</AdminLabel>
                  <AdminTextarea value={rewriteInput} onChange={setRewriteInput} rows={6} placeholder="Wklej tekst..." />
                </div>
              )}

              {(mode === 'article' || mode === 'social') && (
                <div>
                  <AdminLabel>Framework copywritingowy</AdminLabel>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: ADMIN_COLORS.bg,
                      border: `1px solid ${ADMIN_COLORS.border}`,
                      borderRadius: '8px',
                      color: ADMIN_COLORS.text,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Brak (dowolny)</option>
                    {COPYWRITING_FRAMEWORKS.map((fw) => (
                      <option key={fw.id} value={fw.name}>{fw.icon} {fw.name} - {fw.description}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <AdminLabel>Dodatkowe instrukcje (opcjonalnie)</AdminLabel>
                <AdminTextarea value={prompt} onChange={setPrompt} rows={3} placeholder="np. Skup się na przykładach z polskiego rynku..." />
              </div>

              <AdminButton onClick={handleGenerate} disabled={loading} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Generowanie...' : 'Generuj z AI'}
              </AdminButton>
            </div>
          </AdminCard>
        </div>

        {/* Right: Results + Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
          {/* Generated content preview */}
          {generatedArticle && mode === 'article' && (
            <AdminCard style={{ flex: 1, overflowY: 'auto', minHeight: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px' }}>{generatedArticle.title}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <AdminButton size="sm" variant="success" onClick={saveAsDraft}>Zapisz jako szkic</AdminButton>
                  <AdminButton size="sm" variant="ghost" onClick={() => setGeneratedArticle(null)}>Zamknij</AdminButton>
                </div>
              </div>
              {generatedArticle.excerpt && (
                <p style={{ color: ADMIN_COLORS.textDim, fontSize: '13px', fontStyle: 'italic', marginBottom: '12px' }}>{generatedArticle.excerpt}</p>
              )}
              <div
                style={{ color: ADMIN_COLORS.text, fontSize: '14px', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(generatedArticle.content || '') }}
              />
              {(generatedArticle.tags?.length > 0) && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {generatedArticle.tags.map((t: string, idx: number) => <span key={idx}><Badge color="accent">{t}</Badge>{' '}</span>)}
                </div>
              )}
            </AdminCard>
          )}

          {generatedSocial && mode === 'social' && (
            <AdminCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Badge color="primary">{platform}</Badge>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <AdminButton size="sm" variant="success" onClick={saveSocialToPost}>Zapisz</AdminButton>
                  <AdminButton size="sm" variant="ghost" onClick={() => setGeneratedSocial(null)}>Zamknij</AdminButton>
                </div>
              </div>
              <p style={{ color: ADMIN_COLORS.text, fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{generatedSocial.content}</p>
              {generatedSocial.hashtags && (
                <p style={{ color: ADMIN_COLORS.accent, fontSize: '13px', marginTop: '12px' }}>{generatedSocial.hashtags}</p>
              )}
            </AdminCard>
          )}

          {generatedIdeas.length > 0 && mode === 'ideas' && (
            <AdminCard style={{ flex: 1, overflowY: 'auto' }}>
              <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px', marginBottom: '16px' }}>Wygenerowane pomysły</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {generatedIdeas.map((idea, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '14px',
                      background: ADMIN_COLORS.bg,
                      borderRadius: '10px',
                      border: `1px solid ${ADMIN_COLORS.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: ADMIN_COLORS.text, fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{idea.title}</h4>
                        <p style={{ color: ADMIN_COLORS.textDim, fontSize: '13px', marginBottom: '6px' }}>{idea.excerpt}</p>
                        {idea.reason && <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px' }}>{idea.reason}</p>}
                        {idea.category && <Badge color="gray">{idea.category}</Badge>}
                      </div>
                      <AdminButton size="sm" variant="primary" onClick={() => useIdea(idea)}>Użyj</AdminButton>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {/* Chat history */}
          <AdminCard style={{ flex: 1, overflowY: 'auto', minHeight: '150px', paddingRight: '4px' }} >
            <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 && (
                <EmptyState icon="🤖" title="Agent AI" subtitle="Wygeneruj artykuł, post social media, pomysły lub przepisz tekst. Wybierz tryb i kliknij 'Generuj'." />
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      background: msg.role === 'user' ? ADMIN_COLORS.primary : ADMIN_COLORS.bg,
                      color: msg.role === 'user' ? 'white' : ADMIN_COLORS.text,
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 4px', background: ADMIN_COLORS.bg, color: ADMIN_COLORS.textDim, fontSize: '13px' }}>
                    <span style={{ animation: 'pulse 1s infinite' }}>Agent pisze...</span>
                  </div>
                </div>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
