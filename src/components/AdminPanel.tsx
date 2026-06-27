import React, { useState, useCallback } from 'react';
import {
  LayoutDashboard, FileText, Inbox, BarChart3, Settings,
  LogOut, Menu, X, ChevronRight, Eye, EyeOff, Save,
  Plus, Trash2, Edit3, Sparkles, Globe, RefreshCw,
  Star, StarOff, Mail, Building, Calendar, MessageSquare,
  Search, Tag, Clock, CheckCircle, AlertCircle, Send,
  Image, Link, Hash, ArrowLeft, Copy, Download, Upload,
  Lock, Key, User, ExternalLink, TrendingUp, Users,
  Activity, Zap, BookOpen
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import {
  useSiteConfig,
  loadConfig,
  saveConfig,
  type BlogPost,
  type ContactLead,
  type NewsletterSubscriber,
  type SiteConfig,
} from '../hooks/useSiteConfig';

// ─────────────────────────────────────────────
// Helpers & Utilities
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

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/g, "'")
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&hellip;/g, '…');
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

// Lightweight WordPress HTML → Markdown so imported posts render in our markdown pipeline
function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_m, t) => `\n\n## ${stripHtml(t)}\n\n`);
  md = md.replace(/<h[13-6][^>]*>([\s\S]*?)<\/h[13-6]>/gi, (_m, t) => `\n\n### ${stripHtml(t)}\n\n`);
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _tag, t) => `**${stripHtml(t)}**`);
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _tag, t) => `*${stripHtml(t)}*`);
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, t) => `[${stripHtml(t)}](${href})`);
  md = md.replace(/<img[^>]*?alt="([^"]*)"[^>]*?src="([^"]*)"[^>]*>/gi, (_m, alt, src) => `\n\n![${alt}](${src})\n\n`);
  md = md.replace(/<img[^>]*?src="([^"]*)"[^>]*>/gi, (_m, src) => `\n\n![](${src})\n\n`);
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, t) => `\n\n> ${stripHtml(t)}\n\n`);
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, t) => `\n- ${stripHtml(t)}`);
  md = md.replace(/<\/(ul|ol)>/gi, '\n\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, t) => `\n\n${stripHtml(t)}\n\n`);
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<[^>]+>/g, '');
  md = decodeEntities(md);
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// Canvas-based image resizer and compressor to keep base64 sizes tiny in localStorage
const compressImage = (file: File, maxWidth = 1000, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as progressive JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all duration-300 animate-slide-up ${type === 'success' ? 'bg-[#047857]' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────
// Login Screen (Cohesive Light Theme)
// ─────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const cfg = loadConfig();

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === cfg.global.adminPassword) {
      sessionStorage.setItem('hrly_admin_auth', '1');
      onLogin();
    } else {
      setError('Nieprawidłowe hasło. Spróbuj ponownie.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF8] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B2F8C] to-[#231B5E] shadow-md shadow-indigo-900/15">
            <Lock size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Panel Administracyjny</h1>
          <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider">System Zarządzania Treścią CMS</p>
        </div>
        <form onSubmit={handle} className="bg-white border border-[#EFEAE1] rounded-3xl p-8 space-y-5 shadow-xl shadow-indigo-900/5">
          <div>
            <label className="block text-xs font-bold text-[#A39AB4] uppercase tracking-wider mb-2">Hasło administratora</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setError(''); }}
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] pr-12 transition-all font-mono"
                placeholder="••••••••"
                autoFocus
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39AB4] hover:text-[#14183D] transition-colors">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-600 text-xs font-medium mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
          </div>
          <button type="submit" className="w-full bg-[#3B2F8C] hover:bg-[#231B5E] text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-900/10 transition-all cursor-pointer text-xs uppercase tracking-wider font-mono">
            Zaloguj się
          </button>
        </form>
        <p className="text-center text-[#A39AB4] text-xs font-semibold">
          Domyślne hasło: <code className="text-[#3B2F8C] bg-[#E3DEEE]/50 px-2 py-0.5 rounded font-mono">hrly2024</code>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar (Light Theme Editorial style)
// ─────────────────────────────────────────────
type AdminSection = 'dashboard' | 'cms' | 'blog' | 'leads' | 'newsletter' | 'analytics' | 'settings';

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'dashboard', label: 'Pulpit główny', icon: <LayoutDashboard size={18} /> },
  { id: 'cms', label: 'Treść stron', icon: <FileText size={18} /> },
  { id: 'blog', label: 'Artykuły & AI', icon: <Sparkles size={18} /> },
  { id: 'leads', label: 'Skrzynka zapytań', icon: <Inbox size={18} /> },
  { id: 'newsletter', label: 'Newsletter', icon: <Mail size={18} /> },
  { id: 'analytics', label: 'Analityka ruchu', icon: <BarChart3 size={18} /> },
  { id: 'settings', label: 'Ustawienia systemu', icon: <Settings size={18} /> },
];

function Sidebar({
  active, setActive, onLogout, collapsed, unreadLeads,
}: {
  active: AdminSection; setActive: (s: AdminSection) => void;
  onLogout: () => void; collapsed: boolean; unreadLeads: number;
}) {
  return (
    <aside className={`flex flex-col h-full bg-white border-r border-[#EFEAE1] transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center gap-3 p-5 border-b border-[#EFEAE1]/70 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#3B2F8C] to-[#231B5E] flex-shrink-0 flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-black">HR</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[#14183D] text-sm font-black uppercase tracking-tight leading-none">HRly Admin</div>
            <span className="text-[#A39AB4] text-[10px] font-bold uppercase tracking-wider block mt-1 leading-none">Panel Kontrolny</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const badge = item.id === 'leads' ? unreadLeads : 0;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${isActive ? 'bg-[#3B2F8C]/5 text-[#3B2F8C] border-[#C4BBDE]/35 shadow-xs' : 'text-[#55506E] border-transparent hover:bg-[#FBFAF8] hover:text-[#14183D]'} ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="flex-shrink-0 text-[#F4A574]">{item.icon}</span>
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#EFEAE1]">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#55506E] border border-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
          {!collapsed && 'Wyloguj się'}
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Dashboard (Light Theme)
// ─────────────────────────────────────────────
function AdminDashboard({ config, setSection }: { config: SiteConfig; setSection: (s: AdminSection) => void }) {
  const unread = config.leads.filter((l) => !l.read).length;
  const posts = config.blogPosts.length;
  const published = config.blogPosts.filter((b) => b.status === 'published').length;

  const cards = [
    { label: 'Wpisy na blogu', value: posts, sub: `${published} opublikowane`, icon: <BookOpen size={20} />, color: 'violet', action: 'blog' as AdminSection },
    { label: 'Nieprzeczytane zapytania', value: unread, sub: `${config.leads.length} łącznie`, icon: <Inbox size={20} />, color: 'amber', action: 'leads' as AdminSection },
    { label: 'Plany cennikowe', value: config.pricing.length, sub: 'aktywne plany', icon: <Zap size={20} />, color: 'emerald', action: 'cms' as AdminSection },
    { label: 'Analityka ruchu', value: 'Umami', sub: 'Śledzenie bez cookies', icon: <BarChart3 size={20} />, color: 'sky', action: 'analytics' as AdminSection },
  ];

  const colorMap: Record<string, string> = {
    violet: 'bg-[#3B2F8C]/5 text-[#3B2F8C] border-[#C4BBDE]/35',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    sky: 'bg-sky-50 text-sky-600 border-sky-200',
  };

  const recentLeads = config.leads.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Pulpit kontrolny</h2>
        <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">Przegląd statusu platformy HRly</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => setSection(c.action)}
            className={`text-left p-5 rounded-2xl border ${colorMap[c.color]} bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer`}
          >
            <div className="mb-3">{c.icon}</div>
            <div className="text-3xl font-display font-black text-[#14183D] mb-0.5">{c.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#55506E] mb-1">{c.label}</div>
            <div className="text-[#A39AB4] text-[10px] font-semibold">{c.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#EFEAE1] rounded-2xl p-5 shadow-xs">
          <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight mb-4 flex items-center gap-2">
            <Inbox size={16} className="text-[#3B2F8C]" /> Ostatnie zapytania
          </h3>
          {recentLeads.length === 0 ? (
            <p className="text-[#A39AB4] text-xs font-medium text-center py-8">Brak nowych zapytań w bazie</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className={`flex items-start gap-3 p-3 rounded-xl border ${lead.read ? 'opacity-60 bg-[#FBFAF8] border-[#EFEAE1]' : 'bg-[#3B2F8C]/5 border-[#C4BBDE]/35'}`}>
                  <div className="w-8 h-8 rounded-full bg-[#3B2F8C]/10 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-[#3B2F8C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#14183D] text-xs font-bold truncate">{lead.name}</div>
                    <div className="text-[#55506E] text-[10px] truncate">{lead.company || 'Brak firmy'} · {lead.email}</div>
                    <div className="text-[#A39AB4] text-[9px] font-mono mt-0.5">{formatDate(lead.receivedAt)}</div>
                  </div>
                  {!lead.read && <span className="w-2 h-2 rounded-full bg-[#F4A574] flex-shrink-0 mt-2 animate-pulse" />}
                </div>
              ))}
              <button onClick={() => setSection('leads')} className="text-[#3B2F8C] text-xs font-bold hover:underline block pt-2 cursor-pointer">
                Zobacz wszystkie zapytania →
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#EFEAE1] rounded-2xl p-5 shadow-xs">
          <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight mb-4 flex items-center gap-2">
            <FileText size={16} className="text-[#3B2F8C]" /> Ostatnie wpisy na blogu
          </h3>
          {config.blogPosts.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles size={24} className="text-[#3B2F8C] mx-auto mb-2" />
              <p className="text-[#55506E] text-xs font-medium mb-3">Brak wpisów w bazie danych.</p>
              <button onClick={() => setSection('blog')} className="text-xs bg-[#3B2F8C] text-white px-4 py-2 rounded-xl hover:bg-[#231B5E] font-bold transition-all cursor-pointer">
                Utwórz wpis z AI
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {config.blogPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#EFEAE1] bg-[#FBFAF8]">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-[#EFEAE1]">
                    <img 
                      src={post.imageUrl || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=100&q=80"} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#14183D] text-xs font-bold truncate">{post.title}</div>
                    <div className="text-[#55506E] text-[10px]">{post.category} · {formatDate(post.publishedAt)}</div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${post.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {post.status === 'published' ? 'Live' : 'Szkic'}
                  </span>
                </div>
              ))}
              <button onClick={() => setSection('blog')} className="text-[#3B2F8C] text-xs font-bold hover:underline block pt-2 cursor-pointer">
                Zarządzaj artykułami →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CMS Editor (Light Theme Form Controls)
// ─────────────────────────────────────────────
function AdminCMSEditor({ config, updateSection }: { config: SiteConfig; updateSection: (k: keyof SiteConfig, v: SiteConfig[keyof SiteConfig]) => void }) {
  const [tab, setTab] = useState<'hero' | 'stats' | 'pricing' | 'contact' | 'footer'>('hero');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [hero, setHero] = useState(config.hero);
  const [stats, setStats] = useState(config.stats);
  const [contact, setContact] = useState(config.contact);
  const [footer, setFooter] = useState(config.footer);
  const [pricing, setPricing] = useState(config.pricing);

  const tabs = [
    { id: 'hero' as const, label: 'Hero' },
    { id: 'stats' as const, label: 'Statystyki' },
    { id: 'pricing' as const, label: 'Cennik' },
    { id: 'contact' as const, label: 'Kontakt' },
    { id: 'footer' as const, label: 'Stopka' },
  ];

  const field = (label: string, value: string, onChange: (v: string) => void, multiline = false) => (
    <div key={label} className="space-y-1 text-left">
      <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all resize-none shadow-2xs"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all shadow-2xs"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="text-left">
        <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Treść stron</h2>
        <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">Edytuj sekcje tekstowe oraz cennik witryny</p>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-[#EFEAE1] pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${tab === t.id ? 'bg-[#3B2F8C] text-white shadow-md' : 'bg-white text-[#55506E] hover:text-[#14183D] border border-[#EFEAE1]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 shadow-sm">
        {tab === 'hero' && (
          <div className="space-y-5">
            <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 text-left">Sekcja główna (Hero)</h3>
            {field('Napis nad nagłówkiem (Badge)', hero.badge, (v) => setHero({ ...hero, badge: v }))}
            {field('Główny nagłówek strony (H1)', hero.headline, (v) => setHero({ ...hero, headline: v }))}
            {field('Podnagłówek / Opis', hero.subheadline, (v) => setHero({ ...hero, subheadline: v }), true)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Tekst głównego przycisku CTA', hero.ctaPrimaryText, (v) => setHero({ ...hero, ctaPrimaryText: v }))}
              {field('Adres docelowy przycisku CTA', hero.ctaPrimaryLink, (v) => setHero({ ...hero, ctaPrimaryLink: v }))}
            </div>
            {field('Tekst dodatkowego linku', hero.ctaSecondaryText, (v) => setHero({ ...hero, ctaSecondaryText: v }))}
            <button onClick={() => { updateSection('hero', hero); showToast('Sekcja Hero została zaktualizowana!'); }} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-indigo-900/10">
              <Save size={14} className="text-[#F4A574]" /> Zapisz sekcję Hero
            </button>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-5">
            <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 text-left">Główne wskaźniki (Statystyki)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => {
                const k = i === 1 ? 'stat1' : i === 2 ? 'stat2' : 'stat3';
                return (
                  <div key={i} className="bg-[#FBFAF8] border border-[#EFEAE1] rounded-2xl p-4.5 space-y-3 shadow-2xs">
                    <p className="text-[#3B2F8C] text-[10px] font-bold uppercase tracking-wider">Licznik {i}</p>
                    {field('Wartość / Liczba', (stats as Record<string, string>)[`${k}Value`], (v) => setStats({ ...stats, [`${k}Value`]: v }))}
                    {field('Krótki opis pod spodem', (stats as Record<string, string>)[`${k}Label`], (v) => setStats({ ...stats, [`${k}Label`]: v }))}
                  </div>
                );
              })}
            </div>
            <button onClick={() => { updateSection('stats', stats); showToast('Wskaźniki statystyk zostały zapisane!'); }} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-indigo-900/10">
              <Save size={14} className="text-[#F4A574]" /> Zapisz statystyki
            </button>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="space-y-6">
            <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 text-left">Konfiguracja planów cennikowych</h3>
            {pricing.map((plan, idx) => (
              <div key={plan.id} className="bg-[#FBFAF8] border border-[#EFEAE1] rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#EFEAE1]/75 pb-2">
                  <span className="text-[#14183D] text-xs font-bold uppercase tracking-wider">{plan.name}</span>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#55506E] cursor-pointer">
                    <input type="checkbox" checked={plan.highlighted} onChange={(e) => {
                      const next = [...pricing];
                      next[idx] = { ...plan, highlighted: e.target.checked };
                      setPricing(next);
                    }} className="w-4 h-4 rounded border-[#C4BBDE]/55 accent-[#3B2F8C]" />
                    Wyróżnij ten plan wizualnie
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {field('Nazwa planu', plan.name, (v) => { const n = [...pricing]; n[idx] = { ...plan, name: v }; setPricing(n); })}
                  {field('Cena brutto/netto', plan.price, (v) => { const n = [...pricing]; n[idx] = { ...plan, price: v }; setPricing(n); })}
                  {field('Okres rozliczeniowy', plan.period, (v) => { const n = [...pricing]; n[idx] = { ...plan, period: v }; setPricing(n); })}
                  {field('Napis na przycisku CTA', plan.ctaText, (v) => { const n = [...pricing]; n[idx] = { ...plan, ctaText: v }; setPricing(n); })}
                </div>
                {field('Opis skrócony planu', plan.description, (v) => { const n = [...pricing]; n[idx] = { ...plan, description: v }; setPricing(n); }, true)}
                <div className="text-left space-y-1">
                  <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Wymień zalety / cechy (jedna linijka = jeden punkt)</label>
                  <textarea
                    value={plan.features.join('\n')}
                    onChange={(e) => { const n = [...pricing]; n[idx] = { ...plan, features: e.target.value.split('\n').filter(Boolean) }; setPricing(n); }}
                    rows={4}
                    className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all resize-none shadow-2xs"
                  />
                </div>
              </div>
            ))}
            <button onClick={() => { updateSection('pricing', pricing); showToast('Dane cennika zostały zapisane!'); }} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-indigo-900/10">
              <Save size={14} className="text-[#F4A574]" /> Zapisz zmiany cennika
            </button>
          </div>
        )}

        {tab === 'contact' && (
          <div className="space-y-5">
            <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 text-left">Ustawienia danych kontaktowych</h3>
            {field('Adres e-mail do kontaktu', contact.email, (v) => setContact({ ...contact, email: v }))}
            {field('Numer telefonu', contact.phone, (v) => setContact({ ...contact, phone: v }))}
            {field('Adres siedziby firmy', contact.address, (v) => setContact({ ...contact, address: v }))}
            {field('Pełny link do LinkedIn', contact.linkedIn, (v) => setContact({ ...contact, linkedIn: v }))}
            {field('Link do rezerwacji spotkań Calendly', contact.calendarLink, (v) => setContact({ ...contact, calendarLink: v }))}
            <button onClick={() => { updateSection('contact', contact); showToast('Dane kontaktowe zostały zapisane!'); }} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-indigo-900/10">
              <Save size={14} className="text-[#F4A574]" /> Zapisz dane kontaktowe
            </button>
          </div>
        )}

        {tab === 'footer' && (
          <div className="space-y-5">
            <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 text-left">Stopka strony</h3>
            {field('Opis firmy w stopce', footer.companyDescription, (v) => setFooter({ ...footer, companyDescription: v }), true)}
            {field('Link LinkedIn', footer.linkedIn, (v) => setFooter({ ...footer, linkedIn: v }))}
            {field('Link Twitter/X', footer.twitter, (v) => setFooter({ ...footer, twitter: v }))}
            {field('Link Facebook', footer.facebook, (v) => setFooter({ ...footer, facebook: v }))}
            {field('Napis Copyright stopki', footer.copyright, (v) => setFooter({ ...footer, copyright: v }))}
            <button onClick={() => { updateSection('footer', footer); showToast('Treść stopki została zapisana!'); }} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-indigo-900/10">
              <Save size={14} className="text-[#F4A574]" /> Zapisz treść stopki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Blog Editor + AI (Light Theme & Image Tools)
// ─────────────────────────────────────────────
const BLOG_CATEGORIES = ['HR Analityka', 'Zarządzanie Zespołem', 'Employee Experience', 'eNPS & Zaangażowanie', 'Rekrutacja', 'Wellbeing', 'Przywództwo', 'Technologia HR'];

function AdminBlogEditor({ config, updateSection }: { config: SiteConfig; updateSection: (k: keyof SiteConfig, v: SiteConfig[keyof SiteConfig]) => void }) {
  const [view, setView] = useState<'list' | 'edit' | 'ai' | 'wp'>('list');
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [wpUrl, setWpUrl] = useState('');
  const [wpLoading, setWpLoading] = useState(false);
  const [wpError, setWpError] = useState('');
  const [wpFetched, setWpFetched] = useState<BlogPost[]>([]);
  const [wpSelected, setWpSelected] = useState<Record<string, boolean>>({});
  const [aiTopic, setAiTopic] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiCategory, setAiCategory] = useState(BLOG_CATEGORIES[0]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Partial<BlogPost> | null>(null);
  const [aiError, setAiError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const posts = config.blogPosts;

  const newPost = (): BlogPost => ({
    id: `post_${Date.now()}`,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: BLOG_CATEGORIES[0],
    tags: [],
    author: 'HRly Team',
    publishedAt: new Date().toISOString(),
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
  });

  const savePosts = (updated: BlogPost[]) => updateSection('blogPosts', updated);

  const deletePost = (id: string) => {
    savePosts(posts.filter((p) => p.id !== id));
    showToast('Wpis usunięty');
  };

  const savePost = (post: BlogPost) => {
    const idx = posts.findIndex((p) => p.id === post.id);
    const updated = idx >= 0 ? posts.map((p) => (p.id === post.id ? post : p)) : [post, ...posts];
    savePosts(updated);
    showToast('Wpis zapisany pomyślnie!');
    setView('list');
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) { setAiError('Podaj temat wpisu'); return; }
    setAiLoading(true);
    setAiError('');
    setAiResult(null);

    const prompt = `Jesteś ekspertem HR oraz copywriterem specjalizującym się w SEO (Search Engine Optimization) i GEO (Generative Engine Optimization). Napisz profesjonalny wpis blogowy dla platformy HRly (polskojęzycznej platformy analityki HR) na następujący temat. Skorzystaj z wyszukiwarki internetowej, aby oprzeć tekst na aktualnych danych i trendach.

TEMAT: ${aiTopic}
KATEGORIA: ${aiCategory}
SŁOWA KLUCZOWE SEO: ${aiKeywords || 'HR, zaangażowanie pracowników, analityka HR, eNPS'}

WYMAGANIA OGÓLNE:
- Język: Polski, profesjonalny, angażujący
- Długość: ok. 800-1200 słów
- Format: Markdown (użyj ## dla nagłówków, **pogrubienie**, listy z -)
- Struktura: Wstęp (hak), 3-4 główne sekcje z H2, praktyczne przykłady, podsumowanie z CTA do HRly
- Ton: Ekspercki, ale przystępny
- Na końcu dodaj 3-5 tagów oddzielonych przecinkami

ZASADY SEO (wyszukiwarki Google/Bing):
- Naturalnie wpleć słowa kluczowe w tytuł, pierwszy akapit, nagłówki H2/H3 i treść (bez upychania)
- Używaj jasnej hierarchii nagłówków H2/H3 i opisowych śródtytułów
- Zadbaj o frazy długiego ogona (long-tail) i intencję wyszukiwania użytkownika
- Meta title (max 60 znaków) i meta description (max 160 znaków) z głównym słowem kluczowym

ZASADY GEO (optymalizacja pod silniki generatywne: ChatGPT, Gemini, Perplexity, AI Overviews):
- Pisz w sposób cytowalny: konkretne, samodzielne stwierdzenia i definicje, które AI może zacytować
- Podawaj konkretne dane, liczby, statystyki i daty (z aktualnych źródeł z wyszukiwania) oraz wskazuj źródła w treści
- Dodaj sekcję FAQ (## Najczęściej zadawane pytania) z 2-3 pytaniami i zwięzłymi, bezpośrednimi odpowiedziami
- Odpowiadaj wprost na pytania w pierwszym zdaniu sekcji (struktura odpowiedź-najpierw), potem rozwijaj
- Buduj autorytet tematyczny (E-E-A-T): doświadczenie, ekspertyza, wiarygodność

Zwróć wynik w formacie JSON:
{
  "title": "Tytuł wpisu (chwytliwy, SEO)",
  "excerpt": "Krótki opis (150-160 znaków, dla meta description)",
  "content": "Pełna treść w Markdown",
  "tags": ["tag1", "tag2", "tag3"],
  "seoTitle": "Tytuł SEO (60 znaków max)",
  "seoDescription": "Opis SEO (160 znaków max)"
}`;

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        },
      });

      const text = response.text ?? '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Nie udało się sparsować odpowiedzi AI');

      const parsed = JSON.parse(jsonMatch[0]) as Partial<BlogPost>;
      setAiResult({
        ...parsed,
        slug: slugify(parsed.title || aiTopic),
        category: aiCategory,
        author: 'HRly Team',
        publishedAt: new Date().toISOString(),
        status: 'draft' as const,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Błąd generowania';
      setAiError(`Błąd AI: ${msg}. Sprawdź klucz API Gemini w ustawieniach.`);
    } finally {
      setAiLoading(false);
    }
  };

  const useAiResult = () => {
    if (!aiResult) return;
    const post: BlogPost = {
      id: `post_${Date.now()}`,
      title: aiResult.title || '',
      slug: aiResult.slug || slugify(aiResult.title || ''),
      excerpt: aiResult.excerpt || '',
      content: aiResult.content || '',
      category: aiResult.category || aiCategory,
      tags: aiResult.tags || [],
      author: aiResult.author || 'HRly Team',
      publishedAt: new Date().toISOString(),
      status: 'draft',
      seoTitle: aiResult.seoTitle || aiResult.title || '',
      seoDescription: aiResult.seoDescription || aiResult.excerpt || '',
    };
    setEditPost(post);
    setView('edit');
  };

  // ── WordPress import (public WP REST API) ──────────────────────
  const fetchFromWordPress = async () => {
    const raw = wpUrl.trim().replace(/\/+$/, '');
    if (!raw) { setWpError('Podaj adres strony WordPress (np. https://twojadomena.pl)'); return; }
    const base = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    setWpLoading(true);
    setWpError('');
    setWpFetched([]);
    setWpSelected({});
    try {
      const endpoint = `${base}/wp-json/wp/v2/posts?per_page=30&_embed`;
      const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Serwer odpowiedział kodem ${res.status}. Sprawdź adres i czy REST API jest publiczne.`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Nie znaleziono żadnych wpisów pod tym adresem.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: BlogPost[] = data.map((wp: any) => {
        const title = stripHtml(wp.title?.rendered || 'Wpis bez tytułu');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const terms: any[] = wp._embedded?.['wp:term']?.flat?.() || [];
        const category = terms.find((t) => t?.taxonomy === 'category')?.name || BLOG_CATEGORIES[0];
        const tags = terms.filter((t) => t?.taxonomy === 'post_tag').map((t) => t.name).slice(0, 6);
        const featured = wp._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
        return {
          id: `wp_${wp.id}_${Date.now()}`,
          title,
          slug: wp.slug || slugify(title),
          excerpt: stripHtml(wp.excerpt?.rendered || '').slice(0, 200),
          content: htmlToMarkdown(wp.content?.rendered || ''),
          category,
          tags,
          author: 'HRly Team',
          publishedAt: wp.date ? new Date(wp.date).toISOString() : new Date().toISOString(),
          status: 'draft' as const,
          seoTitle: title.slice(0, 60),
          seoDescription: stripHtml(wp.excerpt?.rendered || '').slice(0, 160),
          imageUrl: featured || undefined,
        };
      });
      setWpFetched(mapped);
      setWpSelected(Object.fromEntries(mapped.map((p) => [p.id, true])));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nieznany błąd';
      setWpError(`Import nie powiódł się: ${msg}`);
    } finally {
      setWpLoading(false);
    }
  };

  const importSelectedWp = () => {
    const toImport = wpFetched.filter((p) => wpSelected[p.id]);
    if (toImport.length === 0) { showToast('Zaznacz przynajmniej jeden wpis', 'error'); return; }
    savePosts([...toImport, ...posts]);
    showToast(`Zaimportowano ${toImport.length} ${toImport.length === 1 ? 'wpis' : 'wpisów'} jako szkice`);
    setWpFetched([]);
    setWpSelected({});
    setWpUrl('');
    setView('list');
  };

  if (view === 'edit' && editPost) {
    return (
      <BlogPostEditor
        post={editPost}
        onSave={savePost}
        onBack={() => setView('list')}
      />
    );
  }

  if (view === 'wp') {
    const selectedCount = wpFetched.filter((p) => wpSelected[p.id]).length;
    return (
      <div className="space-y-6">
        {toast && <Toast msg={toast.msg} type={toast.type} />}
        <div className="flex items-center gap-4 text-left">
          <button onClick={() => setView('list')} className="text-[#55506E] hover:text-[#14183D] cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Import z WordPress</h2>
            <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">Pobierz istniejące wpisy przez publiczne REST API</p>
          </div>
        </div>

        <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-start gap-4 p-4.5 bg-[#3B2F8C]/5 border border-[#C4BBDE]/35 rounded-xl">
            <Globe size={20} className="text-[#3B2F8C] flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-[#3B2F8C] text-xs font-bold uppercase tracking-wider">Jak to działa</p>
              <p className="text-[#55506E] text-[11px] mt-0.5 leading-relaxed">
                Podaj adres swojej strony WordPress. System pobierze publicznie dostępne wpisy (do 30 najnowszych) wraz z treścią, kategoriami, tagami i obrazkiem wyróżniającym — <strong>nie wymaga logowania</strong>, o ile REST API (<code className="font-mono">/wp-json</code>) jest publiczne. Wpisy trafią jako szkice do zatwierdzenia.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1 space-y-1 text-left">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Adres strony WordPress</label>
              <input
                value={wpUrl}
                onChange={(e) => setWpUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchFromWordPress(); }}
                placeholder="np. https://blog.hrly.pl"
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all font-mono"
              />
            </div>
            <button
              onClick={fetchFromWordPress}
              disabled={wpLoading}
              className="flex items-center justify-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              {wpLoading ? (<><RefreshCw size={14} className="animate-spin" /> Pobieram...</>) : (<><Download size={14} className="text-[#F4A574]" /> Pobierz wpisy</>)}
            </button>
          </div>

          {wpError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs font-semibold">{wpError}</p>
            </div>
          )}
        </div>

        {wpFetched.length > 0 && (
          <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-4 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#EFEAE1] pb-3 flex-wrap gap-3">
              <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" /> Znaleziono {wpFetched.length} wpisów · zaznaczono {selectedCount}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setWpSelected(Object.fromEntries(wpFetched.map((p) => [p.id, true])))} className="text-[10px] font-bold uppercase tracking-wider text-[#3B2F8C] hover:underline cursor-pointer">Zaznacz wszystkie</button>
                <span className="text-[#C4BBDE]">·</span>
                <button onClick={() => setWpSelected({})} className="text-[10px] font-bold uppercase tracking-wider text-[#55506E] hover:underline cursor-pointer">Odznacz wszystkie</button>
              </div>
            </div>

            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {wpFetched.map((p) => (
                <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${wpSelected[p.id] ? 'bg-[#3B2F8C]/5 border-[#C4BBDE]/40' : 'bg-white border-[#EFEAE1] hover:bg-[#FBFAF8]'}`}>
                  <input
                    type="checkbox"
                    checked={!!wpSelected[p.id]}
                    onChange={(e) => setWpSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                    className="w-4 h-4 rounded border-[#C4BBDE]/55 accent-[#3B2F8C] flex-shrink-0"
                  />
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FBFAF8] flex-shrink-0 border border-[#EFEAE1]">
                    <img src={p.imageUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#14183D] text-xs font-bold truncate">{p.title}</div>
                    <div className="text-[#55506E] text-[10px] truncate">{p.category} · {formatDate(p.publishedAt)}</div>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={importSelectedWp}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Download size={14} /> Importuj zaznaczone ({selectedCount}) jako szkice
            </button>
          </div>
        )}
      </div>
    );
  }

  if (view === 'ai') {
    return (
      <div className="space-y-6">
        {toast && <Toast msg={toast.msg} type={toast.type} />}
        <div className="flex items-center gap-4 text-left">
          <button onClick={() => setView('list')} className="text-[#55506E] hover:text-[#14183D] cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Kreator wpisów AI</h2>
            <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">Asystent pisania artykułów z Google Search i SEO</p>
          </div>
        </div>

        <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-start gap-4 p-4.5 bg-[#3B2F8C]/5 border border-[#C4BBDE]/35 rounded-xl">
            <Sparkles size={20} className="text-[#3B2F8C] flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-[#3B2F8C] text-xs font-bold uppercase tracking-wider">Inteligentne wyszukiwanie internetowe</p>
              <p className="text-[#55506E] text-[11px] mt-0.5 leading-relaxed">Przeszukaj najnowsze i aktualne wskaźniki branżowe i trendy, a AI stworzy wpis SEO.</p>
            </div>
          </div>

          <div className="text-left space-y-1">
            <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Temat lub główne zagadnienie *</label>
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="np. Jak mierzyć stopę retencji oraz zaangażowanie w IT w 2026 roku?"
              className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Kategoria wpisu</label>
              <select
                value={aiCategory}
                onChange={(e) => setAiCategory(e.target.value)}
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all"
              >
                {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Słowa kluczowe (rozdziel przecinkiem)</label>
              <input
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                placeholder="eNPS, rotacja, analityka HR"
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all"
              />
            </div>
          </div>

          {aiError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs font-semibold">{aiError}</p>
            </div>
          )}

          <button
            onClick={generateWithAI}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            {aiLoading ? (
              <><RefreshCw size={14} className="animate-spin" /> Przeszukuję sieć i piszę artykuł...</>
            ) : (
              <><Sparkles size={14} className="text-[#F4A574]" /> Rozpocznij generowanie wpisu</>
            )}
          </button>
        </div>

        {aiResult && (
          <div className="bg-white border border-emerald-300 rounded-2xl p-6 space-y-4 shadow-sm text-left animate-fade-in">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" /> Gotowy artykuł
              </h3>
              <button
                onClick={useAiResult}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Edit3 size={12} /> Otwórz edytor i dopasuj
              </button>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Tytuł</span>
              <p className="text-[#14183D] font-bold text-base">{aiResult.title}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Wypis (SEO Meta Description)</span>
              <p className="text-[#55506E] text-xs leading-relaxed">{aiResult.excerpt}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Słowa kluczowe tagi</span>
              <div className="flex flex-wrap gap-1.5">
                {(aiResult.tags || []).map((t) => (
                  <span key={t} className="bg-[#3B2F8C]/5 text-[#3B2F8C] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#C4BBDE]/35">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex items-center justify-between text-left">
        <div>
          <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Artykuły & AI</h2>
          <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">{posts.length} {posts.length === 1 ? 'wpis' : 'wpisów'} w bazie</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setView('ai')}
            className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            <Sparkles size={14} className="text-[#F4A574]" /> Pisz z AI
          </button>
          <button
            onClick={() => setView('wp')}
            className="flex items-center gap-2 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#3B2F8C] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
          >
            <Download size={14} className="text-[#F4A574]" /> Import z WordPress
          </button>
          <button
            onClick={() => { setEditPost(newPost()); setView('edit'); }}
            className="flex items-center gap-2 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#3B2F8C] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
          >
            <Plus size={14} /> Dodaj ręcznie
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-[#EFEAE1] rounded-2xl p-12 text-center shadow-xs">
          <Sparkles size={32} className="text-[#3B2F8C] mx-auto mb-3" />
          <h3 className="text-[#14183D] font-display font-extrabold text-base mb-1 uppercase tracking-tight">Brak artykułów na blogu</h3>
          <p className="text-[#55506E] text-xs mb-4">Napisz swój pierwszy artykuł z pomocą inteligentnego generatora AI.</p>
          <button onClick={() => setView('ai')} className="bg-[#3B2F8C] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md">
            Stwórz artykuł z AI →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-[#EFEAE1] rounded-2xl p-5 flex items-center gap-4 hover:border-[#C4BBDE]/55 transition-all shadow-2xs text-left font-sans">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FBFAF8] flex-shrink-0 border border-[#EFEAE1] relative">
                <img 
                  src={post.imageUrl || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80"} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${post.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {post.status === 'published' ? 'Opublikowany' : 'Szkic'}
                  </span>
                  <span className="text-[#A39AB4] text-[10px] font-bold uppercase tracking-wider">{post.category}</span>
                </div>
                <h4 className="text-[#14183D] font-bold text-sm mb-1 truncate">{post.title}</h4>
                <p className="text-[#55506E] text-xs truncate leading-normal">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-2 text-[#A39AB4] text-[10px] font-semibold uppercase font-mono">
                  <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(post.publishedAt)}</span>
                  {post.tags.length > 0 && (
                    <span className="flex items-center gap-1"><Tag size={11} /> {post.tags.slice(0, 2).join(', ')}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setEditPost(post); setView('edit'); }} className="p-2 text-[#55506E] hover:text-[#3B2F8C] hover:bg-[#3B2F8C]/5 rounded-xl transition-all cursor-pointer">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => deletePost(post.id)} className="p-2 text-[#55506E] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const BLOG_PRESET_IMAGES = [
  { name: 'Praca zespołowa', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Wykresy i dane', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Rekrutacja / Ludzie', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Biuro / Skupienie', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Zdrowie i morale', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
  { name: 'Burza mózgów', url: 'https://images.unsplash.com/photo-1531535934202-f022eed250c2?auto=format&fit=crop&w=800&q=80' }
];

function BlogPostEditor({ post, onSave, onBack }: { post: BlogPost; onSave: (p: BlogPost) => void; onBack: () => void }) {
  const [p, setP] = useState(post);
  const [tagsInput, setTagsInput] = useState(post.tags.join(', '));
  const [tab, setTab] = useState<'content' | 'seo'>('content');
  const [imageTab, setImageTab] = useState<'upload' | 'preset' | 'url'>('preset');

  const update = (patch: Partial<BlogPost>) => setP((prev) => ({ ...prev, ...patch }));

  // Resize and compress cover image locally
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 0.75); // cover image optimized for size
      update({ imageUrl: compressed });
    } catch (err) {
      console.error(err);
      alert('Nie udało się skomprować zdjęcia. Spróbuj użyć innego formatu.');
    }
  };

  // Resize and insert image in body
  const handleBodyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1000, 0.8);
      const filename = file.name.split('.')[0] || 'obraz';
      const markdownTag = `\n\n![${filename}](${compressed})\n\n`;
      insertMarkdown(markdownTag);
    } catch (err) {
      console.error(err);
      alert('Wystąpił błąd podczas wgrywania zdjęcia.');
    }
    e.target.value = '';
  };

  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('blog-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    update({ content: newContent });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#EFEAE1] pb-3">
        <button onClick={onBack} className="text-[#55506E] hover:text-[#14183D] cursor-pointer"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">
            {p.id.startsWith('post_') && !p.title ? 'Nowy artykuł' : p.title || 'Edycja artykułu'}
          </h2>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={p.status}
            onChange={(e) => update({ status: e.target.value as 'published' | 'draft' })}
            className="bg-white border border-[#C4BBDE]/55 rounded-xl px-3 py-2 text-[#14183D] text-xs font-bold uppercase tracking-wider outline-none focus:border-[#3B2F8C]"
          >
            <option value="draft">Szkic roboczy</option>
            <option value="published">Opublikowany (Live)</option>
          </select>
          <button 
            onClick={() => onSave({ ...p, tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean) })} 
            className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            <Save size={14} className="text-[#F4A574]" /> Zapisz wpis
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['content', 'seo'] as const).map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${tab === t ? 'bg-[#3B2F8C] text-white shadow-sm' : 'bg-white text-[#55506E] border border-[#EFEAE1]'}`}
          >
            {t === 'content' ? 'Treść i Grafika główna' : 'Wyszukiwarki SEO'}
          </button>
        ))}
      </div>

      {/* Editor Content */}
      <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-5 shadow-xs">
        {tab === 'content' && (
          <>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Tytuł artykułu *</label>
              <input 
                value={p.title} 
                onChange={(e) => update({ title: e.target.value, slug: slugify(e.target.value) })} 
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all" 
                placeholder="Napisz interesujący tytuł..." 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Przyjazny adres URL (Slug)</label>
                <input 
                  value={p.slug} 
                  onChange={(e) => update({ slug: e.target.value })} 
                  className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all font-mono" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Kategoria artykułu</label>
                <select 
                  value={p.category} 
                  onChange={(e) => update({ category: e.target.value })} 
                  className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all"
                >
                  {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* OKŁADKA WPISU */}
            <div className="border border-[#EFEAE1] bg-[#FBFAF8] rounded-2xl p-5 space-y-4">
              <div className="text-left">
                <h4 className="text-[#14183D] font-display font-extrabold text-xs uppercase tracking-tight">Zdjęcie wyróżniające (Okładka)</h4>
                <p className="text-[#55506E] text-[11px] leading-relaxed">Wybierz gotową ilustrację, prześlij plik z komputera (zostanie automatycznie skompresowany) lub podaj adres URL.</p>
              </div>

              {/* Wybór metody */}
              <div className="flex gap-2 border-b border-[#EFEAE1] pb-3">
                {([
                  { id: 'preset', label: 'Galeria szablonów Unsplash' },
                  { id: 'upload', label: 'Wgraj z komputera' },
                  { id: 'url', label: 'Link bezpośredni (URL)' }
                ] as const).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setImageTab(t.id)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${imageTab === t.id ? 'bg-[#3B2F8C] text-white shadow-xs' : 'text-[#55506E] hover:bg-[#E3DEEE]/40'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Preset Gallery */}
              {imageTab === 'preset' && (
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {BLOG_PRESET_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => update({ imageUrl: img.url })}
                      className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all cursor-pointer ${p.imageUrl === img.url ? 'border-[#3B2F8C] ring-2 ring-[#3B2F8C]/30' : 'border-[#EFEAE1] opacity-75 hover:opacity-100'}`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-black/75 text-[9px] text-white py-1 text-center truncate px-1">{img.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Upload file */}
              {imageTab === 'upload' && (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <label className="flex items-center gap-2 bg-white border border-[#C4BBDE]/55 hover:bg-[#FBFAF8] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#3B2F8C] cursor-pointer transition-all shadow-2xs">
                    <Upload size={14} className="text-[#F4A574]" />
                    Wybierz plik z dysku...
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <p className="text-[10px] text-[#A39AB4] font-semibold uppercase leading-normal">
                    Kompresor automatycznie zmniejszy wagę obrazu do optymalnego poziomu.
                  </p>
                </div>
              )}

              {/* Raw URL */}
              {imageTab === 'url' && (
                <input
                  value={p.imageUrl || ''}
                  onChange={(e) => update({ imageUrl: e.target.value })}
                  placeholder="Wklej pełny link do zdjęcia (np. https://images.unsplash.com/...)"
                  className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-xs font-mono outline-none focus:border-[#3B2F8C] transition-all"
                />
              )}

              {/* Live Preview */}
              {p.imageUrl && (
                <div className="flex gap-4 items-center bg-white p-3 rounded-xl border border-[#EFEAE1] shadow-2xs">
                  <div className="w-24 aspect-[16/9] rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-[#EFEAE1]">
                    <img src={p.imageUrl} alt="Podgląd okładki" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Wybrany obrazek</div>
                    <div className="text-emerald-600 text-xs font-bold flex items-center gap-1 mt-0.5">
                      ✓ Prawidłowo przypisany do artykułu
                    </div>
                  </div>
                  <button 
                    onClick={() => update({ imageUrl: '' })}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                  >
                    Usuń zdjęcie
                  </button>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Krótkie streszczenie / Wstęp (Wypis) *</label>
              <textarea 
                value={p.excerpt} 
                onChange={(e) => update({ excerpt: e.target.value })} 
                rows={2} 
                placeholder="Napisz zwięzły opis wyświetlany na liście bloga (150-200 znaków)..."
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] resize-none transition-all shadow-2xs" 
              />
            </div>

            {/* Content text-editor with formatting toolbar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Pełna treść artykułu (Markdown) *</label>
                <span className="text-[9.5px] text-[#A39AB4] font-mono uppercase font-bold tracking-wider">Obsługuje tagi HTML i Markdown</span>
              </div>

              {/* Formatting Toolbar */}
              <div className="bg-[#FBFAF8] border border-[#C4BBDE]/55 rounded-t-xl px-3 py-2 flex flex-wrap gap-1.5 items-center">
                <button type="button" onClick={() => insertMarkdown('**', '**')} className="px-2.5 py-1 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#3B2F8C] rounded-lg text-xs font-bold font-mono cursor-pointer" title="Pogrubienie">B</button>
                <button type="button" onClick={() => insertMarkdown('*', '*')} className="px-2.5 py-1 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#3B2F8C] rounded-lg text-xs italic font-mono cursor-pointer" title="Kursywa">I</button>
                <div className="w-[1px] h-4 bg-[#EFEAE1] mx-1" />
                <button type="button" onClick={() => insertMarkdown('## ')} className="px-2.5 py-1 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#3B2F8C] rounded-lg text-xs font-bold cursor-pointer" title="Nagłówek H2">H2</button>
                <button type="button" onClick={() => insertMarkdown('### ')} className="px-2.5 py-1 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#3B2F8C] rounded-lg text-xs font-bold cursor-pointer" title="Nagłówek H3">H3</button>
                <div className="w-[1px] h-4 bg-[#EFEAE1] mx-1" />
                <button type="button" onClick={() => insertMarkdown('> ')} className="px-2.5 py-1 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#3B2F8C] rounded-lg text-xs font-bold cursor-pointer" title="Cytat">Cytat</button>
                <button type="button" onClick={() => insertMarkdown('- ')} className="px-2.5 py-1 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#3B2F8C] rounded-lg text-xs font-bold cursor-pointer" title="Element listy">Lista</button>
                <div className="w-[1px] h-4 bg-[#EFEAE1] mx-1" />
                
                {/* Wgraj zdjęcie z komputera (Local Compression) */}
                <label className="flex items-center gap-1 px-2.5 py-1 bg-[#3B2F8C]/10 border border-[#C4BBDE]/40 hover:bg-[#3B2F8C]/15 text-[#3B2F8C] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer" title="Prześlij zdjęcie z komputera i wstaw w tekście">
                  <Upload size={12} className="text-[#F4A574]" /> Wgraj zdjęcie
                  <input type="file" accept="image/*" className="hidden" onChange={handleBodyImageUpload} />
                </label>

                {/* Link insert */}
                <button 
                  type="button" 
                  onClick={() => {
                    const url = prompt("Wpisz adres internetowy URL:");
                    if (url) insertMarkdown(`[Tekst linku](${url})`);
                  }} 
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#EFEAE1] hover:bg-[#FBFAF8] text-[#55506E] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                  title="Wstaw odnośnik"
                >
                  <Link size={12} /> Dodaj link
                </button>
              </div>

              <textarea 
                id="blog-content-textarea"
                value={p.content} 
                onChange={(e) => update({ content: e.target.value })} 
                rows={16} 
                placeholder="Wpisz treść artykułu w formacie Markdown..."
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-b-xl px-4 py-3 text-[#14183D] text-xs font-mono leading-relaxed outline-none focus:border-[#3B2F8C] transition-all shadow-2xs" 
              />
              <p className="text-[10px] text-[#A39AB4] font-semibold uppercase mt-1">
                💡 Zastosuj przycisk 📤 **Wgraj zdjęcie**, aby wstawić skompresowaną grafikę w dowolnym miejscu wpisu.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Tagi (oddziel przecinkami)</label>
              <input 
                value={tagsInput} 
                onChange={(e) => setTagsInput(e.target.value)} 
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] transition-all" 
                placeholder="np. zaangażowanie, analityka HR, retention" 
              />
            </div>
          </>
        )}

        {tab === 'seo' && (
          <>
            <div className="p-4.5 bg-[#3B2F8C]/5 border border-[#C4BBDE]/35 rounded-xl text-left space-y-1">
              <p className="text-[#3B2F8C] text-[9px] font-bold uppercase tracking-wider font-mono">Podgląd w wyszukiwarce Google</p>
              <p className="text-blue-700 text-sm font-bold truncate leading-tight">{p.seoTitle || p.title || 'Brak tytułu'}</p>
              <p className="text-emerald-700 text-[11px] font-mono">hrly.pl/blog/{p.slug || 'adres-wpisu'}</p>
              <p className="text-[#55506E] text-xs leading-normal line-clamp-2">{p.seoDescription || p.excerpt || 'Brak opisu podglądu...'}</p>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Tytuł SEO strony <span className="text-[#A39AB4] font-normal">({p.seoTitle.length}/60 znaków)</span></label>
              <input value={p.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} maxLength={70} className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C]" placeholder="Meta title..." />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Opis SEO / Meta Description <span className="text-[#A39AB4] font-normal">({p.seoDescription.length}/160 znaków)</span></label>
              <textarea value={p.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} maxLength={170} rows={3} className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] resize-none" placeholder="Meta description..." />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Autor wpisu</label>
              <input value={p.author} onChange={(e) => update({ author: e.target.value })} className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Leads Inbox (Light Theme)
// ─────────────────────────────────────────────
function AdminLeadsInbox({ config, updateSection }: { config: SiteConfig; updateSection: (k: keyof SiteConfig, v: SiteConfig[keyof SiteConfig]) => void }) {
  const [filter, setFilter] = useState<'all' | 'contact' | 'demo' | 'unread' | 'starred'>('all');
  const [selected, setSelected] = useState<ContactLead | null>(null);
  const [search, setSearch] = useState('');

  const updateLead = (id: string, patch: Partial<ContactLead>) => {
    const updated = config.leads.map((l) => l.id === id ? { ...l, ...patch } : l);
    updateSection('leads', updated);
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...patch } : null);
  };

  const deleteLead = (id: string) => {
    updateSection('leads', config.leads.filter((l) => l.id !== id));
    setSelected(null);
  };

  const filtered = config.leads.filter((l) => {
    if (filter === 'unread') return !l.read;
    if (filter === 'starred') return l.starred;
    if (filter === 'contact') return l.type === 'contact';
    if (filter === 'demo') return l.type === 'demo';
    return true;
  }).filter((l) =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  );

  const unread = config.leads.filter((l) => !l.read).length;

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Zapytania ze strony</h2>
          <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">{config.leads.length} zapytań · {unread} nieprzeczytanych</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-[#EFEAE1] pb-3">
        {[
          { id: 'all', label: `Wszystkie (${config.leads.length})` },
          { id: 'unread', label: `Nieprzeczytane (${unread})` },
          { id: 'contact', label: 'Kontakt' },
          { id: 'demo', label: 'Wersje Demo' },
          { id: 'starred', label: '⭐ Oznaczone' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filter === f.id ? 'bg-[#3B2F8C] text-white shadow-md' : 'bg-white text-[#55506E] hover:text-[#14183D] border border-[#EFEAE1]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A39AB4]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po nazwisku, e-mailu, firmie..."
          className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl pl-10 pr-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] shadow-2xs"
        />
      </div>

      {selected ? (
        <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EFEAE1] pb-3">
            <button onClick={() => setSelected(null)} className="text-[#3B2F8C] hover:text-[#231B5E] flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
              <ArrowLeft size={16} /> Powrót do skrzynki zapytań
            </button>
            <div className="flex gap-2">
              <button onClick={() => updateLead(selected.id, { starred: !selected.starred })} className={`p-2.5 rounded-xl transition-colors border cursor-pointer ${selected.starred ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-[#55506E] bg-white border-[#EFEAE1] hover:bg-[#FBFAF8]'}`}>
                {selected.starred ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
              </button>
              <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">
                <Mail size={14} className="text-[#F4A574]" /> Odpowiedz e-mailowo
              </a>
              <button onClick={() => deleteLead(selected.id)} className="p-2.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl transition-all cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl p-4">
              <User size={18} className="text-[#3B2F8C] flex-shrink-0" />
              <div><div className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Imię i nazwisko</div><div className="text-[#14183D] text-xs font-bold mt-0.5">{selected.name}</div></div>
            </div>
            <div className="flex items-center gap-3 bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl p-4">
              <Mail size={18} className="text-[#3B2F8C] flex-shrink-0" />
              <div><div className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Adres e-mail</div><div className="text-[#14183D] text-xs font-bold break-all mt-0.5">{selected.email}</div></div>
            </div>
            <div className="flex items-center gap-3 bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl p-4">
              <Building size={18} className="text-[#3B2F8C] flex-shrink-0" />
              <div><div className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Firma</div><div className="text-[#14183D] text-xs font-bold mt-0.5">{selected.company || 'Nie podano'}</div></div>
            </div>
          </div>

          {selected.type === 'demo' && selected.demoDate && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
              <Calendar size={18} className="text-amber-600 flex-shrink-0" />
              <div><div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Wybrana data prezentacji demo</div><div className="text-[#14183D] text-xs font-bold mt-0.5">{selected.demoDate}</div></div>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Temat zapytania</span>
            <p className="text-[#14183D] font-bold text-sm">{selected.subject}</p>
          </div>

          {selected.message && (
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Wiadomość / Komentarz</span>
              <div className="bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl p-4.5 text-[#55506E] text-xs leading-relaxed whitespace-pre-wrap font-medium">{selected.message}</div>
            </div>
          )}

          <div className="text-[10px] font-bold text-[#A39AB4] flex items-center gap-1.5 font-mono uppercase">
            <Clock size={12} /> Data wpłynięcia: {formatDate(selected.receivedAt)}
          </div>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#EFEAE1] rounded-2xl p-12 text-center shadow-xs">
              <Inbox size={32} className="text-[#A39AB4] mx-auto mb-3" />
              <p className="text-[#55506E] text-xs font-medium">Brak zapytań w wybranej kategorii</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => { setSelected(lead); updateLead(lead.id, { read: true }); }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all hover:border-[#C4BBDE]/55 cursor-pointer ${lead.read ? 'bg-white border-[#EFEAE1]' : 'bg-[#3B2F8C]/5 border-[#C4BBDE]/40 shadow-xs shadow-indigo-900/5'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black border ${lead.type === 'demo' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-[#3B2F8C]/10 text-[#3B2F8C] border-[#C4BBDE]/35'}`}>
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#14183D] text-xs font-bold">{lead.name}</span>
                        {!lead.read && <span className="w-1.5 h-1.5 rounded-full bg-[#F4A574] flex-shrink-0" />}
                        {lead.starred && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ml-auto ${lead.type === 'demo' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-[#3B2F8C]/10 text-[#3B2F8C] border-[#C4BBDE]/35'}`}>
                          {lead.type === 'demo' ? 'Demo' : 'Kontakt'}
                        </span>
                      </div>
                      <div className="text-[#55506E] text-[10px] mb-1">{lead.email} · {lead.company || 'Brak nazwy firmy'}</div>
                      <div className="text-[#A39AB4] text-[10px] truncate font-medium">{lead.subject}: {lead.message?.slice(0, 80)}</div>
                    </div>
                    <div className="text-[#A39AB4] text-[9px] font-mono font-bold uppercase flex-shrink-0 self-center">{formatDate(lead.receivedAt).split(',')[0]}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Newsletter Subscribers (Light Theme)
// ─────────────────────────────────────────────
function AdminNewsletter({ config, updateSection }: { config: SiteConfig; updateSection: (k: keyof SiteConfig, v: SiteConfig[keyof SiteConfig]) => void }) {
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const subscribers = config.subscribers || [];

  const filtered = subscribers.filter((s) =>
    !search || s.email.toLowerCase().includes(search.toLowerCase()) || (s.source || '').toLowerCase().includes(search.toLowerCase())
  );

  const deleteSubscriber = (id: string) => {
    updateSection('subscribers', subscribers.filter((s) => s.id !== id));
    showToast('Adres usunięty z listy');
  };

  const copyAll = async () => {
    const emails = filtered.map((s) => s.email).join(', ');
    if (!emails) { showToast('Brak adresów do skopiowania', 'error'); return; }
    try {
      await navigator.clipboard.writeText(emails);
      showToast(`Skopiowano ${filtered.length} adresów do schowka`);
    } catch {
      showToast('Nie udało się skopiować do schowka', 'error');
    }
  };

  const exportCsv = () => {
    if (subscribers.length === 0) { showToast('Brak zapisów do eksportu', 'error'); return; }
    const rows = [['email', 'data zapisu', 'źródło']];
    subscribers.forEach((s) => rows.push([s.email, s.subscribedAt, s.source || '']));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrly-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Lista zapisów została pobrana (.csv)!');
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Zapisy do newslettera</h2>
          <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">{subscribers.length} {subscribers.length === 1 ? 'adres e-mail' : 'adresów e-mail'} w bazie</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyAll} className="flex items-center gap-2 bg-white border border-[#C4BBDE]/55 hover:bg-[#FBFAF8] text-[#3B2F8C] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs">
            <Copy size={14} className="text-[#F4A574]" /> Kopiuj adresy
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md">
            <Download size={14} className="text-[#F4A574]" /> Eksportuj (.csv)
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A39AB4]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po adresie e-mail lub źródle zapisu..."
          className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl pl-10 pr-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] shadow-2xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#EFEAE1] rounded-2xl p-12 text-center shadow-xs">
          <Mail size={32} className="text-[#A39AB4] mx-auto mb-3" />
          <p className="text-[#55506E] text-xs font-medium">
            {subscribers.length === 0 ? 'Nikt nie zapisał się jeszcze na newsletter.' : 'Brak wyników dla podanego zapytania.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#EFEAE1] rounded-2xl overflow-hidden shadow-xs">
          <div className="hidden sm:grid grid-cols-[1fr_180px_140px_44px] gap-4 px-5 py-3 bg-[#FBFAF8] border-b border-[#EFEAE1] text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">
            <span>Adres e-mail</span>
            <span>Źródło zapisu</span>
            <span>Data</span>
            <span></span>
          </div>
          <div className="divide-y divide-[#EFEAE1]">
            {filtered.map((s) => (
              <div key={s.id} className="grid grid-cols-1 sm:grid-cols-[1fr_180px_140px_44px] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-[#FBFAF8] transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#3B2F8C]/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={13} className="text-[#3B2F8C]" />
                  </div>
                  <a href={`mailto:${s.email}`} className="text-[#14183D] text-xs font-bold truncate hover:text-[#3B2F8C] transition-colors">{s.email}</a>
                </div>
                <span className="text-[#55506E] text-[11px] font-medium truncate">{s.source || '—'}</span>
                <span className="text-[#A39AB4] text-[10px] font-mono">{formatDate(s.subscribedAt)}</span>
                <button onClick={() => deleteSubscriber(s.id)} className="p-2 text-[#55506E] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer justify-self-start sm:justify-self-center" title="Usuń adres">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Analytics (Umami embed - Light Theme style)
// ─────────────────────────────────────────────
function AdminAnalytics({ config }: { config: SiteConfig }) {
  const UMAMI_URL = 'https://cloud.umami.is';
  const UMAMI_WEBSITE_ID = '14e22989-abe7-492b-9803-1df3459b3460';

  const [customUrl, setCustomUrl] = useState(UMAMI_URL);
  const [customId, setCustomId] = useState(UMAMI_WEBSITE_ID);
  const [showSettings, setShowSettings] = useState(false);
  const [activeEmbed, setActiveEmbed] = useState({ url: UMAMI_URL, id: UMAMI_WEBSITE_ID });

  const shareUrl = `${activeEmbed.url}/share/${activeEmbed.id}/hrly.pl`;
  const dashboardUrl = `${activeEmbed.url}/websites/${activeEmbed.id}`;

  const applySettings = () => {
    setActiveEmbed({ url: customUrl, id: customId });
    setShowSettings(false);
  };

  void config;

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Analityka ruchu</h2>
          <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">Umami Analytics — RODO-compliant statystyki bez zbierania ciasteczek</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-[#3B2F8C] hover:bg-[#3B2F8C]/5 border border-[#EFEAE1] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white"
        >
          <Settings size={14} /> Połączenie
        </button>
      </div>

      <div className="flex items-start gap-4 p-4.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={16} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider">Śledzenie jest włączone</p>
          <p className="text-[#55506E] text-[11px] mt-0.5 leading-relaxed">
            Skrypt zbiera dane z domeny hrly.pl · ID witryny: <code className="text-emerald-700 bg-white px-1.5 py-0.5 rounded font-mono font-bold">{activeEmbed.id}</code>
          </p>
        </div>
        <a
          href="https://cloud.umami.is"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3B2F8C] bg-white border border-[#C4BBDE]/35 px-3.5 py-2 rounded-xl hover:bg-[#FBFAF8] transition-colors shadow-2xs"
        >
          Panel Umami <ExternalLink size={12} className="text-[#F4A574]" />
        </a>
      </div>

      {showSettings && (
        <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-4 shadow-sm animate-slide-down">
          <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight flex items-center gap-2 border-b border-[#EFEAE1] pb-2">
            <Settings size={16} className="text-[#3B2F8C]" /> Konfiguracja kodu śledzącego
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">URL instancji statystyk</label>
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Website ID witryny</label>
              <input
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C]"
              />
            </div>
          </div>
          <button onClick={applySettings} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm">
            <Save size={14} className="text-[#F4A574]" /> Zastosuj ustawienia
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pełny pulpit statystyk', href: dashboardUrl, icon: <BarChart3 size={18} />, color: 'violet' },
          { label: 'Publiczny raport udostępniania', href: shareUrl, icon: <ExternalLink size={18} />, color: 'sky' },
          { label: 'Logowanie do Umami Cloud', href: 'https://cloud.umami.is', icon: <Activity size={18} />, color: 'emerald' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.01] ${
              link.color === 'violet' ? 'bg-[#3B2F8C]/5 border-[#C4BBDE]/35 text-[#3B2F8C] hover:bg-[#3B2F8C]/10' :
              link.color === 'sky' ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100' :
              'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {link.icon}
            <span className="text-xs font-bold uppercase tracking-wider">{link.label}</span>
          </a>
        ))}
      </div>

      <div className="bg-white border border-[#EFEAE1] rounded-2xl overflow-hidden shadow-xs">
        <div className="flex items-center justify-between p-4 bg-[#FBFAF8] border-b border-[#EFEAE1]">
          <span className="text-[#14183D] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-[#3B2F8C]" /> Panel analityczny (Podgląd live)
          </span>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-[#3B2F8C] hover:underline text-xs font-bold flex items-center gap-1">
            Pełny ekran <ExternalLink size={12} />
          </a>
        </div>
        <iframe
          src={shareUrl}
          className="w-full bg-white"
          style={{ height: '600px', border: 'none' }}
          title="Umami Analytics — hrly.pl"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Settings (Light Theme Layout & Form)
// ─────────────────────────────────────────────
function AdminSettings({ config, updateSection }: { config: SiteConfig; updateSection: (k: keyof SiteConfig, v: SiteConfig[keyof SiteConfig]) => void }) {
  const [global, setGlobal] = useState(config.global);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const exportData = () => {
    const data = JSON.stringify(loadConfig(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrly-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Kopia danych została pobrana!');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as SiteConfig;
        saveConfig(parsed);
        window.location.reload();
      } catch {
        showToast('Wystąpił błąd podczas odczytu pliku JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (window.confirm('Czy na pewno chcesz zresetować wszystkie dane CMS do wartości domyślnych? Ta operacja usunie wszystkie wpisy na blogu i zapytania.')) {
      localStorage.removeItem('hrly_site_config');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div>
        <h2 className="text-2xl font-display font-black text-[#14183D] uppercase tracking-tight">Ustawienia systemu</h2>
        <p className="text-[#55506E] text-xs font-semibold uppercase tracking-wider mt-1">Hasło dostępu, konfiguracja SEO i kopie zapasowe</p>
      </div>

      <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-5 shadow-sm">
        <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 flex items-center gap-2">
          <Globe size={18} className="text-[#3B2F8C]" /> Ustawienia globalne
        </h3>
        {[
          ['Nazwa serwisu / Strony', 'siteName'],
          ['Główny slogan (Tagline)', 'tagline'],
          ['Link przycisku głównego (np. rejestracja)', 'primaryCTALink'],
          ['Tekst przycisku głównego', 'primaryCTAText'],
        ].map(([label, key]) => (
          <div key={key} className="space-y-1">
            <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">{label}</label>
            <input
              value={(global as Record<string, string>)[key] || ''}
              onChange={(e) => setGlobal({ ...global, [key]: e.target.value })}
              className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C]"
            />
          </div>
        ))}
        <button onClick={() => { updateSection('global', global); showToast('Ustawienia globalne zostały zapisane!'); }} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md">
          <Save size={14} className="text-[#F4A574]" /> Zapisz konfigurację
        </button>
      </div>

      <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 flex items-center gap-2">
          <Image size={18} className="text-[#3B2F8C]" /> Zdjęcie wyróżniające stronę (Open Graph)
        </h3>
        <p className="text-[#55506E] text-xs leading-relaxed">
          W katalogu głównym witryny skonfigurowano dedykowany i estetyczny baner społecznościowy (social banner) o wymiarach 1200x630px, który wczytuje się przy udostępnianiu linku w mediach społecznościowych (LinkedIn, Facebook, Slack).
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#FBFAF8] p-4.5 rounded-2xl border border-[#EFEAE1]">
          <div className="w-32 aspect-[1.91/1] rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-[#EFEAE1]">
            <img src="/hrly_og_banner.png" alt="Podgląd og:image" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-[#A39AB4] uppercase tracking-wider">Adres URL grafiki Open Graph</span>
            <code className="text-xs text-[#3B2F8C] block truncate mt-1 font-mono font-bold">https://hrly.pl/hrly_og_banner.png</code>
            <p className="text-[#55506E] text-[10px] mt-1.5">
              ✓ Obrazek jest spakowany bezpośrednio w kodzie dystrybucyjnym i poprawnie skonfigurowany w nagłówkach SEO HTML.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 flex items-center gap-2">
          <Key size={18} className="text-[#3B2F8C]" /> Zmiana hasła administratora
        </h3>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-[#A39AB4] uppercase tracking-wider">Nowe hasło dostępowe</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={global.adminPassword}
              onChange={(e) => setGlobal({ ...global, adminPassword: e.target.value })}
              className="w-full bg-white border border-[#C4BBDE]/55 rounded-xl px-4 py-3 text-[#14183D] text-sm outline-none focus:border-[#3B2F8C] pr-12 font-mono"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39AB4] hover:text-[#14183D] transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button onClick={() => { updateSection('global', global); showToast('Hasło administratora zostało zmienione!'); }} className="flex items-center gap-2 bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md">
          <Key size={14} className="text-[#F4A574]" /> Zmień hasło panelu
        </button>
      </div>

      <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-[#14183D] font-display font-extrabold text-sm uppercase tracking-tight border-b border-[#EFEAE1] pb-2 flex items-center gap-2">
          <Download size={18} className="text-[#3B2F8C]" /> Kopie bezpieczeństwa danych
        </h3>
        <p className="text-[#55506E] text-xs leading-relaxed">Pobierz plik ze wszystkimi wpisami na blogu i zmianami CMS do pliku tekstowego na wypadek zmiany komputera lub wyczyszczenia przeglądarki.</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportData} className="flex items-center gap-2 bg-white border border-[#C4BBDE]/55 hover:bg-[#FBFAF8] text-[#3B2F8C] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs">
            <Download size={14} /> Eksportuj kopię CMS (.json)
          </button>
          <label className="flex items-center gap-2 bg-[#FBFAF8] border border-[#EFEAE1] hover:bg-[#E3DEEE]/40 text-[#55506E] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs">
            <Upload size={14} /> Przywróć dane z pliku
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-red-700 font-display font-extrabold text-sm uppercase tracking-tight border-b border-red-200 pb-2 flex items-center gap-2">
          <AlertCircle size={18} className="text-red-600" /> Strefa niebezpieczna
        </h3>
        <p className="text-red-800 text-xs font-medium">Przywrócenie ustawień domyślnych skasuje trwale całą konfigurację serwisu zapisaną w tej przeglądarce.</p>
        <button onClick={resetData} className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
          <Trash2 size={14} /> Resetuj całą zawartość CMS
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main AdminPanel Wrapper (Light Theme Setup)
// ─────────────────────────────────────────────
export function AdminPanel({ onBack }: { onBack: () => void }) {
  const [isAuth, setIsAuth] = useState(() => sessionStorage.getItem('hrly_admin_auth') === '1');
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const { config, updateSection } = useSiteConfig();

  const unreadLeads = config.leads.filter((l) => !l.read).length;

  const logout = () => {
    sessionStorage.removeItem('hrly_admin_auth');
    setIsAuth(false);
  };

  if (!isAuth) return <AdminLogin onLogin={() => setIsAuth(true)} />;

  const updateSectionTyped = <K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) => updateSection(k, v);

  return (
    <div className="flex h-screen bg-[#FBFAF8] overflow-hidden font-sans">
      <Sidebar
        active={section}
        setActive={setSection}
        onLogout={logout}
        collapsed={collapsed}
        unreadLeads={unreadLeads}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#EFEAE1]/70 bg-white">
          <button onClick={() => setCollapsed(!collapsed)} className="text-[#55506E] hover:text-[#14183D] cursor-pointer">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <div className="flex-1" />
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#55506E] hover:text-[#3B2F8C] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-[#FBFAF8] border border-[#EFEAE1] px-4.5 py-2 rounded-xl shadow-2xs"
          >
            <ExternalLink size={13} className="text-[#F4A574]" /> Podgląd serwisu
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FBFAF8]">
          {section === 'dashboard' && <AdminDashboard config={config} setSection={setSection} />}
          {section === 'cms' && <AdminCMSEditor config={config} updateSection={updateSectionTyped} />}
          {section === 'blog' && <AdminBlogEditor config={config} updateSection={updateSectionTyped} />}
          {section === 'leads' && <AdminLeadsInbox config={config} updateSection={updateSectionTyped} />}
          {section === 'newsletter' && <AdminNewsletter config={config} updateSection={updateSectionTyped} />}
          {section === 'analytics' && <AdminAnalytics config={config} />}
          {section === 'settings' && <AdminSettings config={config} updateSection={updateSectionTyped} />}
        </div>
      </div>
    </div>
  );
}
