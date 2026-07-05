import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Share2, CalendarDays, Settings,
  LogOut, X, ChevronRight, Eye, EyeOff, Save,
  Plus, Trash2, Edit3, Sparkles, Globe,
  Star, Mail, Calendar, MessageSquare,
  Search, Tag, Clock, CheckCircle, AlertCircle, Send,
  Image, ArrowLeft, Copy, Upload,
  Lock, Key, User, ExternalLink, TrendingUp, Users,
  Activity, Zap, Instagram, Facebook, Linkedin,
  Hash, ChevronLeft, ChevronDown, Check, XCircle,
  MoreHorizontal, BookOpen, Download
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import {
  useSiteConfig,
  loadConfig,
  saveConfig,
  COPYWRITING_FRAMEWORKS,
  type BlogPost,
  type ContactLead,
  type SiteConfig,
  type SocialPost,
  type SocialPlatform,
} from '../hooks/useSiteConfig';

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = import.meta.env as Record<string, string>;
const genAI = new GoogleGenAI({ apiKey: env['VITE_GEMINI_API_KEY'] || env['GEMINI_API_KEY'] || '' });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź|ż/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pl-PL', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatDateTime(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pl-PL', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const compressImage = (file: File, maxWidth = 1200, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const C = {
  bg: '#F6F5FB',
  sidebar: '#fff',
  card: '#fff',
  text: '#14183D',
  textSoft: '#6B6484',
  textMuted: '#A39AB4',
  accent: '#3B2F8C',
  accentLight: '#E8E3F8',
  orange: '#F4A574',
  orangeLight: '#FEF0E6',
  border: '#E8E3F0',
  borderLight: '#F0EDFA',
  green: '#059669',
  greenLight: '#D1FAE5',
  red: '#DC2626',
  redLight: '#FEE2E2',
  yellow: '#D97706',
  yellowLight: '#FEF3C7',
  instagram: '#E1306C',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
};

const platformColors: Record<SocialPlatform, { bg: string; text: string; icon: string }> = {
  instagram: { bg: '#FCE7F3', text: '#C026D3', icon: '#E1306C' },
  facebook: { bg: '#EFF6FF', text: '#1D4ED8', icon: '#1877F2' },
  linkedin: { bg: '#EFF6FF', text: '#0369A1', icon: '#0A66C2' },
};

const platformLabel: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

const PlatformIcon = ({ platform, size = 16 }: { platform: SocialPlatform; size?: number }) => {
  if (platform === 'instagram') return <Instagram size={size} />;
  if (platform === 'facebook') return <Facebook size={size} />;
  return <Linkedin size={size} />;
};

const statusPill = (status: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    published: { bg: C.greenLight, color: C.green, label: 'Opublikowany' },
    draft: { bg: C.accentLight, color: C.accent, label: 'Szkic' },
    scheduled: { bg: C.yellowLight, color: C.yellow, label: 'Zaplanowany' },
    approved: { bg: C.greenLight, color: C.green, label: 'Zatwierdzony' },
    sent: { bg: C.greenLight, color: C.green, label: 'Wysłany' },
    error: { bg: C.redLight, color: C.red, label: 'Błąd' },
  };
  const s = map[status] || { bg: C.borderLight, color: C.textMuted, label: status };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
};

// ─────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────
type Tab = 'dashboard' | 'blog' | 'social' | 'calendar' | 'newsletter' | 'pages' | 'settings';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'blog', label: 'Artykuły', icon: <FileText size={20} /> },
  { id: 'social', label: 'Social Media', icon: <Share2 size={20} /> },
  { id: 'calendar', label: 'Kalendarz', icon: <CalendarDays size={20} /> },
  { id: 'newsletter', label: 'Newsletter', icon: <Mail size={20} /> },
  { id: 'pages', label: 'Treść stron', icon: <Globe size={20} /> },
  { id: 'settings', label: 'Ustawienia', icon: <Settings size={20} /> },
];

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
function Sidebar({ active, onNav, onLogout }: { active: Tab; onNav: (t: Tab) => void; onLogout: () => void }) {
  return (
    <aside style={{
      width: '220px', minHeight: '100vh', background: C.sidebar,
      borderRight: `1px solid ${C.border}`, display: 'flex',
      flexDirection: 'column', padding: '24px 12px',
      position: 'sticky', top: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '0 8px 24px', borderBottom: `1px solid ${C.border}`, marginBottom: '16px' }}>
        <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.04em', color: C.text }}>
          hr<span style={{ color: C.accent }}>ly</span>
        </div>
        <div style={{ fontSize: '11px', color: C.textMuted, fontWeight: 600, marginTop: '2px' }}>Panel Administratora</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '12px', border: 'none',
                cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? 700 : 500,
                color: isActive ? C.accent : C.textSoft,
                background: isActive ? C.accentLight : 'transparent',
                transition: 'all 0.15s', textAlign: 'left', width: '100%',
              }}
            >
              <span style={{ color: isActive ? C.accent : C.textMuted }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '12px', border: 'none',
          cursor: 'pointer', fontSize: '14px', fontWeight: 500,
          color: C.red, background: 'transparent', transition: 'all 0.15s',
          textAlign: 'left', width: '100%',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.redLight)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <LogOut size={18} />
        Wyloguj
      </button>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Top Bar
// ─────────────────────────────────────────────
function TopBar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 28px', borderBottom: `1px solid ${C.border}`,
      background: '#fff', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <h1 style={{ fontSize: '20px', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Button helpers
// ─────────────────────────────────────────────
function Btn({
  onClick, children, variant = 'primary', size = 'md', disabled = false, style: extraStyle,
}: {
  onClick?: () => void; children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    borderRadius: '10px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 700, fontSize: size === 'sm' ? '12px' : '14px',
    padding: size === 'sm' ? '6px 12px' : '10px 18px',
    transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { background: C.accent, color: '#fff' },
    secondary: { background: C.accentLight, color: C.accent },
    ghost: { background: 'transparent', color: C.textSoft, border: `1.5px solid ${C.border}` },
    danger: { background: C.redLight, color: C.red },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...extraStyle }}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, multiline, rows = 4, style: extraStyle }: {
  label?: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; multiline?: boolean; rows?: number;
  style?: React.CSSProperties;
}) {
  const baseStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: `1.5px solid ${C.border}`, fontSize: '14px', color: C.text,
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', ...extraStyle,
  };
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.textSoft, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ ...baseStyle, resize: 'vertical', lineHeight: 1.6 }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={baseStyle} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Framework Selector
// ─────────────────────────────────────────────
function FrameworkSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.textSoft, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Framework copywriterski
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {COPYWRITING_FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            onClick={() => onChange(fw.id)}
            title={fw.description}
            style={{
              padding: '6px 14px', borderRadius: '999px', border: 'none',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              background: value === fw.id ? C.accent : C.accentLight,
              color: value === fw.id ? '#fff' : C.accent,
              transition: 'all 0.15s',
            }}
          >
            {fw.icon} {fw.name}
          </button>
        ))}
      </div>
      {value && (
        <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '8px', margin: '8px 0 0' }}>
          {COPYWRITING_FRAMEWORKS.find((f) => f.id === value)?.description}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Blog Post Editor
// ─────────────────────────────────────────────
function BlogPostEditor({
  post,
  onSave,
  onBack,
  config,
}: {
  post: Partial<BlogPost> | null;
  onSave: (p: BlogPost) => void;
  onBack: () => void;
  config: SiteConfig;
}) {
  const [title, setTitle] = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || '');
  const [tags, setTags] = useState((post?.tags || []).join(', '));
  const [author, setAuthor] = useState(post?.author || 'HRly Redakcja');
  const [status, setStatus] = useState<BlogPost['status']>(post?.status || 'draft');
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [framework, setFramework] = useState(post?.copywritingFramework || 'co-star');
  const [scheduledAt, setScheduledAt] = useState(post?.scheduledAt || '');
  const [preview, setPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const imgRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setImageUrl(compressed);
    } catch { setAiStatus('Błąd wgrywania obrazka'); }
  };

  const generateContent = async () => {
    if (!title) { setAiStatus('Podaj tytuł artykułu'); return; }
    setAiLoading(true);
    setAiStatus('Generuję artykuł...');
    const fw = COPYWRITING_FRAMEWORKS.find((f) => f.id === framework);
    const prompt = `Jesteś ekspertem HR i copywriterem używającym frameworku ${fw?.name} (${fw?.description}).
Napisz profesjonalny artykuł blogowy po polsku na temat: "${title}".
Kategoria: ${category || 'HR'}.
Użyj frameworku ${fw?.name} do strukturyzacji treści.
Artykuł powinien mieć:
- Angażujące wprowadzenie
- 3-4 sekcje z nagłówkami ## 
- Praktyczne wskazówki i przykłady
- Wniosek z CTA
Pisz w języku polskim, profesjonalnie, dla dyrektorów HR i managerów.
Użyj Markdown (## nagłówki, **bold**, listy -).
Długość: 600-900 słów.`;
    try {
      const result = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
      const text = result.text || '';
      setContent(text);
      if (!seoTitle) setSeoTitle(title + ' | HRly');
      if (!excerpt && text) {
        const first = text.replace(/^#+.*\n/m, '').replace(/\*\*/g, '').split('\n').find((l) => l.trim().length > 40);
        if (first) setExcerpt(first.trim().slice(0, 200));
      }
      setAiStatus('✓ Artykuł wygenerowany');
    } catch { setAiStatus('Błąd AI — sprawdź klucz API'); }
    finally { setAiLoading(false); }
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const saved: BlogPost = {
      id: post?.id || `post_${Date.now()}`,
      title,
      slug: post?.slug || slugify(title),
      excerpt,
      content,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      author,
      publishedAt: status === 'published' && !post?.publishedAt ? now : (post?.publishedAt || now),
      scheduledAt: status === 'scheduled' ? scheduledAt : undefined,
      status,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      imageUrl,
      copywritingFramework: framework,
      socialPosts: post?.socialPosts || [],
    };
    onSave(saved);
  };

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Main editor */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
            <ArrowLeft size={16} /> Powrót
          </button>
          <span style={{ color: C.border }}>|</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: C.text }}>{post?.id ? 'Edytuj artykuł' : 'Nowy artykuł'}</h2>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
            {aiStatus && <span style={{ fontSize: '12px', color: aiStatus.startsWith('✓') ? C.green : C.textMuted }}>{aiStatus}</span>}
            <Btn variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
              {preview ? <EyeOff size={14} /> : <Eye size={14} />}
              {preview ? 'Edytor' : 'Podgląd'}
            </Btn>
            <Btn onClick={generateContent} disabled={aiLoading} variant="secondary" size="sm">
              <Sparkles size={14} /> {aiLoading ? 'Generuję...' : 'Generuj AI'}
            </Btn>
            <Btn onClick={handleSave}><Save size={14} /> Zapisz</Btn>
          </div>
        </div>

        {/* Cover image */}
        <div style={{ marginBottom: '20px' }}>
          {imageUrl ? (
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '3/1' }}>
              <img src={imageUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => setImageUrl('')} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', color: '#fff', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => imgRef.current?.click()}
              style={{
                border: `2px dashed ${C.border}`, borderRadius: '16px', padding: '32px',
                textAlign: 'center', cursor: 'pointer', color: C.textMuted,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              }}
            >
              <Image size={28} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Dodaj okładkę artykułu</span>
              <span style={{ fontSize: '12px' }}>Kliknij lub przeciągnij plik</span>
            </div>
          )}
          <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tytuł artykułu..."
          style={{
            width: '100%', fontSize: '28px', fontWeight: 800, color: C.text,
            border: 'none', outline: 'none', background: 'transparent',
            marginBottom: '16px', fontFamily: 'inherit', letterSpacing: '-0.02em',
            boxSizing: 'border-box',
          }}
        />

        {/* Framework */}
        <FrameworkSelector value={framework} onChange={setFramework} />

        {/* Content / Preview */}
        {preview ? (
          <div style={{ background: C.bg, borderRadius: '16px', padding: '24px', lineHeight: 1.7, color: C.text, minHeight: '300px' }}>
            <div dangerouslySetInnerHTML={{
              __html: content
                .replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:800;color:#14183D;margin:24px 0 8px">$1</h2>')
                .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;color:#14183D;margin:20px 0 8px">$1</h3>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/^- (.+)$/gm, '<li>$1</li>')
                .replace(/(<li>.*<\/li>)+/gs, (m) => `<ul style="padding-left:20px">${m}</ul>`)
                .replace(/\n\n/g, '<br/><br/>')
            }} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Treść artykułu w Markdown...&#10;&#10;## Sekcja&#10;**Pogrubiony tekst**&#10;- Punkt listy"
            style={{
              width: '100%', minHeight: '360px', padding: '16px', borderRadius: '14px',
              border: `1.5px solid ${C.border}`, fontSize: '14px', color: C.text,
              background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'monospace',
              lineHeight: 1.7, boxSizing: 'border-box',
            }}
          />
        )}
      </div>

      {/* Right panel */}
      <div style={{ width: '280px', borderLeft: `1px solid ${C.border}`, padding: '24px 20px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Szczegóły</h3>

        {/* Status */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: C.textSoft, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as BlogPost['status'])} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '14px', color: C.text, background: '#fff', outline: 'none' }}>
            <option value="draft">Szkic</option>
            <option value="published">Opublikowany</option>
            <option value="scheduled">Zaplanowany</option>
          </select>
        </div>

        {status === 'scheduled' && (
          <Input label="Data publikacji" type="datetime-local" value={scheduledAt} onChange={setScheduledAt} />
        )}

        <Input label="Kategoria" value={category} onChange={setCategory} placeholder="np. Analityka HR" />
        <Input label="Tagi (oddziel przecinkiem)" value={tags} onChange={setTags} placeholder="eNPS, zaangażowanie" />
        <Input label="Autor" value={author} onChange={setAuthor} />

        <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '16px 0' }} />
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>SEO</h3>
        <Input label="Tytuł SEO" value={seoTitle} onChange={setSeoTitle} placeholder={title || 'Tytuł SEO'} />
        <Input label="Opis SEO" value={seoDescription} onChange={setSeoDescription} placeholder="Opis dla Google..." multiline rows={3} />
        <Input label="Skrót (excerpt)" value={excerpt} onChange={setExcerpt} placeholder="Krótkie streszczenie..." multiline rows={3} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Blog Tab
// ─────────────────────────────────────────────
function BlogTab({ config, updateSection }: { config: SiteConfig; updateSection: <K extends keyof SiteConfig>(section: K, value: SiteConfig[K]) => void }) {
  const [editing, setEditing] = useState<Partial<BlogPost> | null | false>(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');

  const posts = config.blogPosts || [];

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchFilter = filter === 'all' || p.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
      return matchFilter && matchSearch;
    }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [posts, filter, search]);

  const savePost = (post: BlogPost) => {
    const existing = posts.findIndex((p) => p.id === post.id);
    let updated: BlogPost[];
    if (existing >= 0) { updated = [...posts]; updated[existing] = post; }
    else { updated = [post, ...posts]; }
    updateSection('blogPosts', updated);
    setEditing(false);
  };

  const deletePost = (id: string) => {
    if (!confirm('Usunąć artykuł?')) return;
    updateSection('blogPosts', posts.filter((p) => p.id !== id));
  };

  if (editing !== false) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <BlogPostEditor post={editing} onSave={savePost} onBack={() => setEditing(false)} config={config} />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Artykuły">
        <Btn onClick={() => setEditing({})}><Plus size={16} /> Nowy artykuł</Btn>
      </TopBar>

      <div style={{ padding: '24px 28px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj artykułu..." style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '14px', color: C.text, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {(['all', 'published', 'draft', 'scheduled'] as const).map((f) => {
            const labels = { all: 'Wszystkie', published: 'Opublikowane', draft: 'Szkice', scheduled: 'Zaplanowane' };
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '999px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: filter === f ? C.accent : C.accentLight, color: filter === f ? '#fff' : C.accent }}>
                {labels[f]}
              </button>
            );
          })}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Wszystkie', value: posts.length, color: C.accent },
            { label: 'Opublikowane', value: posts.filter((p) => p.status === 'published').length, color: C.green },
            { label: 'Szkice', value: posts.filter((p) => p.status === 'draft').length, color: C.yellow },
            { label: 'Zaplanowane', value: posts.filter((p) => p.status === 'scheduled').length, color: '#8B5CF6' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: C.card, borderRadius: '14px', padding: '16px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: C.textMuted, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Post list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: C.textMuted }}>
            <BookOpen size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, margin: '0 0 8px' }}>Brak artykułów</p>
            <Btn onClick={() => setEditing({})}><Plus size={14} /> Dodaj pierwszy artykuł</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((post) => (
              <div key={post.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                background: C.card, borderRadius: '14px', padding: '16px',
                border: `1px solid ${C.border}`, transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,47,140,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Thumbnail */}
                <div style={{ width: '64px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: C.accentLight, flexShrink: 0 }}>
                  {post.imageUrl && <img src={post.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {statusPill(post.status)}
                    {post.copywritingFramework && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: C.accent, background: C.accentLight, padding: '2px 8px', borderRadius: '999px' }}>
                        {COPYWRITING_FRAMEWORKS.find((f) => f.id === post.copywritingFramework)?.name || post.copywritingFramework}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
                  <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px' }}>
                    {post.category} · {formatDate(post.status === 'scheduled' ? (post.scheduledAt || post.publishedAt) : post.publishedAt)}
                    {post.socialPosts?.length > 0 && <span style={{ marginLeft: '8px', color: C.accent }}>· {post.socialPosts.length} post(y) SM</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Btn size="sm" variant="secondary" onClick={() => setEditing(post)}><Edit3 size={13} /></Btn>
                  <Btn size="sm" variant="danger" onClick={() => deletePost(post.id)}><Trash2 size={13} /></Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Multi-Channel Composer
// Krok 1: treść bazowa  →  Krok 2: personalizacja per kanał
// ─────────────────────────────────────────────

type MediaType = 'image' | 'video' | 'pdf';

interface ChannelConfig {
  enabled: boolean;
  useBaseContent: boolean;
  customContent: string;
  hashtags: string;
  mediaUrls: string[];
  mediaTypes: MediaType[];
  scheduledAt: string;
  status: SocialPost['status'];
}

const MEDIA_TYPE_LABELS: Record<MediaType, { label: string; icon: string; accept: string }> = {
  image: { label: 'Grafika', icon: '🖼️', accept: 'image/*' },
  video: { label: 'Wideo',   icon: '🎬', accept: 'video/*' },
  pdf:   { label: 'PDF',     icon: '📄', accept: '.pdf'    },
};

const defaultChannel = (initialDate?: string): ChannelConfig => ({
  enabled: true,
  useBaseContent: true,
  customContent: '',
  hashtags: '',
  mediaUrls: [],
  mediaTypes: [],
  scheduledAt: initialDate ? `${initialDate}T12:00` : '',
  status: initialDate ? 'scheduled' : 'draft',
});

function ChannelPanel({
  platform, cfg, baseContent, onChange, onGenerateAI, aiLoading, savedHashtags,
}: {
  platform: SocialPlatform; cfg: ChannelConfig; baseContent: string;
  onChange: (u: Partial<ChannelConfig>) => void;
  onGenerateAI: (p: SocialPlatform) => void; aiLoading: boolean;
  savedHashtags?: HashtagSet[];
}) {
  const pc = platformColors[platform];
  const charLimit = platform === 'instagram' ? 2200 : platform === 'facebook' ? 63206 : 3000;
  const displayContent = cfg.useBaseContent ? baseContent : cfg.customContent;

  const addMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newUrls: string[] = []; const newTypes: MediaType[] = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        newUrls.push(await compressImage(file)); newTypes.push('image');
      } else if (file.type.startsWith('video/')) {
        const url = await new Promise<string>((res) => { const r = new FileReader(); r.onload = (ev) => res(ev.target?.result as string); r.readAsDataURL(file); });
        newUrls.push(url); newTypes.push('video');
      } else if (file.type === 'application/pdf') {
        newUrls.push(`pdf:${file.name}`); newTypes.push('pdf');
      }
    }
    onChange({ mediaUrls: [...cfg.mediaUrls, ...newUrls], mediaTypes: [...cfg.mediaTypes, ...newTypes] });
    e.target.value = '';
  };

  return (
    <div style={{ flex: 1, minWidth: 0, borderRadius: '18px', border: `2px solid ${cfg.enabled ? pc.text : C.border}`, overflow: 'hidden', opacity: cfg.enabled ? 1 : 0.5, display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
      {/* Header */}
      <div style={{ background: cfg.enabled ? pc.bg : C.bg, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${C.borderLight}` }}>
        <span style={{ color: pc.text }}><PlatformIcon platform={platform} size={18} /></span>
        <span style={{ fontSize: '14px', fontWeight: 800, color: pc.text, flex: 1 }}>{platformLabel[platform]}</span>
        <div onClick={() => onChange({ enabled: !cfg.enabled })} style={{ width: '36px', height: '20px', borderRadius: '999px', background: cfg.enabled ? pc.text : C.border, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '3px', left: cfg.enabled ? '18px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
        </div>
      </div>

      {cfg.enabled && (
        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', background: '#fff' }}>
          {/* Use base toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', background: cfg.useBaseContent ? C.accentLight : C.bg }}>
            <input type="checkbox" checked={cfg.useBaseContent} onChange={(e) => onChange({ useBaseContent: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: cfg.useBaseContent ? C.accent : C.textSoft, flex: 1 }}>Treść bazowa</span>
            {!cfg.useBaseContent && (
              <button onClick={() => onGenerateAI(platform)} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: pc.text, background: pc.bg, border: 'none', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer' }}>
                <Sparkles size={11} /> {aiLoading ? '...' : 'AI'}
              </button>
            )}
          </div>

          {/* Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Treść</span>
              <span style={{ fontSize: '11px', color: displayContent.length > charLimit ? C.red : C.textMuted }}>{displayContent.length}/{charLimit}</span>
            </div>
            <textarea value={displayContent} readOnly={cfg.useBaseContent} onChange={(e) => onChange({ customContent: e.target.value })} placeholder={`Treść dla ${platformLabel[platform]}...`} style={{ width: '100%', minHeight: '140px', padding: '10px 12px', borderRadius: '10px', border: `1.5px solid ${cfg.useBaseContent ? C.borderLight : C.border}`, fontSize: '13px', lineHeight: 1.6, color: C.text, background: cfg.useBaseContent ? C.bg : '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          {/* Hashtags */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}># Hashtagi</span>
              {savedHashtags && savedHashtags.length > 0 && <span style={{ fontSize: '10px', color: C.textMuted }}>Wybierz zestaw</span>}
            </div>
            {savedHashtags && savedHashtags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {savedHashtags.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => {
                      const current = cfg.hashtags ? cfg.hashtags.trim() : '';
                      const extra = set.tags.trim();
                      onChange({ hashtags: current ? `${current} ${extra}` : extra });
                    }}
                    style={{
                      background: C.bg, border: `1px solid ${C.border}`, borderRadius: '6px',
                      padding: '2px 6px', fontSize: '10px', fontWeight: 700, color: C.textSoft,
                      cursor: 'pointer', transition: 'background 0.2s',
                    }}
                  >
                    {set.name}
                  </button>
                ))}
              </div>
            )}
            <textarea value={cfg.hashtags} onChange={(e) => onChange({ hashtags: e.target.value })} placeholder="#HR #HRtech" rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '12px', color: pc.text, fontFamily: 'monospace', outline: 'none', resize: 'vertical', boxSizing: 'border-box', background: '#fff' }} />
          </div>

          {/* Media type buttons */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Media</span>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {(Object.entries(MEDIA_TYPE_LABELS) as [MediaType, typeof MEDIA_TYPE_LABELS[MediaType]][]).map(([type, info]) => (
                <button key={type} onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = info.accept; inp.multiple = true; inp.onchange = (e) => addMedia(e as unknown as React.ChangeEvent<HTMLInputElement>); inp.click(); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', border: `1.5px solid ${C.border}`, background: '#fff', fontSize: '12px', fontWeight: 700, color: C.textSoft, cursor: 'pointer' }}>
                  {info.icon} {info.label}
                </button>
              ))}
            </div>
            {cfg.mediaUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {cfg.mediaUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: `1.5px solid ${C.border}` }}>
                    {cfg.mediaTypes[i] === 'image' ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : cfg.mediaTypes[i] === 'video' ? <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎬</div> : <div style={{ width: '100%', height: '100%', background: C.redLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>}
                    <button onClick={() => onChange({ mediaUrls: cfg.mediaUrls.filter((_, ii) => ii !== i), mediaTypes: cfg.mediaTypes.filter((_, ii) => ii !== i) })} style={{ position: 'absolute', top: '1px', right: '1px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', width: '16px', height: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={9} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>Zaplanuj</span>
              <input type="datetime-local" value={cfg.scheduledAt} onChange={(e) => onChange({ scheduledAt: e.target.value, status: e.target.value ? 'scheduled' : 'draft' })} style={{ width: '100%', padding: '7px 10px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '12px', color: C.text, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ paddingBottom: '1px', flexShrink: 0 }}>{statusPill(cfg.status)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function MultiChannelComposer({
  blogPost, existingPost, initialDate, onSave, onBack, config,
}: {
  blogPost: BlogPost | null;
  existingPost?: SocialPost;
  initialDate?: string;
  onSave: (posts: SocialPost[], blogPostId?: string) => void;
  onBack: () => void;
  config: SiteConfig;
}) {
  const [step, setStep] = useState<1 | 2>(existingPost || initialDate ? 2 : 1);
  const [baseContent, setBaseContent] = useState(existingPost?.content || '');
  const [framework, setFramework] = useState(existingPost?.framework || blogPost?.copywritingFramework || 'aida');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [channelAiLoading, setChannelAiLoading] = useState<SocialPlatform | null>(null);
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [channels, setChannels] = useState<Record<SocialPlatform, ChannelConfig>>(() => {
    const init: Record<SocialPlatform, ChannelConfig> = {
      instagram: defaultChannel(initialDate),
      facebook: defaultChannel(initialDate),
      linkedin: defaultChannel(initialDate),
    };
    if (existingPost) {
      // Disable other channels by default, set target channel values
      (Object.keys(init) as SocialPlatform[]).forEach((p) => {
        init[p].enabled = p === existingPost.platform;
      });
      init[existingPost.platform] = {
        enabled: true,
        useBaseContent: false,
        customContent: existingPost.content,
        hashtags: existingPost.hashtags || '',
        mediaUrls: existingPost.mediaUrls || [],
        mediaTypes: (existingPost.mediaTypes || []) as MediaType[],
        scheduledAt: existingPost.scheduledAt || '',
        status: existingPost.status,
      };
    }
    return init;
  });

  const updateChannel = (p: SocialPlatform, u: Partial<ChannelConfig>) => setChannels((prev) => ({ ...prev, [p]: { ...prev[p], ...u } }));

  const generateBase = async () => {
    if (!blogPost && !baseContent) { setAiStatus('Wpisz kontekst lub wybierz artykuł'); return; }
    setAiLoading(true); setAiStatus('Generuję treść bazową...');
    const fw = COPYWRITING_FRAMEWORKS.find((f) => f.id === framework);
    const context = blogPost ? `Artykuł: "${blogPost.title}"\n${blogPost.excerpt}` : `Kontekst: ${baseContent}`;
    try {
      const res = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: `Jesteś ekspertem content marketingu HR. Użyj frameworku ${fw?.name} (${fw?.description}).\n${context}\nNapisz zwięzłą treść bazową max 1000 znaków po polsku, bez hashtagów.` });
      setBaseContent(res.text?.trim() || ''); setAiStatus('✓ Treść bazowa gotowa');
    } catch { setAiStatus('Błąd AI'); }
    finally { setAiLoading(false); }
  };

  const generateForPlatform = async (platform: SocialPlatform) => {
    if (!baseContent) { setAiStatus('Najpierw wygeneruj treść bazową'); return; }
    setChannelAiLoading(platform);
    const guides: Record<SocialPlatform, string> = { linkedin: 'profesjonalny, B2B, insights, dane, max 1500 znaków', facebook: 'angażujący, storytelling, zadaj pytanie, max 1500 znaków', instagram: 'krótki, emoji, emocje, max 800 znaków' };
    try {
      const [postRes, hashRes] = await Promise.all([
        genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: `Dostosuj poniższy post do ${platformLabel[platform]}: ${guides[platform]}\nTreść bazowa:\n${baseContent}\nTylko treść, bez hashtagów.` }),
        genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: `8-12 hashtagów na ${platformLabel[platform]} dla postu o "${blogPost?.title || 'HR'}". Tylko hashtagi oddzielone spacjami.` }),
      ]);
      updateChannel(platform, { useBaseContent: false, customContent: postRes.text?.trim() || '', hashtags: hashRes.text?.trim() || '' });
      setAiStatus(`✓ ${platformLabel[platform]} gotowy`);
    } catch { setAiStatus('Błąd AI'); }
    finally { setChannelAiLoading(null); }
  };

  const sendAllWebhooks = async () => {
    const url = config.social.makeWebhookUrl;
    if (!url) { setAiStatus('Brak URL webhooka w Ustawieniach'); return; }
    setSendingWebhook(true);
    const enabledPlatforms = (Object.keys(channels) as SocialPlatform[]).filter((p) => channels[p].enabled);
    for (const p of enabledPlatforms) {
      const ch = channels[p];
      const content = ch.useBaseContent ? baseContent : ch.customContent;
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: p,
            content: content + (ch.hashtags ? '\n\n' + ch.hashtags : ''),
            hashtags: ch.hashtags,
            scheduledAt: ch.scheduledAt,
            mediaCount: ch.mediaUrls.length,
            mediaUrls: ch.mediaUrls,
            mediaTypes: ch.mediaTypes,
            blogPostTitle: blogPost?.title,
            timestamp: new Date().toISOString()
          })
        });
        updateChannel(p, { status: resp.ok ? 'sent' : 'error' });
      } catch { updateChannel(p, { status: 'error' }); }
    }
    setSendingWebhook(false); setAiStatus(`✓ Wysłano do make.com (${enabledPlatforms.length} kanały)`);
  };

  const handleSave = () => {
    const posts: SocialPost[] = (Object.keys(channels) as SocialPlatform[]).filter((p) => channels[p].enabled).map((platform) => {
      const ch = channels[platform];
      const isExisting = existingPost && existingPost.platform === platform;
      return {
        id: isExisting ? existingPost.id : `sp_${Date.now()}_${platform}`,
        platform,
        content: ch.useBaseContent ? baseContent : ch.customContent,
        hashtags: ch.hashtags,
        framework,
        status: ch.scheduledAt ? 'scheduled' : ch.status,
        scheduledAt: ch.scheduledAt || undefined,
        mediaUrls: ch.mediaUrls,
        mediaTypes: ch.mediaTypes,
        makeWebhookSent: ch.status === 'sent',
      };
    });
    onSave(posts, blogPost?.id);
  };

  const enabledCount = (Object.keys(channels) as SocialPlatform[]).filter((p) => channels[p].enabled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 28px', borderBottom: `1px solid ${C.border}`, background: '#fff', flexShrink: 0, flexWrap: 'wrap', rowGap: '8px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}><ArrowLeft size={16} /> Powrót</button>
        <span style={{ color: C.border }}>|</span>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: C.text }}>Composer multi-channel</h2>
        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
          {([1, 2] as const).map((s) => (
            <React.Fragment key={s}>
              <div onClick={() => { if (s === 1 || baseContent.trim()) setStep(s); }} style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, cursor: 'pointer', background: step >= s ? C.accent : C.accentLight, color: step >= s ? '#fff' : C.accent }}>{s}</div>
              {s < 2 && <div style={{ width: '28px', height: '2px', background: step > s ? C.accent : C.border }} />}
            </React.Fragment>
          ))}
          <span style={{ fontSize: '13px', color: C.textSoft, fontWeight: 600, marginLeft: '4px' }}>{step === 1 ? 'Treść bazowa' : 'Personalizacja kanałów'}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          {aiStatus && <span style={{ fontSize: '12px', color: aiStatus.startsWith('✓') ? C.green : C.textMuted }}>{aiStatus}</span>}
          {step === 2 && config.social.makeWebhookUrl && (
            <Btn variant="secondary" size="sm" onClick={sendAllWebhooks} disabled={sendingWebhook}><Send size={14} />{sendingWebhook ? 'Wysyłam...' : `make.com (${enabledCount})`}</Btn>
          )}
          <Btn onClick={handleSave} disabled={enabledCount === 0}><Save size={14} /> Zapisz ({enabledCount})</Btn>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ padding: '28px', maxWidth: '760px' }}>
            {blogPost && <div style={{ background: C.accentLight, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: C.accent, display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={16} /><span><strong>Artykuł:</strong> {blogPost.title}</span></div>}
            <FrameworkSelector value={framework} onChange={setFramework} />
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Treść bazowa <span style={{ color: C.textMuted, fontWeight: 400, textTransform: 'none' }}>(punkt wyjścia dla wszystkich kanałów)</span></label>
                <Btn variant="secondary" size="sm" onClick={generateBase} disabled={aiLoading}><Sparkles size={13} />{aiLoading ? 'Generuję...' : 'Generuj AI'}</Btn>
              </div>
              <textarea value={baseContent} onChange={(e) => setBaseContent(e.target.value)} placeholder={"Wpisz treść bazową lub wygeneruj AI...\n\nNa kolejnym kroku możesz ją spersonalizować osobno dla LinkedIn, Facebook i Instagram."} style={{ width: '100%', minHeight: '200px', padding: '16px', borderRadius: '14px', border: `1.5px solid ${C.border}`, fontSize: '14px', lineHeight: 1.7, color: C.text, background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '6px' }}>{baseContent.length} znaków</div>
            </div>

            {/* Channel selection */}
            <div style={{ background: C.bg, borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, marginBottom: '14px' }}>Wybierz kanały publikacji</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {(Object.keys(channels) as SocialPlatform[]).map((p) => {
                  const pc = platformColors[p]; const enabled = channels[p].enabled;
                  return (
                    <div key={p} onClick={() => updateChannel(p, { enabled: !enabled })} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '12px', border: `2px solid ${enabled ? pc.text : C.border}`, background: enabled ? pc.bg : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <span style={{ color: enabled ? pc.text : C.textMuted }}><PlatformIcon platform={p} size={20} /></span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: enabled ? pc.text : C.textSoft }}>{platformLabel[p]}</span>
                      {enabled ? <CheckCircle size={16} style={{ color: pc.text }} /> : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${C.border}` }} />}
                    </div>
                  );
                })}
              </div>
            </div>
            <Btn onClick={() => setStep(2)} disabled={!baseContent.trim()} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              Dalej: Personalizuj kanały <ChevronRight size={16} />
            </Btn>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ padding: '24px 28px' }}>
            {/* AI adapt buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: C.accentLight, borderRadius: '14px', padding: '14px 20px', flexWrap: 'wrap' }}>
              <Sparkles size={20} style={{ color: C.accent, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: C.accent, marginBottom: '2px' }}>Dostosuj AI per kanał</div>
                <div style={{ fontSize: '12px', color: C.textSoft }}>Kliknij platformę — AI przepisze treść pod jej styl i doda hashtagi</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(Object.keys(channels) as SocialPlatform[]).filter((p) => channels[p].enabled).map((p) => {
                  const pc = platformColors[p];
                  return (
                    <button key={p} onClick={() => generateForPlatform(p)} disabled={!!channelAiLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', border: 'none', background: pc.bg, color: pc.text, fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: channelAiLoading && channelAiLoading !== p ? 0.5 : 1 }}>
                      <PlatformIcon platform={p} size={14} />{channelAiLoading === p ? '...' : platformLabel[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 channel panels */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', minHeight: '400px' }}>
              {(Object.keys(channels) as SocialPlatform[]).map((p) => (
                <ChannelPanel key={p} platform={p} cfg={channels[p]} baseContent={baseContent} onChange={(u) => updateChannel(p, u)} onGenerateAI={generateForPlatform} aiLoading={channelAiLoading === p} savedHashtags={config.social.savedHashtags || []} />
              ))}
            </div>

            {/* Webhook status */}
            {config.social.makeWebhookUrl && (
              <div style={{ marginTop: '20px', background: '#fff', borderRadius: '14px', border: `1px solid ${C.border}`, padding: '16px 20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>📡 Statusy wysyłki make.com</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {(Object.keys(channels) as SocialPlatform[]).filter((p) => channels[p].enabled).map((p) => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><PlatformIcon platform={p} size={14} />{statusPill(channels[p].status)}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SocialTab({ config, updateSection, onCreatePost, onEditPost }: {
  config: SiteConfig;
  updateSection: <K extends keyof SiteConfig>(section: K, value: SiteConfig[K]) => void;
  onCreatePost: (blogPost: BlogPost | null) => void;
  onEditPost: (blogPost: BlogPost, existingPost: SocialPost) => void;
}) {
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');

  // Collect all social posts from all blog posts
  const allSocialPosts = useMemo(() => {
    const list: { sp: SocialPost; bp: BlogPost }[] = [];
    (config.blogPosts || []).forEach((bp) => {
      (bp.socialPosts || []).forEach((sp) => list.push({ sp, bp }));
    });
    return list.sort((a, b) => (b.sp.scheduledAt || '').localeCompare(a.sp.scheduledAt || ''));
  }, [config.blogPosts]);

  const filtered = useMemo(() => {
    if (platformFilter === 'all') return allSocialPosts;
    return allSocialPosts.filter(({ sp }) => sp.platform === platformFilter);
  }, [allSocialPosts, platformFilter]);

  const deletePost = (spId: string, bpId: string) => {
    if (!confirm('Usunąć post?')) return;
    const posts = (config.blogPosts || []).map((bp) => bp.id === bpId ? { ...bp, socialPosts: (bp.socialPosts || []).filter((s) => s.id !== spId) } : bp);
    updateSection('blogPosts', posts);
  };

  return (
    <div>
      <TopBar title="Social Media">
        <Btn onClick={() => onCreatePost(null)}><Plus size={16} /> Nowy post</Btn>
      </TopBar>

      <div style={{ padding: '24px 28px' }}>
        {/* Platform filter tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          {(['all', 'linkedin', 'facebook', 'instagram'] as const).map((p) => {
            const labels: Record<string, string> = { all: 'Wszystkie', linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram' };
            const isActive = platformFilter === p;
            const pColors2 = p !== 'all' ? platformColors[p as SocialPlatform] : null;
            return (
              <button key={p} onClick={() => setPlatformFilter(p)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '12px', border: 'none',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                background: isActive ? (pColors2?.bg || C.accent) : '#fff',
                color: isActive ? (pColors2?.text || '#fff') : C.textSoft,
                borderColor: `${isActive ? (pColors2?.text || C.accent) : C.border}`,
              }}>
                {p !== 'all' && <PlatformIcon platform={p as SocialPlatform} size={14} />}
                {labels[p]}
                <span style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '999px', padding: '1px 6px', fontSize: '11px' }}>
                  {p === 'all' ? allSocialPosts.length : allSocialPosts.filter(({ sp }) => sp.platform === p).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick create from blog post */}
        {(config.blogPosts || []).length > 0 && (
          <div style={{ background: C.accentLight, borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Sparkles size={20} style={{ color: C.accent, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: C.accent, marginBottom: '4px' }}>Utwórz post na bazie artykułu</div>
              <select
                onChange={(e) => {
                  const bp = config.blogPosts.find((p) => p.id === e.target.value);
                  if (bp) onCreatePost(bp);
                  e.target.value = '';
                }}
                defaultValue=""
                style={{ padding: '8px 12px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '13px', color: C.text, background: '#fff', outline: 'none', maxWidth: '320px' }}
              >
                <option value="" disabled>Wybierz artykuł...</option>
                {config.blogPosts.map((bp) => <option key={bp.id} value={bp.id}>{bp.title}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Posts list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: C.textMuted }}>
            <Share2 size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, margin: '0 0 8px' }}>Brak postów</p>
            <Btn onClick={() => onCreatePost(null)}><Plus size={14} /> Stwórz pierwszy post</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(({ sp, bp }) => {
              const pc = platformColors[sp.platform];
              return (
                <div key={sp.id} style={{ background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: `1px solid ${C.borderLight}`, background: pc.bg }}>
                    <span style={{ color: pc.text }}><PlatformIcon platform={sp.platform} size={18} /></span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: pc.text }}>{platformLabel[sp.platform]}</span>
                    {statusPill(sp.status)}
                    {sp.scheduledAt && <span style={{ fontSize: '12px', color: C.textMuted, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{formatDateTime(sp.scheduledAt)}</span>}
                    <div style={{ marginLeft: sp.scheduledAt ? '0' : 'auto', display: 'flex', gap: '6px' }}>
                      <Btn size="sm" variant="secondary" onClick={() => onEditPost(bp, sp)}><Edit3 size={13} /></Btn>
                      <Btn size="sm" variant="danger" onClick={() => deletePost(sp.id, bp.id)}><Trash2 size={13} /></Btn>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: C.text, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sp.content}</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: C.textMuted }}>
                      {sp.hashtags && <span style={{ color: pc.text }}>{sp.hashtags.split(' ').slice(0, 5).join(' ')}...</span>}
                      {sp.mediaUrls.length > 0 && <span>📎 {sp.mediaUrls.length} plik(i)</span>}
                      <span style={{ fontSize: '11px', background: C.accentLight, color: C.accent, padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                        {COPYWRITING_FRAMEWORKS.find((f) => f.id === sp.framework)?.name || sp.framework}
                      </span>
                      <span style={{ marginLeft: 'auto' }}>📄 {bp.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Calendar Tab
// ─────────────────────────────────────────────
function CalendarTab({ config, onAddPost, onEditPost }: {
  config: SiteConfig;
  onAddPost: (dateStr: string) => void;
  onEditPost: (bp: BlogPost, sp: SocialPost) => void;
}) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Mon=0

  // Collect all events
  const events = useMemo(() => {
    const list: {
      day: number;
      label: string;
      type: 'blog' | 'social';
      platform?: SocialPlatform;
      color: string;
      sp?: SocialPost;
      bp?: BlogPost;
    }[] = [];

    (config.blogPosts || []).forEach((bp) => {
      const date = bp.status === 'scheduled' ? bp.scheduledAt : bp.publishedAt;
      if (!date) return;
      const d = new Date(date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        list.push({ day: d.getDate(), label: bp.title, type: 'blog', color: '#3B2F8C', bp });
      }
      (bp.socialPosts || []).forEach((sp) => {
        if (!sp.scheduledAt) return;
        const sd = new Date(sp.scheduledAt);
        if (sd.getFullYear() === currentYear && sd.getMonth() === currentMonth) {
          const pc = platformColors[sp.platform];
          list.push({
            day: sd.getDate(),
            label: `${platformLabel[sp.platform]}: ${bp.title}`,
            type: 'social',
            platform: sp.platform,
            color: pc.text,
            sp,
            bp,
          });
        }
      });
    });

    return list;
  }, [config, currentYear, currentMonth]);

  const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  return (
    <div>
      <TopBar title="Kalendarz publikacji" />
      <div style={{ padding: '24px 28px' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button onClick={prevMonth} style={{ background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={18} /></button>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: C.text, flex: 1 }}>{monthNames[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} style={{ background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', display: 'flex' }}><ChevronRight size={18} /></button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3B2F8C', display: 'inline-block' }} />Artykuł blogowy</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: C.linkedin, display: 'inline-block' }} />LinkedIn</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: C.facebook, display: 'inline-block' }} />Facebook</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: C.instagram, display: 'inline-block' }} />Instagram</span>
        </div>

        {/* Calendar grid */}
        <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${C.border}` }}>
            {dayNames.map((d) => (
              <div key={d} style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: '100px', borderRight: `1px solid ${C.borderLight}`, borderBottom: `1px solid ${C.borderLight}`, background: C.bg, opacity: 0.5 }} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = events.filter((e) => e.day === day);
              const isToday = now.getDate() === day && now.getMonth() === currentMonth && now.getFullYear() === currentYear;
              const col = (firstDayOfWeek + i) % 7;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return (
                <div key={day} style={{
                  minHeight: '100px', padding: '8px',
                  borderRight: col < 6 ? `1px solid ${C.borderLight}` : 'none',
                  borderBottom: `1px solid ${C.borderLight}`,
                  background: isToday ? '#FAFAFE' : '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: isToday ? 900 : 600,
                      color: isToday ? '#fff' : C.text,
                      background: isToday ? C.accent : 'transparent',
                    }}>{day}</div>
                    <button
                      onClick={() => onAddPost(dateStr)}
                      title="Zaplanuj post na ten dzień"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: C.accent, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '4px', borderRadius: '6px',
                      }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {dayEvents.slice(0, 3).map((ev, ei) => (
                      <div
                        key={ei}
                        title={ev.label}
                        onClick={() => {
                          if (ev.type === 'social' && ev.bp && ev.sp) {
                            onEditPost(ev.bp, ev.sp);
                          }
                        }}
                        style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                          borderRadius: '4px', background: ev.color,
                          color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', cursor: ev.type === 'social' ? 'pointer' : 'default',
                        }}
                      >{ev.label}</div>
                    ))}
                    {dayEvents.length > 3 && <div style={{ fontSize: '10px', color: C.textMuted, fontWeight: 600 }}>+{dayEvents.length - 3} więcej</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: C.text, margin: '0 0 16px' }}>Nadchodzące publikacje</h3>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: C.textMuted, background: '#fff', borderRadius: '14px', border: `1px solid ${C.border}` }}>
              <CalendarDays size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p style={{ margin: 0 }}>Brak zaplanowanych publikacji w tym miesiącu</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.sort((a, b) => a.day - b.day).map((ev, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (ev.type === 'social' && ev.bp && ev.sp) {
                      onEditPost(ev.bp, ev.sp);
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fff', borderRadius: '12px', padding: '12px 16px',
                    border: `1px solid ${C.border}`, cursor: ev.type === 'social' ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, flex: 1 }}>{ev.label}</div>
                  <div style={{ fontSize: '12px', color: C.textMuted }}>{monthNames[currentMonth].slice(0, 3)} {ev.day}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Pages Tab
// ─────────────────────────────────────────────
function PagesTab({ config, updateSection }: { config: SiteConfig; updateSection: <K extends keyof SiteConfig>(section: K, value: SiteConfig[K]) => void }) {
  const [activeSection, setActiveSection] = useState<'hero' | 'stats' | 'contact' | 'footer' | 'global'>('hero');
  const [saved, setSaved] = useState(false);

  const sections = [
    { id: 'hero', label: 'Hero', icon: '🚀' },
    { id: 'stats', label: 'Statystyki', icon: '📊' },
    { id: 'global', label: 'Globalne', icon: '🌐' },
    { id: 'contact', label: 'Kontakt', icon: '📬' },
    { id: 'footer', label: 'Stopka', icon: '📄' },
  ] as const;

  const handleSave = (section: keyof SiteConfig, data: unknown) => {
    updateSection(section, data as SiteConfig[typeof section]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Section nav */}
      <div style={{ width: '160px', padding: '20px 12px', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', padding: '0 8px' }}>Sekcje strony</div>
        {sections.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
            borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            color: activeSection === s.id ? C.accent : C.textSoft,
            background: activeSection === s.id ? C.accentLight : 'transparent',
          }}>
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: C.text }}>
            {sections.find((s) => s.id === activeSection)?.icon} {sections.find((s) => s.id === activeSection)?.label}
          </h2>
          {saved && <span style={{ color: C.green, fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} />Zapisano!</span>}
        </div>

        {activeSection === 'hero' && (
          <HeroForm config={config} onSave={(d) => handleSave('hero', d)} />
        )}
        {activeSection === 'stats' && (
          <StatsForm config={config} onSave={(d) => handleSave('stats', d)} />
        )}
        {activeSection === 'contact' && (
          <ContactForm config={config} onSave={(d) => handleSave('contact', d)} />
        )}
        {activeSection === 'footer' && (
          <FooterForm config={config} onSave={(d) => handleSave('footer', d)} />
        )}
        {activeSection === 'global' && (
          <GlobalForm config={config} onSave={(d) => handleSave('global', d)} />
        )}
      </div>
    </div>
  );
}

function HeroForm({ config, onSave }: { config: SiteConfig; onSave: (d: SiteConfig['hero']) => void }) {
  const [v, setV] = useState({ ...config.hero });
  useEffect(() => setV({ ...config.hero }), [config.hero]);
  return (
    <div>
      <Input label="Headline" value={v.headline} onChange={(val) => setV((p) => ({ ...p, headline: val }))} placeholder="Zmień dane HR w strategiczne decyzje." />
      <Input label="Podtytuł" value={v.subheadline} onChange={(val) => setV((p) => ({ ...p, subheadline: val }))} multiline rows={3} />
      <Input label="Tekst badge" value={v.badge} onChange={(val) => setV((p) => ({ ...p, badge: val }))} />
      <Input label="Tekst CTA główny" value={v.ctaPrimaryText} onChange={(val) => setV((p) => ({ ...p, ctaPrimaryText: val }))} />
      <Input label="Link CTA główny" value={v.ctaPrimaryLink} onChange={(val) => setV((p) => ({ ...p, ctaPrimaryLink: val }))} />
      <Input label="Tekst CTA drugorzędny" value={v.ctaSecondaryText} onChange={(val) => setV((p) => ({ ...p, ctaSecondaryText: val }))} />
      <Btn onClick={() => onSave(v)}><Save size={14} /> Zapisz sekcję Hero</Btn>
    </div>
  );
}

function StatsForm({ config, onSave }: { config: SiteConfig; onSave: (d: SiteConfig['stats']) => void }) {
  const [v, setV] = useState({ ...config.stats });
  useEffect(() => setV({ ...config.stats }), [config.stats]);
  return (
    <div>
      {([1, 2, 3] as const).map((n) => (
        <div key={n} style={{ background: C.bg, borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.textSoft, marginBottom: '12px' }}>Statystyka {n}</div>
          <Input label="Wartość" value={(v as any)[`stat${n}Value`]} onChange={(val) => setV((p) => ({ ...p, [`stat${n}Value`]: val }))} />
          <Input label="Etykieta" value={(v as any)[`stat${n}Label`]} onChange={(val) => setV((p) => ({ ...p, [`stat${n}Label`]: val }))} />
        </div>
      ))}
      <Btn onClick={() => onSave(v)}><Save size={14} /> Zapisz Statystyki</Btn>
    </div>
  );
}

function ContactForm({ config, onSave }: { config: SiteConfig; onSave: (d: SiteConfig['contact']) => void }) {
  const [v, setV] = useState({ ...config.contact });
  useEffect(() => setV({ ...config.contact }), [config.contact]);
  return (
    <div>
      <Input label="Email" value={v.email} onChange={(val) => setV((p) => ({ ...p, email: val }))} type="email" />
      <Input label="Telefon" value={v.phone} onChange={(val) => setV((p) => ({ ...p, phone: val }))} />
      <Input label="Adres" value={v.address} onChange={(val) => setV((p) => ({ ...p, address: val }))} />
      <Input label="LinkedIn URL" value={v.linkedIn} onChange={(val) => setV((p) => ({ ...p, linkedIn: val }))} />
      <Input label="Calendly / Link do kalendarza" value={v.calendarLink} onChange={(val) => setV((p) => ({ ...p, calendarLink: val }))} />
      <Btn onClick={() => onSave(v)}><Save size={14} /> Zapisz Kontakt</Btn>
    </div>
  );
}

function FooterForm({ config, onSave }: { config: SiteConfig; onSave: (d: SiteConfig['footer']) => void }) {
  const [v, setV] = useState({ ...config.footer });
  useEffect(() => setV({ ...config.footer }), [config.footer]);
  return (
    <div>
      <Input label="Opis firmy" value={v.companyDescription} onChange={(val) => setV((p) => ({ ...p, companyDescription: val }))} multiline rows={3} />
      <Input label="LinkedIn URL" value={v.linkedIn} onChange={(val) => setV((p) => ({ ...p, linkedIn: val }))} />
      <Input label="Facebook URL" value={v.facebook} onChange={(val) => setV((p) => ({ ...p, facebook: val }))} />
      <Input label="Copyright" value={v.copyright} onChange={(val) => setV((p) => ({ ...p, copyright: val }))} />
      <Btn onClick={() => onSave(v)}><Save size={14} /> Zapisz Stopkę</Btn>
    </div>
  );
}

function GlobalForm({ config, onSave }: { config: SiteConfig; onSave: (d: SiteConfig['global']) => void }) {
  const [v, setV] = useState({ ...config.global });
  useEffect(() => setV({ ...config.global }), [config.global]);
  return (
    <div>
      <Input label="Nazwa strony" value={v.siteName} onChange={(val) => setV((p) => ({ ...p, siteName: val }))} />
      <Input label="Tagline" value={v.tagline} onChange={(val) => setV((p) => ({ ...p, tagline: val }))} />
      <Input label="Główny link CTA" value={v.primaryCTALink} onChange={(val) => setV((p) => ({ ...p, primaryCTALink: val }))} />
      <Input label="Tekst głównego CTA" value={v.primaryCTAText} onChange={(val) => setV((p) => ({ ...p, primaryCTAText: val }))} />
      <Input label="Hasło admina" value={v.adminPassword} onChange={(val) => setV((p) => ({ ...p, adminPassword: val }))} type="password" />
      <Btn onClick={() => onSave(v)}><Save size={14} /> Zapisz Ustawienia globalne</Btn>
    </div>
  );
}

// ─────────────────────────────────────────────
// Settings Tab
// ─────────────────────────────────────────────
function SettingsTab({ config, updateSection }: { config: SiteConfig; updateSection: <K extends keyof SiteConfig>(section: K, value: SiteConfig[K]) => void }) {
  const [social, setSocial] = useState({ ...config.social });
  const [saved, setSaved] = useState(false);
  const [webhookTest, setWebhookTest] = useState('');

  const handleSave = () => {
    updateSection('social', social);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testWebhook = async () => {
    if (!social.makeWebhookUrl) { setWebhookTest('Brak URL'); return; }
    setWebhookTest('Wysyłam test...');
    try {
      await fetch(social.makeWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true, timestamp: new Date().toISOString(), source: 'HRly Admin Panel' }) });
      setWebhookTest('✓ Test wysłany! Sprawdź make.com.');
    } catch { setWebhookTest('✗ Błąd połączenia'); }
  };

  const exportData = () => {
    const data = JSON.stringify(loadConfig(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrly-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <TopBar title="Ustawienia" />
      <div style={{ padding: '24px 28px', maxWidth: '640px' }}>
        {/* make.com integration */}
        <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: C.text, margin: '0 0 4px' }}>⚙️ Integracja make.com</h3>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 20px' }}>Webhook do automatycznej publikacji postów social media</p>

          <Input label="URL webhooka make.com" value={social.makeWebhookUrl} onChange={(v) => setSocial((p) => ({ ...p, makeWebhookUrl: v }))} placeholder="https://hook.eu1.make.com/..." />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <Btn onClick={testWebhook} variant="secondary" size="sm"><Zap size={13} /> Testuj webhook</Btn>
          </div>
          {webhookTest && <div style={{ fontSize: '12px', color: webhookTest.startsWith('✓') ? C.green : webhookTest.startsWith('✗') ? C.red : C.textMuted, marginBottom: '8px' }}>{webhookTest}</div>}

          <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '20px 0' }} />

          <h4 style={{ fontSize: '14px', fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Page IDs (opcjonalnie)</h4>
          <Input label="LinkedIn Page ID" value={social.linkedinPageId} onChange={(v) => setSocial((p) => ({ ...p, linkedinPageId: v }))} placeholder="np. 12345678" />
          <Input label="Facebook Page ID" value={social.facebookPageId} onChange={(v) => setSocial((p) => ({ ...p, facebookPageId: v }))} placeholder="np. 12345678" />
          <Input label="Instagram Account ID" value={social.instagramPageId} onChange={(v) => setSocial((p) => ({ ...p, instagramPageId: v }))} placeholder="np. 12345678" />

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Btn onClick={handleSave}><Save size={14} /> Zapisz integrację</Btn>
            {saved && <span style={{ color: C.green, fontSize: '13px', fontWeight: 700 }}>✓ Zapisano!</span>}
          </div>
        </div>

        {/* Saved hashtags sets */}
        <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: C.text, margin: '0 0 4px' }}>🏷️ Zapisane zestawy hashtagów</h3>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 20px' }}>Twórz skróty do zestawów hashtagów, których często używasz w postach</p>

          {/* List */}
          {(social.savedHashtags || []).length === 0 ? (
            <div style={{ padding: '16px', border: `1px dashed ${C.border}`, borderRadius: '12px', textAlign: 'center', color: C.textMuted, fontSize: '13px', marginBottom: '16px' }}>
              Brak zapisanych zestawów. Dodaj pierwszy poniżej.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {(social.savedHashtags || []).map((set) => (
                <div key={set.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: C.bg, borderRadius: '12px', padding: '12px 16px', border: `1px solid ${C.borderLight}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{set.name}</div>
                    <div style={{ fontSize: '12px', color: C.accent, fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all' }}>{set.tags}</div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = (social.savedHashtags || []).filter((s) => s.id !== set.id);
                      setSocial((prev) => ({ ...prev, savedHashtags: updated }));
                      updateSection('social', { ...config.social, savedHashtags: updated });
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                    title="Usuń zestaw"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Inline add form */}
          <div style={{ background: C.bg, padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dodaj nowy zestaw</div>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px' }}>
              <input
                id="new-hashset-name"
                placeholder="Nazwa, np. HR B2B"
                style={{ padding: '8px 12px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '13px', color: C.text, outline: 'none' }}
              />
              <input
                id="new-hashset-tags"
                placeholder="Hashtagi, np. #analitykaHR #leadership"
                style={{ padding: '8px 12px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '13px', color: C.text, outline: 'none' }}
              />
            </div>
            <Btn
              size="sm"
              onClick={() => {
                const nameEl = document.getElementById('new-hashset-name') as HTMLInputElement;
                const tagsEl = document.getElementById('new-hashset-tags') as HTMLInputElement;
                if (!nameEl?.value.trim() || !tagsEl?.value.trim()) return;

                const newSet: HashtagSet = {
                  id: `set_${Date.now()}`,
                  name: nameEl.value.trim(),
                  tags: tagsEl.value.trim(),
                };

                const updated = [...(social.savedHashtags || []), newSet];
                setSocial((prev) => ({ ...prev, savedHashtags: updated }));
                updateSection('social', { ...config.social, savedHashtags: updated });

                nameEl.value = '';
                tagsEl.value = '';
              }}
            >
              <Plus size={13} /> Dodaj zestaw
            </Btn>
          </div>
        </div>

        {/* Export */}
        <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: C.text, margin: '0 0 4px' }}>💾 Kopia zapasowa</h3>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 16px' }}>Eksportuj wszystkie dane do pliku JSON</p>
          <Btn onClick={exportData} variant="ghost"><Download size={14} />Eksportuj dane</Btn>
        </div>

        {/* Info */}
        <div style={{ background: C.accentLight, borderRadius: '16px', padding: '16px 20px', fontSize: '13px', color: C.accent }}>
          <strong>Panel admin HRly</strong> — dane są przechowywane lokalnie w przeglądarce (localStorage). Każda zmiana jest natychmiast widoczna na stronie. Regularnie wykonuj kopię zapasową.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Dashboard Tab
// ─────────────────────────────────────────────
function DashboardTab({ config, onNav }: { config: SiteConfig; onNav: (t: Tab) => void }) {
  const posts = config.blogPosts || [];
  const allSocial = posts.flatMap((p) => p.socialPosts || []);
  const leads = config.leads || [];
  const subs = config.subscribers || [];

  const stats = [
    { label: 'Artykuły', value: posts.length, sub: `${posts.filter((p) => p.status === 'published').length} opublikowanych`, icon: <FileText size={22} />, color: C.accent, tab: 'blog' as Tab },
    { label: 'Posty SM', value: allSocial.length, sub: `${allSocial.filter((s) => s.status === 'sent').length} wysłanych`, icon: <Share2 size={22} />, color: '#0A66C2', tab: 'social' as Tab },
    { label: 'Zaplanowane', value: posts.filter((p) => p.status === 'scheduled').length + allSocial.filter((s) => s.status === 'scheduled').length, sub: 'artykuły + posty', icon: <CalendarDays size={22} />, color: '#D97706', tab: 'calendar' as Tab },
    { label: 'Leady', value: leads.length, sub: `${leads.filter((l) => !l.read).length} nieprzeczytanych`, icon: <Mail size={22} />, color: C.green, tab: 'settings' as Tab },
  ];

  const recentPosts = posts.slice(0, 5);
  const recentSocial = allSocial.slice(0, 5);

  return (
    <div>
      <TopBar title="Dashboard">
        <Btn onClick={() => onNav('blog')}><Plus size={16} /> Nowy artykuł</Btn>
      </TopBar>

      <div style={{ padding: '24px 28px' }}>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {stats.map((s) => (
            <div key={s.label}
              onClick={() => onNav(s.tab)}
              style={{
                background: '#fff', borderRadius: '18px', padding: '20px',
                border: `1px solid ${C.border}`, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(59,47,140,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <ChevronRight size={16} style={{ color: C.textMuted }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: C.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, margin: '4px 0 2px' }}>{s.label}</div>
              <div style={{ fontSize: '12px', color: C.textMuted }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Recent articles */}
          <div style={{ background: '#fff', borderRadius: '18px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: C.text }}>Ostatnie artykuły</h3>
              <button onClick={() => onNav('blog')} style={{ fontSize: '12px', color: C.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Zobacz wszystkie →</button>
            </div>
            {recentPosts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: C.textMuted }}>
                <BookOpen size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '13px' }}>Brak artykułów</p>
              </div>
            ) : recentPosts.map((p) => (
              <div key={p.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{p.category} · {formatDate(p.publishedAt)}</div>
                </div>
                {statusPill(p.status)}
              </div>
            ))}
          </div>

          {/* Recent social posts */}
          <div style={{ background: '#fff', borderRadius: '18px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: C.text }}>Ostatnie posty SM</h3>
              <button onClick={() => onNav('social')} style={{ fontSize: '12px', color: C.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Zobacz wszystkie →</button>
            </div>
            {recentSocial.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: C.textMuted }}>
                <Share2 size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '13px' }}>Brak postów</p>
              </div>
            ) : recentSocial.map((sp, i) => {
              const pc = platformColors[sp.platform];
              return (
                <div key={sp.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: pc.text }}><PlatformIcon platform={sp.platform} size={16} /></span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.content?.slice(0, 60)}...</div>
                    <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{platformLabel[sp.platform]}{sp.scheduledAt ? ' · ' + formatDateTime(sp.scheduledAt) : ''}</div>
                  </div>
                  {statusPill(sp.status)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Login Screen
// ─────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const stored = loadConfig().global.adminPassword;
    if (password === stored) { onLogin(); }
    else { setError('Nieprawidłowe hasło'); setPassword(''); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #14183D 0%, #3B2F8C 100%)',
    }}>
      <div style={{ background: '#fff', borderRadius: '28px', padding: '48px', width: '380px', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.05em', color: '#14183D', marginBottom: '4px' }}>
            hr<span style={{ color: '#3B2F8C' }}>ly</span>
          </div>
          <div style={{ fontSize: '14px', color: '#6B6484' }}>Panel Administratora</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6B6484', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoFocus
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: `1.5px solid ${error ? '#DC2626' : '#E8E3F0'}`,
                fontSize: '15px', color: '#14183D', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {error && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>{error}</div>}
          </div>

          <button type="submit" disabled={loading || !password} style={{
            width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #3B2F8C, #14183D)',
            color: '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
          }}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#A39AB4', marginTop: '20px', marginBottom: 0 }}>
          Domyślne hasło: <code style={{ color: '#3B2F8C' }}>hrly2024</code>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Newsletter Tab
// ─────────────────────────────────────────────
function NewsletterTab({ config, updateSection }: { config: SiteConfig; updateSection: <K extends keyof SiteConfig>(section: K, value: SiteConfig[K]) => void }) {
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const subscribers = config.subscribers || [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subscribers.filter((s) =>
      !q || s.email.toLowerCase().includes(q) || (s.source || '').toLowerCase().includes(q)
    ).sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
  }, [subscribers, search]);

  const deleteSubscriber = (id: string) => {
    updateSection('subscribers', subscribers.filter((s) => s.id !== id));
    setConfirmDelete(null);
  };

  const exportCsv = () => {
    const header = 'Email,Źródło,Data zapisu';
    const rows = subscribers.map((s) =>
      `"${s.email}","${s.source || ''}","${new Date(s.subscribedAt).toLocaleDateString('pl-PL')}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrly-newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // stats per source
  const sourceStats = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach((s) => { const src = s.source || 'Inne'; map[src] = (map[src] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [subscribers]);

  // stats per month (last 6 months)
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
      const count = subscribers.filter((s) => {
        const sd = new Date(s.subscribedAt);
        return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }
    return months;
  }, [subscribers]);

  const maxMonthly = Math.max(...monthlyStats.map((m) => m.count), 1);

  return (
    <div>
      <TopBar title="Newsletter">
        <Btn onClick={exportCsv} variant="ghost" size="sm">
          <Download size={14} /> Eksportuj CSV
        </Btn>
      </TopBar>

      <div style={{ padding: '24px 28px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: C.card, borderRadius: '18px', padding: '20px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '36px', fontWeight: 900, color: C.accent, letterSpacing: '-0.03em' }}>{subscribers.length}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>Łączna liczba subskrybentów</div>
          </div>
          <div style={{ background: C.card, borderRadius: '18px', padding: '20px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '36px', fontWeight: 900, color: C.green, letterSpacing: '-0.03em' }}>
              {subscribers.filter((s) => {
                const d = new Date(s.subscribedAt);
                const now = new Date();
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
              }).length}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>Nowi w tym miesiącu</div>
          </div>
          <div style={{ background: C.card, borderRadius: '18px', padding: '20px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '36px', fontWeight: 900, color: C.orange, letterSpacing: '-0.03em' }}>
              {subscribers.filter((s) => {
                const d = new Date(s.subscribedAt);
                const week = new Date(); week.setDate(week.getDate() - 7);
                return d >= week;
              }).length}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>Nowi w ostatnim tygodniu</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', marginBottom: '24px' }}>
          {/* Monthly chart */}
          <div style={{ background: C.card, borderRadius: '18px', border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: C.text, marginBottom: '16px' }}>Zapisy — ostatnie 6 miesięcy</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
              {monthlyStats.map((m) => (
                <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: C.accent }}>{m.count || ''}</div>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: m.count > 0 ? C.accent : C.accentLight,
                    height: `${Math.max((m.count / maxMonthly) * 60, m.count > 0 ? 6 : 0)}px`,
                    transition: 'height 0.3s',
                  }} />
                  <div style={{ fontSize: '10px', color: C.textMuted, fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Source breakdown */}
          <div style={{ background: C.card, borderRadius: '18px', border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: C.text, marginBottom: '16px' }}>Źródła zapisów</div>
            {sourceStats.length === 0 ? (
              <div style={{ color: C.textMuted, fontSize: '13px' }}>Brak danych</div>
            ) : sourceStats.map(([src, count]) => (
              <div key={src} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '3px' }}>{src}</div>
                  <div style={{ height: '6px', borderRadius: '999px', background: C.accentLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', background: C.accent, width: `${(count / subscribers.length) * 100}%` }} />
                  </div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: C.accent, minWidth: '24px', textAlign: 'right' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search + list */}
        <div style={{ background: C.card, borderRadius: '18px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Szukaj po emailu lub źródle..."
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '14px', color: C.text, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ fontSize: '13px', color: C.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {filtered.length} z {subscribers.length}
            </div>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 160px 40px', padding: '10px 20px', background: C.bg, fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Email</span>
            <span>Źródło</span>
            <span>Data zapisu</span>
            <span></span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: C.textMuted }}>
              <Mail size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Brak subskrybentów</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Gdy ktoś zapisze się przez formularz na stronie, pojawi się tutaj</p>
            </div>
          ) : filtered.map((sub) => (
            <div key={sub.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 200px 160px 40px',
              padding: '12px 20px', borderBottom: `1px solid ${C.borderLight}`,
              alignItems: 'center',
              background: confirmDelete === sub.id ? C.redLight : 'transparent',
              transition: 'background 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: C.accentLight, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: C.accent,
                  flexShrink: 0,
                }}>
                  {sub.email[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', color: C.text, fontWeight: 500 }}>{sub.email}</span>
              </div>
              <span style={{ fontSize: '12px', color: C.textMuted }}>
                <span style={{ background: C.accentLight, color: C.accent, padding: '2px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '11px' }}>
                  {sub.source || 'Formularz'}
                </span>
              </span>
              <span style={{ fontSize: '12px', color: C.textMuted }}>
                {new Date(sub.subscribedAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {confirmDelete === sub.id ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Btn size="sm" variant="danger" onClick={() => deleteSubscriber(sub.id)}>Tak</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>Nie</Btn>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(sub.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '4px', borderRadius: '6px', display: 'flex' }}
                    title="Usuń subskrybenta"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main AdminPanel
// ─────────────────────────────────────────────
export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('hrly_admin') === 'true');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { config, updateSection } = useSiteConfig();
  const [activeComposer, setActiveComposer] = useState<{
    blogPost: BlogPost | null;
    existingPost?: SocialPost;
    initialDate?: string;
  } | null>(null);

  const handleLogin = () => {
    sessionStorage.setItem('hrly_admin', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hrly_admin');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const handleSaveComposer = (newSocialPosts: SocialPost[], blogPostId?: string) => {
    const posts = [...(config.blogPosts || [])];
    if (blogPostId) {
      const bpIdx = posts.findIndex((p) => p.id === blogPostId);
      if (bpIdx >= 0) {
        let bpPosts = [...(posts[bpIdx].socialPosts || [])];
        newSocialPosts.forEach((nsp) => {
          const spIdx = bpPosts.findIndex((s) => s.id === nsp.id);
          if (spIdx >= 0) {
            bpPosts[spIdx] = nsp;
          } else {
            bpPosts.push(nsp);
          }
        });
        posts[bpIdx] = { ...posts[bpIdx], socialPosts: bpPosts };
      }
    } else {
      // standalone post — attach to first blog post or create dummy if empty
      if (posts.length > 0) {
        let bpPosts = [...(posts[0].socialPosts || [])];
        newSocialPosts.forEach((nsp) => {
          const spIdx = bpPosts.findIndex((s) => s.id === nsp.id);
          if (spIdx >= 0) {
            bpPosts[spIdx] = nsp;
          } else {
            bpPosts.push(nsp);
          }
        });
        posts[0] = { ...posts[0], socialPosts: bpPosts };
      } else {
        const dummyPost: BlogPost = {
          id: 'bp_placeholder',
          title: 'Posty Social Media (Bez powiązanego artykułu)',
          slug: 'social-media-placeholder',
          content: '',
          excerpt: '',
          publishedAt: new Date().toISOString(),
          status: 'draft',
          socialPosts: newSocialPosts,
        };
        posts.push(dummyPost);
      }
    }
    updateSection('blogPosts', posts);
    setActiveComposer(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <Sidebar active={activeTab} onNav={(tab) => { setActiveComposer(null); setActiveTab(tab); }} onLogout={handleLogout} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {activeComposer ? (
          <MultiChannelComposer
            blogPost={activeComposer.blogPost}
            existingPost={activeComposer.existingPost}
            initialDate={activeComposer.initialDate}
            onSave={handleSaveComposer}
            onBack={() => setActiveComposer(null)}
            config={config}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab config={config} onNav={setActiveTab} />}
            {activeTab === 'blog' && <BlogTab config={config} updateSection={updateSection} />}
            {activeTab === 'social' && (
              <SocialTab
                config={config}
                updateSection={updateSection}
                onCreatePost={(bp) => setActiveComposer({ blogPost: bp })}
                onEditPost={(bp, sp) => setActiveComposer({ blogPost: bp, existingPost: sp })}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarTab
                config={config}
                onAddPost={(dateStr) => setActiveComposer({ blogPost: null, initialDate: dateStr })}
                onEditPost={(bp, sp) => setActiveComposer({ blogPost: bp, existingPost: sp })}
              />
            )}
            {activeTab === 'newsletter' && <NewsletterTab config={config} updateSection={updateSection} />}
            {activeTab === 'pages' && <PagesTab config={config} updateSection={updateSection} />}
            {activeTab === 'settings' && <SettingsTab config={config} updateSection={updateSection} />}
          </>
        )}
      </main>
    </div>
  );
}
