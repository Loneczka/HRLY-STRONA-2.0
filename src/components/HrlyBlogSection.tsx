import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Calendar, ChevronRight, Send, CircleCheck as CheckCircle, SquarePen as PenSquare } from 'lucide-react';
import Button from './Button';
import SectionLabel from './SectionLabel';
import { loadConfig, addSubscriber, type BlogPost } from '../hooks/useSiteConfig';
import { sanitizeHtml } from '../lib/sanitize';

// ── Image fallback ────────────────────────────────────────────
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1552581230-c01bc9148c5b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1531535934202-f022eed250c2?auto=format&fit=crop&w=600&q=80",
];

const getArticleImage = (post: BlogPost, idx: number) => {
  if (post.imageUrl) return post.imageUrl;
  return FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
};

// ── Markdown → HTML (for article new tab) ─────────────────────
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseInlineToHtml(text: string): string {
  const regex = /(!?\[[^\]]*\]\([^)]*\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const tokens = text.split(regex);
  return tokens.map((token) => {
    if (token.startsWith('![') && token.includes('](')) {
      const alt = (token.match(/!\[([^\]]*)\]/) || [])[1] || '';
      const url = (token.match(/\(([^)]*)\)/) || [])[1] || '';
      return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" referrerpolicy="no-referrer" />`;
    } else if (token.startsWith('[') && token.includes('](')) {
      const label = (token.match(/\[([^\]]*)\]/) || [])[1] || '';
      const url = (token.match(/\(([^)]*)\)/) || [])[1] || '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    } else if (token.startsWith('**') && token.endsWith('**')) {
      return `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
    } else if (token.startsWith('*') && token.endsWith('*')) {
      return `<em>${escapeHtml(token.slice(1, -1))}</em>`;
    }
    return escapeHtml(token);
  }).join('');
}

function markdownToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) { out.push(`<ul>${list.join('')}</ul>`); list = []; }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('## ')) { flush(); out.push(`<h2>${parseInlineToHtml(line.slice(3))}</h2>`); }
    else if (line.startsWith('### ')) { flush(); out.push(`<h3>${parseInlineToHtml(line.slice(4))}</h3>`); }
    else if (line.startsWith('- ') || line.startsWith('* ')) { list.push(`<li>${parseInlineToHtml(line.slice(2))}</li>`); }
    else if (line.startsWith('> ')) { flush(); out.push(`<blockquote>${parseInlineToHtml(line.slice(2))}</blockquote>`); }
    else if (line === '') { flush(); }
    else { flush(); out.push(`<p>${parseInlineToHtml(line)}</p>`); }
  }
  flush();
  return out.join('\n');
}

function openArticleInNewTab(post: BlogPost) {
  const win = window.open('', '_blank');
  if (!win) return;
  const title = escapeHtml(post.seoTitle || post.title);
  const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · HRly</title>
<meta name="description" content="${escapeHtml(post.seoDescription || post.excerpt)}" />
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #FBFAF8; color: #55506E; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 80px; }
  .brand { font-weight: 800; font-size: 20px; letter-spacing: -0.03em; color: #14183D; text-transform: lowercase; margin-bottom: 28px; display: inline-block; text-decoration: none; }
  .cover { width: 100%; aspect-ratio: 21/9; object-fit: cover; border-radius: 18px; border: 1px solid #EFEAE1; margin: 8px 0 24px; }
  .meta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 12px; color: #A39AB4; margin-bottom: 12px; }
  .cat { text-transform: uppercase; font-weight: 700; letter-spacing: .12em; color: #3B2F8C; background: #E3DEEE; padding: 3px 10px; border-radius: 999px; font-size: 10px; }
  h1 { font-size: clamp(26px, 5vw, 38px); font-weight: 800; letter-spacing: -0.03em; color: #14183D; line-height: 1.2; margin: 0 0 16px; }
  h2 { font-size: 22px; font-weight: 700; color: #14183D; margin: 36px 0 10px; }
  h3 { font-size: 17px; font-weight: 600; color: #14183D; margin: 28px 0 8px; }
  p { margin: 0 0 16px; }
  ul { padding-left: 20px; margin: 0 0 16px; }
  li { margin-bottom: 6px; }
  blockquote { border-left: 4px solid #3B2F8C; margin: 24px 0; padding: 12px 20px; background: #F0EDFA; border-radius: 0 8px 8px 0; font-style: italic; }
  img { max-width: 100%; border-radius: 12px; margin: 16px 0; }
  a { color: #3B2F8C; }
  strong { color: #14183D; }
  .tag { display: inline-block; background: #E3DEEE; color: #3B2F8C; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; margin: 2px; }
</style>
</head>
<body>
<div class="wrap">
  <a class="brand" href="/" target="_self">hrly</a>
  ${post.imageUrl ? `<img class="cover" src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" loading="eager" decoding="async" />` : ''}
  <div class="meta">
    <span class="cat">${escapeHtml(post.category)}</span>
    <span>✍️ ${escapeHtml(post.author)}</span>
    <span>📅 ${new Date(post.publishedAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
  </div>
  <h1>${escapeHtml(post.title)}</h1>
  <p style="font-size:18px;color:#6B6484;margin-bottom:32px;">${escapeHtml(post.excerpt)}</p>
  ${sanitizeHtml(post.content)}
  <div style="margin-top:32px;">
    ${(post.tags || []).map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}
  </div>
  <hr style="margin:40px 0;border:none;border-top:1px solid #EFEAE1;" />
  <p style="font-size:13px;color:#A39AB4;">© ${new Date().getFullYear()} HRly. Wszelkie prawa zastrzeżone.</p>
</div>
</body>
</html>`;
  win.document.write(html);
  win.document.close();
}

// ── Newsletter Component ──────────────────────────────────────
function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    addSubscriber(email, 'Blog HRly');
    setSent(true);
    setLoading(false);
  };

  return (
    /* FAZA 8: gradient zostaje jako background-image, ale `bg-text-dark` daje realny
       background-color — bez niego audyt kontrastu widzi biel strony pod tekstem. */
    <div className="section-dark mt-16 rounded-3xl px-6 py-12 sm:px-10 text-center bg-text-dark bg-gradient-to-br from-text-dark to-indigo-primary">
      <div aria-hidden="true" className="type-h2 text-on-dark-body mb-3">📬</div>
      <h2 className="type-h2 font-display text-white">
        Bądź na bieżąco z HR
      </h2>
      <p className="type-body-lg text-on-dark-body mt-2 mb-7">
        Najnowsze analizy, trendy i wskazówki prosto na Twój email.
      </p>
      {sent ? (
        <div className="flex items-center justify-center gap-2 type-body font-semibold text-success-on-dark">
          <CheckCircle size={20} aria-hidden="true" />
          <span>Zapisano! Sprawdź skrzynkę.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-[400px] mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            aria-label="Twój adres e-mail"
            required
            className="flex-1 min-w-0 h-10 px-4 rounded-xl border border-white/30 bg-white/15 text-white type-body-sm placeholder:text-on-dark-muted"
          />
          <Button
            type="submit"
            variant="primary"
            tone="dark"
            size="md"
            aria-disabled={loading}
            icon={loading ? undefined : <Send />}
          >
            {loading ? '...' : 'Zapisz'}
          </Button>
        </form>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function HrlyBlogSection() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Wszystkie');

  // Load published posts from CMS (localStorage)
  const allPosts = useMemo(() => {
    const config = loadConfig();
    return (config.blogPosts || [])
      .filter((p) => p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, []);

  // Dynamic categories from CMS posts
  const categories = useMemo(() => {
    const cats = ['Wszystkie', ...Array.from(new Set(allPosts.map((p) => p.category).filter(Boolean)))];
    return cats;
  }, [allPosts]);

  const filtered = useMemo(() => {
    return allPosts.filter((p) => {
      const matchesCat = activeCategory === 'Wszystkie' || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [allPosts, activeCategory, search]);

  const handleCardClick = (post: BlogPost) => {
    openArticleInNewTab(post);
  };

  // Empty state
  if (allPosts.length === 0) {
    return (
      <section id="blog" className="py-20 bg-neutral-bg">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <SectionLabel number="01" className="mb-5">Baza wiedzy HR</SectionLabel>
          <h1 className="type-display font-display text-text-dark">
            Artykuły &amp; Analizy
          </h1>
          <p className="type-body-lg text-muted-purple mt-4 mb-12">
            Wkrótce tutaj pojawią się artykuły HR i analizy rynkowe.
          </p>
          <div className="flex flex-col items-center gap-3 p-12 bg-neutral-surface rounded-3xl border-2 border-dashed border-primary-light text-muted-indigo">
            <PenSquare size={40} aria-hidden="true" />
            <p className="type-body font-semibold text-text-dark">Brak opublikowanych artykułów</p>
            <p className="type-body-sm text-muted-purple">Dodaj artykuł w panelu administracyjnym</p>
          </div>
          <NewsletterBox />
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 bg-neutral-bg">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <SectionLabel number="01" className="mb-5">Baza wiedzy HR</SectionLabel>
          <h1 className="type-display font-display text-text-dark">
            Artykuły &amp; Analizy
          </h1>
          <p className="type-body-lg text-muted-purple max-w-[560px] mx-auto mt-4">
            Praktyczna wiedza o zarządzaniu ludźmi, analityce HR i trendach rynkowych.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-indigo"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj artykułów..."
              aria-label="Szukaj artykułów"
              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-border-indigo bg-neutral-surface type-body-sm text-text-dark placeholder:text-muted-indigo"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'secondary' : 'ghost'}
                size="md"
                aria-pressed={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-purple">
            <BookOpen size={40} aria-hidden="true" className="mx-auto mb-3 opacity-50" />
            <p className="type-body">Brak artykułów dla wybranych filtrów.</p>
          </div>
        ) : (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
            {filtered.map((post, idx) => (
              <article
                key={post.id}
                onClick={() => handleCardClick(post)}
                className="bg-neutral-surface rounded-2xl border border-border-indigo overflow-hidden cursor-pointer shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col"
              >
                {/* Cover image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getArticleImage(post, idx)}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover block"
                  />
                  <span className="absolute top-3 left-3 bg-indigo-primary text-white type-label font-mono uppercase px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="type-h3 font-display text-text-dark mb-2">
                    {post.title}
                  </h3>
                  <p className="type-body-sm text-muted-purple mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-auto type-label font-mono">
                    <span className="flex items-center gap-1.5 text-muted-purple normal-case">
                      <Calendar size={12} aria-hidden="true" />
                      {new Date(post.publishedAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-primary font-bold">
                      Czytaj dalej <ChevronRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Newsletter */}
        <NewsletterBox />
      </div>
    </section>
  );
}
