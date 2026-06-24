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
import { GoogleGenAI, Type } from '@google/genai';
import {
  useSiteConfig,
  loadConfig,
  saveConfig,
  type BlogPost,
  type ContactLead,
  type PricingPlan,
  type SiteConfig,
} from '../hooks/useSiteConfig';

// ─────────────────────────────────────────────
// Helpers
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
  return new Date(iso).toLocaleDateString('pl-PL', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium transition-all ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────
// Login Screen
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
    <div className="min-h-screen bg-[#0B0F2C] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-4 shadow-lg shadow-violet-900/30">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
          <p className="text-slate-400 text-sm mt-1">HRly CMS · zaloguj się, aby kontynuować</p>
        </div>
        <form onSubmit={handle} className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Hasło administratora</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setError(''); }}
                className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 pr-12"
                placeholder="••••••••"
                autoFocus
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all">
            Zaloguj się
          </button>
        </form>
        <p className="text-center text-slate-500 text-xs mt-4">
          Domyślne hasło: <code className="text-violet-400">hrly2024</code> (zmień w Ustawieniach)
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
type AdminSection = 'dashboard' | 'cms' | 'blog' | 'leads' | 'analytics' | 'settings';

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'cms', label: 'Zarządzanie treścią', icon: <FileText size={18} /> },
  { id: 'blog', label: 'Blog & AI', icon: <Sparkles size={18} /> },
  { id: 'leads', label: 'Zapytania', icon: <Inbox size={18} /> },
  { id: 'analytics', label: 'Analityka', icon: <BarChart3 size={18} /> },
  { id: 'settings', label: 'Ustawienia', icon: <Settings size={18} /> },
];

function Sidebar({
  active, setActive, onLogout, collapsed, unreadLeads,
}: {
  active: AdminSection; setActive: (s: AdminSection) => void;
  onLogout: () => void; collapsed: boolean; unreadLeads: number;
}) {
  return (
    <aside className={`flex flex-col h-full bg-[#0e1330] border-r border-white/10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex-shrink-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold">HR</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-white text-sm font-bold">HRly Admin</div>
            <div className="text-slate-500 text-xs">Panel CMS</div>
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-violet-600/20 text-violet-400 border border-violet-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && 'Wyloguj się'}
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
function AdminDashboard({ config, setSection }: { config: SiteConfig; setSection: (s: AdminSection) => void }) {
  const unread = config.leads.filter((l) => !l.read).length;
  const posts = config.blogPosts.length;
  const published = config.blogPosts.filter((b) => b.status === 'published').length;

  const cards = [
    { label: 'Wpisy na blogu', value: posts, sub: `${published} opublikowane`, icon: <BookOpen size={20} />, color: 'violet', action: 'blog' as AdminSection },
    { label: 'Nieprzeczytane zapytania', value: unread, sub: `${config.leads.length} łącznie`, icon: <Inbox size={20} />, color: 'amber', action: 'leads' as AdminSection },
    { label: 'Plany cennikowe', value: config.pricing.length, sub: 'aktywne', icon: <Zap size={20} />, color: 'emerald', action: 'cms' as AdminSection },
    { label: 'Analityka', value: '–', sub: 'Umami Analytics', icon: <BarChart3 size={20} />, color: 'sky', action: 'analytics' as AdminSection },
  ];

  const colorMap: Record<string, string> = {
    violet: 'bg-violet-600/20 text-violet-400 border-violet-600/30',
    amber: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
    emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
    sky: 'bg-sky-600/20 text-sky-400 border-sky-600/30',
  };

  const recentLeads = config.leads.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
        <p className="text-slate-400 text-sm">Przegląd panelu zarządzania HRly</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => setSection(c.action)}
            className={`text-left p-5 rounded-2xl border ${colorMap[c.color]} bg-[#131837] hover:scale-[1.02] transition-transform`}
          >
            <div className="mb-3">{c.icon}</div>
            <div className="text-3xl font-bold text-white mb-0.5">{c.value}</div>
            <div className="text-xs font-medium mb-1">{c.label}</div>
            <div className="text-slate-500 text-xs">{c.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#131837] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Inbox size={16} className="text-violet-400" /> Ostatnie zapytania
          </h3>
          {recentLeads.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Brak zapytań</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className={`flex items-start gap-3 p-3 rounded-xl ${lead.read ? 'opacity-60' : 'bg-violet-600/5 border border-violet-600/20'}`}>
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{lead.name}</div>
                    <div className="text-slate-400 text-xs truncate">{lead.company} · {lead.email}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{formatDate(lead.receivedAt)}</div>
                  </div>
                  {!lead.read && <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-2" />}
                </div>
              ))}
              <button onClick={() => setSection('leads')} className="text-violet-400 text-xs hover:underline">
                Zobacz wszystkie →
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#131837] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText size={16} className="text-violet-400" /> Ostatnie wpisy na blogu
          </h3>
          {config.blogPosts.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles size={24} className="text-violet-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-3">Brak wpisów. Utwórz pierwszy za pomocą AI!</p>
              <button onClick={() => setSection('blog')} className="text-xs bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-500 transition-colors">
                Utwórz wpis z AI
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {config.blogPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{post.title}</div>
                    <div className="text-slate-400 text-xs">{post.category} · {formatDate(post.publishedAt)}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.status === 'published' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-600/20 text-amber-400'}`}>
                    {post.status === 'published' ? 'Opublikowany' : 'Szkic'}
                  </span>
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
// CMS Editor
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
    <div key={label}>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Zarządzanie treścią</h2>
        <p className="text-slate-400 text-sm">Edytuj sekcje strony głównej i podstron</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-violet-600 text-white' : 'bg-[#131837] text-slate-400 hover:text-white border border-white/10'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#131837] border border-white/10 rounded-2xl p-6">
        {tab === 'hero' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Sekcja Hero</h3>
            {field('Badge / Overline', hero.badge, (v) => setHero({ ...hero, badge: v }))}
            {field('Nagłówek główny (H1)', hero.headline, (v) => setHero({ ...hero, headline: v }))}
            {field('Opis / Subheadline', hero.subheadline, (v) => setHero({ ...hero, subheadline: v }), true)}
            {field('Tekst CTA (główny)', hero.ctaPrimaryText, (v) => setHero({ ...hero, ctaPrimaryText: v }))}
            {field('Link CTA (główny)', hero.ctaPrimaryLink, (v) => setHero({ ...hero, ctaPrimaryLink: v }))}
            {field('Tekst CTA (drugorzędny)', hero.ctaSecondaryText, (v) => setHero({ ...hero, ctaSecondaryText: v }))}
            <button onClick={() => { updateSection('hero', hero); showToast('Hero zapisany!'); }} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Save size={15} /> Zapisz Hero
            </button>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Sekcja Statystyki</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => {
                const k = i === 1 ? 'stat1' : i === 2 ? 'stat2' : 'stat3';
                return (
                  <div key={i} className="bg-[#1a2040] rounded-xl p-4 space-y-3">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Statystyka {i}</p>
                    {field('Wartość', (stats as Record<string, string>)[`${k}Value`], (v) => setStats({ ...stats, [`${k}Value`]: v }))}
                    {field('Opis', (stats as Record<string, string>)[`${k}Label`], (v) => setStats({ ...stats, [`${k}Label`]: v }))}
                  </div>
                );
              })}
            </div>
            <button onClick={() => { updateSection('stats', stats); showToast('Statystyki zapisane!'); }} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Save size={15} /> Zapisz Statystyki
            </button>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold mb-4">Plany Cennikowe</h3>
            {pricing.map((plan, idx) => (
              <div key={plan.id} className="bg-[#1a2040] rounded-xl p-5 space-y-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{plan.name}</span>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input type="checkbox" checked={plan.highlighted} onChange={(e) => {
                      const next = [...pricing];
                      next[idx] = { ...plan, highlighted: e.target.checked };
                      setPricing(next);
                    }} className="w-4 h-4 accent-violet-500" />
                    Wyróżniony
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {field('Nazwa planu', plan.name, (v) => { const n = [...pricing]; n[idx] = { ...plan, name: v }; setPricing(n); })}
                  {field('Cena', plan.price, (v) => { const n = [...pricing]; n[idx] = { ...plan, price: v }; setPricing(n); })}
                  {field('Okres', plan.period, (v) => { const n = [...pricing]; n[idx] = { ...plan, period: v }; setPricing(n); })}
                  {field('Tekst CTA', plan.ctaText, (v) => { const n = [...pricing]; n[idx] = { ...plan, ctaText: v }; setPricing(n); })}
                </div>
                {field('Opis', plan.description, (v) => { const n = [...pricing]; n[idx] = { ...plan, description: v }; setPricing(n); }, true)}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Funkcje (jedna na linię)</label>
                  <textarea
                    value={plan.features.join('\n')}
                    onChange={(e) => { const n = [...pricing]; n[idx] = { ...plan, features: e.target.value.split('\n').filter(Boolean) }; setPricing(n); }}
                    rows={4}
                    className="w-full bg-[#0e1330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              </div>
            ))}
            <button onClick={() => { updateSection('pricing', pricing); showToast('Cennik zapisany!'); }} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Save size={15} /> Zapisz Cennik
            </button>
          </div>
        )}

        {tab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Dane Kontaktowe</h3>
            {field('Email', contact.email, (v) => setContact({ ...contact, email: v }))}
            {field('Telefon', contact.phone, (v) => setContact({ ...contact, phone: v }))}
            {field('Adres', contact.address, (v) => setContact({ ...contact, address: v }))}
            {field('LinkedIn URL', contact.linkedIn, (v) => setContact({ ...contact, linkedIn: v }))}
            {field('Link do Kalendarza (Calendly)', contact.calendarLink, (v) => setContact({ ...contact, calendarLink: v }))}
            <button onClick={() => { updateSection('contact', contact); showToast('Kontakt zapisany!'); }} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Save size={15} /> Zapisz Kontakt
            </button>
          </div>
        )}

        {tab === 'footer' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Stopka</h3>
            {field('Opis firmy', footer.companyDescription, (v) => setFooter({ ...footer, companyDescription: v }), true)}
            {field('LinkedIn URL', footer.linkedIn, (v) => setFooter({ ...footer, linkedIn: v }))}
            {field('Twitter/X URL', footer.twitter, (v) => setFooter({ ...footer, twitter: v }))}
            {field('Facebook URL', footer.facebook, (v) => setFooter({ ...footer, facebook: v }))}
            {field('Tekst copyright', footer.copyright, (v) => setFooter({ ...footer, copyright: v }))}
            <button onClick={() => { updateSection('footer', footer); showToast('Stopka zapisana!'); }} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Save size={15} /> Zapisz Stopkę
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Blog Editor + AI
// ─────────────────────────────────────────────
const BLOG_CATEGORIES = ['HR Analityka', 'Zarządzanie Zespołem', 'Employee Experience', 'eNPS & Zaangażowanie', 'Rekrutacja', 'Wellbeing', 'Przywództwo', 'Technologia HR'];

function AdminBlogEditor({ config, updateSection }: { config: SiteConfig; updateSection: (k: keyof SiteConfig, v: SiteConfig[keyof SiteConfig]) => void }) {
  const [view, setView] = useState<'list' | 'edit' | 'ai'>('list');
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
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
    showToast('Wpis zapisany!');
    setView('list');
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) { setAiError('Podaj temat wpisu'); return; }
    setAiLoading(true);
    setAiError('');
    setAiResult(null);

    const prompt = `Jesteś ekspertem HR i copywriterem SEO. Napisz profesjonalny wpis blogowy dla platformy HRly (polskojęzycznej platformy analityki HR) na następujący temat:

TEMAT: ${aiTopic}
KATEGORIA: ${aiCategory}
SŁOWA KLUCZOWE SEO: ${aiKeywords || 'HR, zaangażowanie pracowników, analityka HR, eNPS'}

WYMAGANIA:
- Język: Polski, profesjonalny, angażujący
- Długość: ok. 800-1200 słów
- Format: Markdown (użyj ## dla nagłówków, **pogrubienie**, listy z -)
- SEO: naturalnie wpleć słowa kluczowe, używaj nagłówków H2/H3
- Struktura: Wstęp (hak), 3-4 główne sekcje z H2, praktyczne przykłady, podsumowanie z CTA do HRly
- Ton: Ekspercki, ale przystępny
- Na końcu dodaj 3-5 tagów oddzielonych przecinkami

Użyj swojej wiedzy o aktualnych trendach HR, badaniach i najlepszych praktykach branżowych.

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
      // Extract JSON from response
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

  // ── Post editor
  if (view === 'edit' && editPost) {
    return (
      <BlogPostEditor
        post={editPost}
        onSave={savePost}
        onBack={() => setView('list')}
      />
    );
  }

  // ── AI generator
  if (view === 'ai') {
    return (
      <div className="space-y-6">
        {toast && <Toast msg={toast.msg} type={toast.type} />}
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Asystent AI — Tworzenie Wpisów</h2>
            <p className="text-slate-400 text-sm">Gemini przeszuka internet i napisze wpis SEO dla Ciebie</p>
          </div>
        </div>

        <div className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-start gap-4 p-4 bg-violet-600/10 border border-violet-600/20 rounded-xl">
            <Sparkles size={20} className="text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-violet-300 text-sm font-medium">AI z wyszukiwaniem internetowym</p>
              <p className="text-slate-400 text-xs mt-0.5">Model Gemini 2.0 Flash z Google Search — wyszukuje aktualne informacje HR i tworzy wpis SEO</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Temat wpisu *</label>
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="np. Jak mierzyć zaangażowanie pracowników w 2025 roku?"
              className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Kategoria</label>
              <select
                value={aiCategory}
                onChange={(e) => setAiCategory(e.target.value)}
                className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
              >
                {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Słowa kluczowe SEO (opcjonalne)</label>
              <input
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                placeholder="eNPS, zaangażowanie, HR analytics"
                className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {aiError && (
            <div className="flex items-start gap-3 p-4 bg-red-600/10 border border-red-600/20 rounded-xl">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{aiError}</p>
            </div>
          )}

          <button
            onClick={generateWithAI}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <><RefreshCw size={16} className="animate-spin" /> Szukam w internecie i piszę…</>
            ) : (
              <><Sparkles size={16} /> Generuj wpis z AI</>
            )}
          </button>
        </div>

        {aiResult && (
          <div className="bg-[#131837] border border-emerald-600/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-400" /> Wygenerowany wpis
              </h3>
              <button
                onClick={useAiResult}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Edit3 size={14} /> Otwórz w edytorze
              </button>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Tytuł</p>
              <p className="text-white font-bold text-lg">{aiResult.title}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Opis (excerpt)</p>
              <p className="text-slate-300 text-sm">{aiResult.excerpt}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Tagi</p>
              <div className="flex flex-wrap gap-1.5">
                {(aiResult.tags || []).map((t) => (
                  <span key={t} className="bg-violet-600/20 text-violet-300 text-xs px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-2">Podgląd treści (fragment)</p>
              <div className="bg-[#1a2040] rounded-xl p-4 text-sm text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {(aiResult.content || '').slice(0, 600)}…
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Post list
  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Blog & AI</h2>
          <p className="text-slate-400 text-sm">{posts.length} {posts.length === 1 ? 'wpis' : 'wpisów'}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView('ai')}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles size={15} /> Utwórz z AI
          </button>
          <button
            onClick={() => { setEditPost(newPost()); setView('edit'); }}
            className="flex items-center gap-2 bg-[#1a2040] border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Plus size={15} /> Nowy wpis
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-[#131837] border border-white/10 rounded-2xl p-12 text-center">
          <Sparkles size={32} className="text-violet-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Brak wpisów na blogu</h3>
          <p className="text-slate-400 text-sm mb-4">Utwórz pierwszy wpis ręcznie lub pozwól AI to zrobić!</p>
          <button onClick={() => setView('ai')} className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors">
            Utwórz z AI →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#131837] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-white/20 transition-colors">
              {/* Cover thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1a2040] flex-shrink-0 border border-white/10 relative">
                <img 
                  src={post.imageUrl || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80"} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.status === 'published' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-600/20 text-amber-400'}`}>
                    {post.status === 'published' ? 'Opublikowany' : 'Szkic'}
                  </span>
                  <span className="text-slate-500 text-xs">{post.category}</span>
                </div>
                <h4 className="text-white font-medium text-sm mb-1 truncate">{post.title}</h4>
                <p className="text-slate-400 text-xs truncate">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-slate-500 text-xs flex items-center gap-1"><Clock size={11} /> {formatDate(post.publishedAt)}</span>
                  {post.tags.length > 0 && (
                    <span className="text-slate-500 text-xs flex items-center gap-1"><Tag size={11} /> {post.tags.slice(0, 2).join(', ')}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditPost(post); setView('edit'); }} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => deletePost(post.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors">
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 800 * 1024) {
      alert("UWAGA: Wybrany obraz jest dosyć duży. Aby nie przepełnić pamięci przeglądarki (localStorage), zalecamy używanie plików o rozmiarze poniżej 800 KB lub skorzystanie z gotowych szablonów Unsplash.");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        update({ imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">
            {p.id.startsWith('post_') && !p.title ? 'Nowy wpis' : p.title || 'Edycja wpisu'}
          </h2>
        </div>
        <div className="flex gap-3">
          <select
            value={p.status}
            onChange={(e) => update({ status: e.target.value as 'published' | 'draft' })}
            className="bg-[#1a2040] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
          >
            <option value="draft">Szkic</option>
            <option value="published">Opublikowany</option>
          </select>
          <button 
            onClick={() => onSave({ ...p, tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean) })} 
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md"
          >
            <Save size={15} /> Zapisz wpis
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['content', 'seo'] as const).map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-violet-600 text-white' : 'bg-[#131837] text-slate-400 hover:text-white border border-white/10'}`}
          >
            {t === 'content' ? 'Treść i Media' : 'Meta tagi SEO'}
          </button>
        ))}
      </div>

      {/* Editor Content */}
      <div className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-5">
        {tab === 'content' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Tytuł wpisu *</label>
              <input 
                value={p.title} 
                onChange={(e) => update({ title: e.target.value, slug: slugify(e.target.value) })} 
                className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500" 
                placeholder="np. 5 sposobów na podniesienie morale w zespole" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Adres URL wpisu (Slug)</label>
                <input 
                  value={p.slug} 
                  onChange={(e) => update({ slug: e.target.value })} 
                  className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Kategoria główna</label>
                <select 
                  value={p.category} 
                  onChange={(e) => update({ category: e.target.value })} 
                  className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
                >
                  {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* OKŁADKA WPISU */}
            <div className="border border-white/5 bg-[#171b3e] rounded-xl p-5 space-y-4">
              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-1">Obrazek wyróżniający (Okładka)</h4>
                <p className="text-slate-400 text-xs">Wybierz gotowy szablon z galerii, wgraj własne zdjęcie lub wklej dowolny adres URL.</p>
              </div>

              {/* Wybór metody */}
              <div className="flex gap-2 border-b border-white/5 pb-3">
                {([
                  { id: 'preset', label: 'Wybierz szablon Unsplash' },
                  { id: 'upload', label: 'Wgraj plik z dysku' },
                  { id: 'url', label: 'Wklej link bezpośredni' }
                ] as const).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setImageTab(t.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${imageTab === t.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
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
                      className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all ${p.imageUrl === img.url ? 'border-violet-500 ring-2 ring-violet-500/50' : 'border-white/10 opacity-70 hover:opacity-100'}`}
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
                  <label className="flex items-center gap-2 bg-[#1a2040] hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white font-medium cursor-pointer transition-colors">
                    <Upload size={14} className="text-violet-400" />
                    Wybierz plik z dysku...
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <p className="text-[10px] text-slate-400">Przeglądarka przetworzy plik na format lokalny Base64. Zalecane obrazy do 800 KB.</p>
                </div>
              )}

              {/* Raw URL */}
              {imageTab === 'url' && (
                <div>
                  <input
                    value={p.imageUrl || ''}
                    onChange={(e) => update({ imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              )}

              {/* Live Preview */}
              {p.imageUrl && (
                <div className="flex gap-4 items-center bg-[#111430] p-3 rounded-lg border border-white/5">
                  <div className="w-24 aspect-[16/9] rounded overflow-hidden bg-slate-800 flex-shrink-0">
                    <img src={p.imageUrl} alt="Podgląd okładki" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-400">Podgląd ustawionej okładki</div>
                    <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1 mt-0.5">
                      ✓ Obrazek jest przypisany do artykułu
                    </div>
                  </div>
                  <button 
                    onClick={() => update({ imageUrl: '' })}
                    className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Usuń zdjęcie
                  </button>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Krótki wstęp / Wypis (Excerpt) *</label>
              <textarea 
                value={p.excerpt} 
                onChange={(e) => update({ excerpt: e.target.value })} 
                rows={2} 
                placeholder="Podsumowanie artykułu widoczne na liście (150-200 znaków)..."
                className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 resize-none" 
              />
            </div>

            {/* Content text-editor with formatting toolbar */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Treść artykułu (Markdown) *</label>
                <span className="text-[10px] text-slate-500 font-mono">Formatowanie Markdown aktywne</span>
              </div>

              {/* Formatting Toolbar */}
              <div className="bg-[#171b3e] border-t border-x border-white/10 rounded-t-xl px-3 py-2 flex flex-wrap gap-1.5 items-center">
                <button type="button" onClick={() => insertMarkdown('**', '**')} className="px-2.5 py-1 bg-[#1a2040] hover:bg-white/10 text-white rounded text-xs font-bold font-mono" title="Pogrubienie">B</button>
                <button type="button" onClick={() => insertMarkdown('*', '*')} className="px-2.5 py-1 bg-[#1a2040] hover:bg-white/10 text-white rounded text-xs italic font-mono" title="Kursywa">I</button>
                <div className="w-[1px] h-4 bg-white/10 mx-1" />
                <button type="button" onClick={() => insertMarkdown('## ')} className="px-2 py-1 bg-[#1a2040] hover:bg-white/10 text-white rounded text-xs font-bold" title="Nagłówek H2">H2</button>
                <button type="button" onClick={() => insertMarkdown('### ')} className="px-2 py-1 bg-[#1a2040] hover:bg-white/10 text-white rounded text-xs font-bold" title="Nagłówek H3">H3</button>
                <div className="w-[1px] h-4 bg-white/10 mx-1" />
                <button type="button" onClick={() => insertMarkdown('> ')} className="px-2 py-1 bg-[#1a2040] hover:bg-white/10 text-white text-xs" title="Cytat">Cytat</button>
                <button type="button" onClick={() => insertMarkdown('- ')} className="px-2 py-1 bg-[#1a2040] hover:bg-white/10 text-white text-xs" title="Element listy">Lista</button>
                <div className="w-[1px] h-4 bg-white/10 mx-1" />
                
                {/* Image insert */}
                <button 
                  type="button" 
                  onClick={() => {
                    const url = prompt("Wklej bezpośredni adres URL zdjęcia (np. z Unsplash lub innego hostingu):");
                    if (url) insertMarkdown(`![Opis obrazka](${url})`);
                  }} 
                  className="flex items-center gap-1 px-2.5 py-1 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 rounded text-xs font-medium"
                  title="Wstaw obrazek w treści"
                >
                  <Image size={12} /> Dodaj zdjęcie
                </button>

                {/* Link insert */}
                <button 
                  type="button" 
                  onClick={() => {
                    const url = prompt("Wpisz lub wklej adres URL linku:");
                    if (url) insertMarkdown(`[Tekst linku](${url})`);
                  }} 
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded text-xs font-medium"
                  title="Wstaw link"
                >
                  <Link size={12} /> Link
                </button>
              </div>

              <textarea 
                id="blog-content-textarea"
                value={p.content} 
                onChange={(e) => update({ content: e.target.value })} 
                rows={16} 
                placeholder="Wpisz treść artykułu..."
                className="w-full bg-[#1a2040] border border-white/10 rounded-b-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 font-mono text-xs leading-relaxed" 
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                💡 Wskazówka: Możesz dodawać zdjęcia wewnątrz treści artykułu za pomocą przycisku 🖼 **Dodaj zdjęcie**. Wklej dowolny link graficzny.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Tagi (oddzielone przecinkami)</label>
              <input 
                value={tagsInput} 
                onChange={(e) => setTagsInput(e.target.value)} 
                className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500" 
                placeholder="np. zaangażowanie, analityka HR, retention" 
              />
            </div>
          </>
        )}

        {tab === 'seo' && (
          <>
            <div className="p-4 bg-violet-600/10 border border-violet-600/20 rounded-xl">
              <p className="text-violet-300 text-xs font-semibold mb-1 uppercase tracking-wider font-mono">Podgląd w Google</p>
              <p className="text-blue-400 text-sm font-bold truncate">{p.seoTitle || p.title || 'Tytuł wpisu'}</p>
              <p className="text-green-400 text-xs font-mono">hrly.pl/blog/{p.slug || 'adres-wpisu'}</p>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{p.seoDescription || p.excerpt || 'Opis wpisu...'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Tytuł SEO <span className="text-slate-500 font-normal">({p.seoTitle.length}/60 znaków)</span></label>
              <input value={p.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} maxLength={70} className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500" placeholder="Meta title..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Opis SEO / Meta Description <span className="text-slate-500 font-normal">({p.seoDescription.length}/160 znaków)</span></label>
              <textarea value={p.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} maxLength={170} rows={3} className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 resize-none" placeholder="Meta description..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Autor wpisu</label>
              <input value={p.author} onChange={(e) => update({ author: e.target.value })} className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Leads Inbox
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Zapytania ze strony</h2>
          <p className="text-slate-400 text-sm">{config.leads.length} zapytań · {unread} nieprzeczytanych</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: `Wszystkie (${config.leads.length})` },
          { id: 'unread', label: `Nieprzeczytane (${unread})` },
          { id: 'contact', label: 'Kontakt' },
          { id: 'demo', label: 'Demo' },
          { id: 'starred', label: '⭐ Oznaczone' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.id ? 'bg-violet-600 text-white' : 'bg-[#131837] text-slate-400 hover:text-white border border-white/10'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po nazwie, emailu, firmie..."
          className="w-full bg-[#131837] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-violet-500"
        />
      </div>

      {selected ? (
        <div className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft size={16} /> Powrót do listy
            </button>
            <div className="flex gap-2">
              <button onClick={() => updateLead(selected.id, { starred: !selected.starred })} className={`p-2 rounded-lg transition-colors ${selected.starred ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/10'}`}>
                {selected.starred ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
              </button>
              <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                <Mail size={14} /> Odpowiedz
              </a>
              <button onClick={() => deleteLead(selected.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-[#1a2040] rounded-xl p-4">
              <User size={18} className="text-violet-400 flex-shrink-0" />
              <div><div className="text-xs text-slate-400">Imię i nazwisko</div><div className="text-white text-sm font-medium">{selected.name}</div></div>
            </div>
            <div className="flex items-center gap-3 bg-[#1a2040] rounded-xl p-4">
              <Mail size={18} className="text-violet-400 flex-shrink-0" />
              <div><div className="text-xs text-slate-400">Email</div><div className="text-white text-sm font-medium break-all">{selected.email}</div></div>
            </div>
            <div className="flex items-center gap-3 bg-[#1a2040] rounded-xl p-4">
              <Building size={18} className="text-violet-400 flex-shrink-0" />
              <div><div className="text-xs text-slate-400">Firma</div><div className="text-white text-sm font-medium">{selected.company || '—'}</div></div>
            </div>
          </div>

          {selected.type === 'demo' && selected.demoDate && (
            <div className="flex items-center gap-3 bg-amber-600/10 border border-amber-600/20 rounded-xl p-4">
              <Calendar size={18} className="text-amber-400 flex-shrink-0" />
              <div><div className="text-xs text-amber-400">Termin demo</div><div className="text-white text-sm font-medium">{selected.demoDate}</div></div>
            </div>
          )}

          <div>
            <div className="text-xs text-slate-400 mb-2">Temat</div>
            <div className="text-white text-sm font-medium">{selected.subject}</div>
          </div>

          {selected.message && (
            <div>
              <div className="text-xs text-slate-400 mb-2">Wiadomość</div>
              <div className="bg-[#1a2040] rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</div>
            </div>
          )}

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Clock size={12} /> Otrzymano: {formatDate(selected.receivedAt)}
          </div>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="bg-[#131837] border border-white/10 rounded-2xl p-12 text-center">
              <Inbox size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Brak zapytań w tej kategorii</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => { setSelected(lead); updateLead(lead.id, { read: true }); }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all hover:border-white/20 ${lead.read ? 'bg-[#131837] border-white/5' : 'bg-[#131837] border-violet-600/30 shadow-sm shadow-violet-900/20'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${lead.type === 'demo' ? 'bg-amber-600/20 text-amber-400' : 'bg-violet-600/20 text-violet-400'}`}>
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-sm font-semibold">{lead.name}</span>
                        {!lead.read && <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />}
                        {lead.starred && <Star size={12} className="text-amber-400 fill-amber-400" />}
                        <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${lead.type === 'demo' ? 'bg-amber-600/20 text-amber-400' : 'bg-violet-600/20 text-violet-400'}`}>
                          {lead.type === 'demo' ? 'Demo' : 'Kontakt'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs mb-1">{lead.email} · {lead.company}</div>
                      <div className="text-slate-300 text-xs truncate">{lead.subject}: {lead.message?.slice(0, 80)}</div>
                    </div>
                    <div className="text-slate-500 text-xs flex-shrink-0">{formatDate(lead.receivedAt)}</div>
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
// Analytics (Umami embed)
// ─────────────────────────────────────────────
function AdminAnalytics({ config }: { config: SiteConfig }) {
  const UMAMI_URL = 'https://cloud.umami.is';
  const UMAMI_WEBSITE_ID = '14e22989-abe7-492b-9803-1df3459b3460';

  const [customUrl, setCustomUrl] = useState(UMAMI_URL);
  const [customId, setCustomId] = useState(UMAMI_WEBSITE_ID);
  const [showSettings, setShowSettings] = useState(false);
  const [activeEmbed, setActiveEmbed] = useState({ url: UMAMI_URL, id: UMAMI_WEBSITE_ID });

  // Share URL for Umami public dashboard
  const shareUrl = `${activeEmbed.url}/share/${activeEmbed.id}/hrly.pl`;

  // Direct stats URL (Umami cloud dashboard)
  const dashboardUrl = `${activeEmbed.url}/websites/${activeEmbed.id}`;

  const applySettings = () => {
    setActiveEmbed({ url: customUrl, id: customId });
    setShowSettings(false);
  };

  void config; // satisfy linter

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analityka</h2>
          <p className="text-slate-400 text-sm">Umami Analytics — prywatna, bez ciasteczek, RODO-compliant</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs bg-[#131837] border border-white/10 px-4 py-2 rounded-xl transition-colors"
        >
          <Settings size={14} /> Ustawienia
        </button>
      </div>

      {/* Status banner */}
      <div className="flex items-start gap-4 p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-2xl">
        <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={16} className="text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-emerald-300 text-sm font-medium">Śledzenie aktywne</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Skrypt Umami jest zainstalowany na stronie · Website ID: <code className="text-emerald-400">{activeEmbed.id}</code>
          </p>
        </div>
        <a
          href="https://cloud.umami.is"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-600/10 border border-violet-600/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Otwórz Umami <ExternalLink size={12} />
        </a>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Settings size={16} className="text-violet-400" /> Konfiguracja połączenia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">URL instancji Umami</label>
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://cloud.umami.is"
                className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Website ID</label>
              <input
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <button onClick={applySettings} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Save size={15} /> Zastosuj
          </button>
        </div>
      )}

      {/* Quick stats links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Otwórz pełny dashboard', href: dashboardUrl, icon: <BarChart3 size={18} />, color: 'violet' },
          { label: 'Publiczny raport', href: shareUrl, icon: <ExternalLink size={18} />, color: 'sky' },
          { label: 'Umami Cloud Panel', href: 'https://cloud.umami.is', icon: <Activity size={18} />, color: 'emerald' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener"
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
              link.color === 'violet' ? 'bg-violet-600/10 border-violet-600/20 text-violet-300 hover:bg-violet-600/20' :
              link.color === 'sky' ? 'bg-sky-600/10 border-sky-600/20 text-sky-300 hover:bg-sky-600/20' :
              'bg-emerald-600/10 border-emerald-600/20 text-emerald-300 hover:bg-emerald-600/20'
            }`}
          >
            {link.icon}
            <span className="text-sm font-medium">{link.label}</span>
          </a>
        ))}
      </div>

      {/* Embedded Umami dashboard */}
      <div className="bg-[#131837] border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white text-sm font-medium flex items-center gap-2">
            <Activity size={16} className="text-violet-400" /> Dashboard Umami — hrly.pl
          </span>
          <a href={shareUrl} target="_blank" rel="noopener" className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1">
            Pełny ekran <ExternalLink size={12} />
          </a>
        </div>
        <iframe
          src={shareUrl}
          className="w-full bg-white"
          style={{ height: '640px', border: 'none' }}
          title="Umami Analytics — hrly.pl"
        />
      </div>

      {/* Tracking code info */}
      <div className="bg-[#131837] border border-white/10 rounded-2xl p-5">
        <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
          <Hash size={14} className="text-violet-400" /> Zainstalowany kod śledzący
        </h4>
        <code className="text-xs text-emerald-300 bg-[#1a2040] block p-4 rounded-xl leading-relaxed break-all">
          {`<script defer src="https://cloud.umami.is/script.js" data-website-id="${activeEmbed.id}"></script>`}
        </code>
        <p className="text-slate-500 text-xs mt-2">Skrypt jest zainstalowany w <code className="text-slate-400">index.html</code> — dane zbierają się automatycznie.</p>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// Settings
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
    showToast('Dane wyeksportowane!');
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
        showToast('Błąd importu pliku JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (window.confirm('Czy na pewno chcesz zresetować wszystkie dane CMS do wartości domyślnych? Ta operacja jest nieodwracalna.')) {
      localStorage.removeItem('hrly_site_config');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Ustawienia</h2>
        <p className="text-slate-400 text-sm">Konfiguracja panelu i eksport danych</p>
      </div>

      <div className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2"><Globe size={18} className="text-violet-400" /> Ustawienia globalne</h3>
        {[
          ['Nazwa strony', 'siteName'],
          ['Tagline', 'tagline'],
          ['Główny link CTA (np. app.hrly.pl)', 'primaryCTALink'],
          ['Tekst głównego CTA', 'primaryCTAText'],
        ].map(([label, key]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
            <input
              value={(global as Record<string, string>)[key] || ''}
              onChange={(e) => setGlobal({ ...global, [key]: e.target.value })}
              className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
            />
          </div>
        ))}
        <button onClick={() => { updateSection('global', global); showToast('Ustawienia zapisane!'); }} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Save size={15} /> Zapisz ustawienia globalne
        </button>
      </div>

      <div className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2"><Image size={18} className="text-violet-400" /> Zdjęcie wyróżniające stronę (Open Graph) & Favicon</h3>
        <p className="text-slate-400 text-xs">Ustawiono automatycznie spakowany obraz udostępniania w social media (1200x630px) oraz ikonę 📊 witryny.</p>
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#111430] p-4 rounded-xl border border-white/5">
          <div className="w-32 aspect-[1.91/1] rounded overflow-hidden bg-slate-800 flex-shrink-0 relative border border-white/10">
            <img src="/hrly_og_banner.png" alt="Podgląd og:image" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Adres URL obrazu społecznościowego</div>
            <code className="text-xs text-violet-300 block truncate mt-1 font-mono">https://hrly.pl/hrly_og_banner.png</code>
            <p className="text-slate-500 text-[10px] mt-1.5">
              ✓ Obrazek jest spakowany w katalogu publicznym i wczytywany przy publikacji na Vercelu.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2"><Key size={18} className="text-violet-400" /> Hasło admina</h3>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Nowe hasło</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={global.adminPassword}
              onChange={(e) => setGlobal({ ...global, adminPassword: e.target.value })}
              className="w-full bg-[#1a2040] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 pr-12"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button onClick={() => { updateSection('global', global); showToast('Hasło zmienione!'); }} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Key size={15} /> Zmień hasło
        </button>
      </div>

      <div className="bg-[#131837] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2"><Download size={18} className="text-violet-400" /> Backup i import danych</h3>
        <p className="text-slate-400 text-sm">Wszystkie dane CMS są zapisane w localStorage. Eksportuj regularnie jako backup.</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportData} className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/30 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Download size={15} /> Eksportuj dane JSON
          </button>
          <label className="flex items-center gap-2 bg-[#1a2040] border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer">
            <Upload size={15} /> Importuj dane JSON
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-[#131837] border border-red-600/20 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2 text-red-400"><AlertCircle size={18} /> Strefa niebezpieczna</h3>
        <p className="text-slate-400 text-sm">Reset przywróci wszystkie dane CMS do wartości domyślnych. Blogposty i zapytania zostaną usunięte.</p>
        <button onClick={resetData} className="flex items-center gap-2 bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Trash2 size={15} /> Zresetuj wszystkie dane CMS
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main AdminPanel
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
    <div className="flex h-screen bg-[#0B0F2C] overflow-hidden">
      <Sidebar
        active={section}
        setActive={setSection}
        onLogout={logout}
        collapsed={collapsed}
        unreadLeads={unreadLeads}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-[#0e1330]">
          <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <div className="flex-1" />
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ExternalLink size={15} /> Podgląd strony
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {section === 'dashboard' && <AdminDashboard config={config} setSection={setSection} />}
          {section === 'cms' && <AdminCMSEditor config={config} updateSection={updateSectionTyped} />}
          {section === 'blog' && <AdminBlogEditor config={config} updateSection={updateSectionTyped} />}
          {section === 'leads' && <AdminLeadsInbox config={config} updateSection={updateSectionTyped} />}
          {section === 'analytics' && <AdminAnalytics config={config} />}
          {section === 'settings' && <AdminSettings config={config} updateSection={updateSectionTyped} />}
        </div>
      </div>
    </div>
  );
}
