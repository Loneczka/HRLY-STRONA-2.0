import { useState, useEffect, useCallback } from 'react';

// ============================================================
// Types
// ============================================================
export interface HeroConfig {
  headline: string;
  subheadline: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  badge: string;
}

export interface StatsConfig {
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
}

export interface ContactConfig {
  email: string;
  phone: string;
  address: string;
  linkedIn: string;
  calendarLink: string;
}

export interface FooterConfig {
  companyDescription: string;
  linkedIn: string;
  twitter: string;
  facebook: string;
  copyright: string;
}

export interface GlobalConfig {
  siteName: string;
  tagline: string;
  primaryCTALink: string;
  primaryCTAText: string;
  adminPassword: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted: boolean;
}

// Social media post attached to a blog article
export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin';
export type SocialPostStatus = 'draft' | 'approved' | 'scheduled' | 'sent' | 'error';

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  hashtags: string;
  framework: string;
  status: SocialPostStatus;
  scheduledAt?: string;
  sentAt?: string;
  mediaUrls: string[];       // base64 images / file names attached by admin
  mediaTypes: string[];      // 'image' | 'video' | 'pdf'
  makeWebhookSent: boolean;
  webhookError?: string;
}

// Blog article managed via CMS
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  scheduledAt?: string;
  status: 'published' | 'draft' | 'scheduled';
  seoTitle: string;
  seoDescription: string;
  imageUrl?: string;
  copywritingFramework: string;
  socialPosts: SocialPost[];
}

export interface ContactLead {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  type: 'contact' | 'demo';
  demoDate?: string;
  receivedAt: string;
  read: boolean;
  starred: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
}

export interface HashtagSet {
  id: string;
  name: string;
  tags: string;
}

// Social media integration settings
export interface SocialConfig {
  makeWebhookUrl: string;
  instagramPageId: string;
  facebookPageId: string;
  linkedinPageId: string;
  savedHashtags?: HashtagSet[];
}

// Standalone scheduled social posts (not tied to a blog post)
export interface ScheduledEvent {
  id: string;
  type: 'blog' | 'social';
  title: string;
  blogPostId?: string;
  socialPostId?: string;
  platform?: SocialPlatform;
  scheduledAt: string;
  color: string;
}

export interface SiteConfig {
  global: GlobalConfig;
  hero: HeroConfig;
  stats: StatsConfig;
  contact: ContactConfig;
  footer: FooterConfig;
  pricing: PricingPlan[];
  blogPosts: BlogPost[];
  leads: ContactLead[];
  subscribers: NewsletterSubscriber[];
  social: SocialConfig;
}

// ============================================================
// Defaults
// ============================================================
export const DEFAULT_CONFIG: SiteConfig = {
  global: {
    siteName: 'HRly',
    tagline: 'Inteligentna Platforma Analityki HR',
    primaryCTALink: 'https://app.hrly.pl/signup',
    primaryCTAText: 'Wypróbuj za darmo',
    adminPassword: 'hrly2024',
  },
  hero: {
    headline: 'Zmień dane HR w strategiczne decyzje.',
    subheadline: 'HRly to inteligentna platforma analityki HR. W kilka minut przetwarza dane Twojej organizacji i zwraca gotowe rekomendacje dla biznesu, HR i menedżerów.',
    ctaPrimaryText: 'Wypróbuj za darmo →',
    ctaPrimaryLink: 'https://app.hrly.pl/signup',
    ctaSecondaryText: 'Jak to działa →',
    badge: '01 · Analityka HR z AI',
  },
  stats: {
    stat1Value: '58',
    stat1Label: 'Analizowanych czynników HR',
    stat2Value: '10×',
    stat2Label: 'Szybsze raportowanie',
    stat3Value: '+23%',
    stat3Label: 'Wzrost zaangażowania',
  },
  contact: {
    email: 'kontakt@hrly.pl',
    phone: '+48 000 000 000',
    address: 'Polska',
    linkedIn: 'https://linkedin.com/company/hrly',
    calendarLink: 'https://calendly.com/hrly',
  },
  footer: {
    companyDescription: 'Inteligentna platforma analityki HR, która zamienia dane w strategiczne decyzje i realny zysk.',
    linkedIn: 'https://linkedin.com/company/hrly',
    twitter: '#',
    facebook: '#',
    copyright: '© 2026 HRly. Wszelkie prawa zastrzeżone.',
  },
  pricing: [
    {
      id: 'starter',
      name: 'Starter',
      price: '299',
      period: 'mies.',
      description: 'Dla małych zespołów, które chcą zacząć mierzyć satysfakcję pracowników.',
      features: ['Do 50 pracowników', '3 badania / miesiąc', 'Raport zbiorczy', 'Email support'],
      ctaText: 'Zacznij za darmo',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '799',
      period: 'mies.',
      description: 'Pełna analityka HR z rekomendacjami AI i benchmarkingiem rynkowym.',
      features: ['Do 200 pracowników', 'Nieograniczone badania', 'AI Rekomendacje', 'Benchmarking rynkowy', 'Toolkit menedżera', 'Priority support'],
      ctaText: 'Wybierz Pro',
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Indywidualny',
      period: '',
      description: 'Dla dużych organizacji z zaawansowanymi potrzebami zarządzania badaniami.',
      features: ['Nieograniczona liczba pracowników', 'Dedykowany opiekun', 'Custom integracje', 'SLA 99.9%', 'SSO / SAML', 'Onboarding + szkolenia'],
      ctaText: 'Umów rozmowę',
      highlighted: false,
    },
  ],
  blogPosts: [],
  leads: [],
  subscribers: [],
  social: {
    makeWebhookUrl: 'https://hook.eu2.make.com/9ms2ito1chs8w3sa3x7kkpqgb6ynzyr0',
    instagramPageId: '',
    facebookPageId: '',
    linkedinPageId: '',
    savedHashtags: [],
  },
};

// ============================================================
// Copywriting Frameworks
// ============================================================
export const COPYWRITING_FRAMEWORKS = [
  {
    id: 'co-star',
    name: 'CO-STAR',
    description: 'Context, Objective, Style, Tone, Audience, Response — content biznesowy, artykuły, posty',
    icon: '⭐',
  },
  {
    id: 'aida',
    name: 'AIDA',
    description: 'Attention, Interest, Desire, Action — reklamy, posty sprzedażowe',
    icon: '🎯',
  },
  {
    id: 'pas',
    name: 'PAS',
    description: 'Problem, Agitate, Solution — posty o wyzwaniach HR, podkręcanie bólu',
    icon: '🔥',
  },
  {
    id: 'bab',
    name: 'BAB',
    description: 'Before, After, Bridge — storytelling, case study',
    icon: '🌉',
  },
  {
    id: 'fab',
    name: 'FAB',
    description: 'Features, Advantages, Benefits — opisy SaaS/produktu',
    icon: '💎',
  },
  {
    id: 'rtf',
    name: 'RTF',
    description: 'Role, Task, Format — szybkie posty SM, proste zadania',
    icon: '⚡',
  },
  {
    id: 'crispe',
    name: 'CRISPE',
    description: 'Context, Role, Input, Steps, Parameters, Example — złożone analizy',
    icon: '🔬',
  },
  {
    id: '4p',
    name: '4P / PPPP',
    description: 'Picture, Promise, Proof, Push — oferty, landingi, CTA',
    icon: '📣',
  },
  {
    id: 'risen',
    name: 'RISEN',
    description: 'Role, Instructions, Steps, End goal, Narrowing — automatyzacje, agenty',
    icon: '🤖',
  },
  {
    id: 'storybrand',
    name: 'StoryBrand',
    description: 'Bohater, Problem, Przewodnik, Plan, Działanie — dłuższe oferty high-ticket',
    icon: '📖',
  },
] as const;

// ============================================================
// Storage helpers
// ============================================================
const STORAGE_KEY = 'hrly_site_config';

export function loadConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return {
      global: { ...DEFAULT_CONFIG.global, ...parsed.global },
      hero: { ...DEFAULT_CONFIG.hero, ...parsed.hero },
      stats: { ...DEFAULT_CONFIG.stats, ...parsed.stats },
      contact: { ...DEFAULT_CONFIG.contact, ...parsed.contact },
      footer: { ...DEFAULT_CONFIG.footer, ...parsed.footer },
      pricing: parsed.pricing ?? DEFAULT_CONFIG.pricing,
      blogPosts: parsed.blogPosts ?? DEFAULT_CONFIG.blogPosts,
      leads: parsed.leads ?? DEFAULT_CONFIG.leads,
      subscribers: parsed.subscribers ?? DEFAULT_CONFIG.subscribers,
      social: { ...DEFAULT_CONFIG.social, ...parsed.social },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: SiteConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function addLead(lead: Omit<ContactLead, 'id' | 'receivedAt' | 'read' | 'starred'>): void {
  const config = loadConfig();
  const newLead: ContactLead = {
    ...lead,
    id: `lead_${Date.now()}`,
    receivedAt: new Date().toISOString(),
    read: false,
    starred: false,
  };
  config.leads = [newLead, ...config.leads];
  saveConfig(config);
}

export function addSubscriber(email: string, source = 'Newsletter Bazy wiedzy'): boolean {
  const config = loadConfig();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  if (config.subscribers.some((s) => s.email.toLowerCase() === normalized)) return false;
  const newSubscriber: NewsletterSubscriber = {
    id: `sub_${Date.now()}`,
    email: email.trim(),
    subscribedAt: new Date().toISOString(),
    source,
  };
  config.subscribers = [newSubscriber, ...config.subscribers];
  saveConfig(config);
  return true;
}

// ============================================================
// Hook
// ============================================================
export function useSiteConfig() {
  const [config, setConfigState] = useState<SiteConfig>(loadConfig);

  // Sync across tabs
  useEffect(() => {
    const handler = () => setConfigState(loadConfig());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const updateConfig = useCallback((updates: Partial<SiteConfig>) => {
    setConfigState((prev) => {
      const next: SiteConfig = { ...prev, ...updates };
      saveConfig(next);
      return next;
    });
  }, []);

  const updateSection = useCallback(<K extends keyof SiteConfig>(
    section: K,
    value: SiteConfig[K]
  ) => {
    setConfigState((prev) => {
      const next = { ...prev, [section]: value };
      saveConfig(next);
      return next;
    });
  }, []);

  return { config, updateConfig, updateSection };
}
