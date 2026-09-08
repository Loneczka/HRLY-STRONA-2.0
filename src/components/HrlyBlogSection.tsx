import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Clock, Calendar, ChevronRight, Send, CircleCheck as CheckCircle, Mail, SquarePen as PenSquare } from 'lucide-react';
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
    <div className="section-dark" style={{
      background: 'linear-gradient(135deg, #14183D 0%, #3B2F8C 100%)',
      borderRadius: '24px',
      padding: '48px 40px',
      color: '#fff',
      textAlign: 'center',
      marginTop: '64px',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
      <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Bądź na bieżąco z HR
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 28px', fontSize: '15px' }}>
        Najnowsze analizy, trendy i wskazówki prosto na Twój email.
      </p>
      {sent ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#A7F3D0', fontWeight: 600 }}>
          <CheckCircle size={20} />
          <span>Zapisano! Sprawdź skrzynkę.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            required
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '12px',
              border: 'none', fontSize: '14px', background: 'rgba(255,255,255,0.15)',
              color: '#fff',
            }}
          />
          <button type="submit" disabled={loading} style={{
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: '#F4A574', color: '#14183D', fontWeight: 700,
            fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {loading ? '...' : <><Send size={14} style={{ marginRight: 6, display: 'inline' }} />Zapisz</>}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function HrlyBlogSection() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Wszystkie');
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

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
      <section id="blog" style={{ padding: '80px 0', background: '#FBFAF8' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', background: '#E3DEEE', color: '#3B2F8C',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '5px 14px', borderRadius: '999px', marginBottom: '20px',
          }}>
            Baza wiedzy HR
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#14183D', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Artykuły & Analizy
          </h1>
          <p style={{ color: '#6B6484', fontSize: '16px', marginBottom: '48px' }}>
            Wkrótce tutaj pojawią się artykuły HR i analizy rynkowe.
          </p>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            padding: '48px', background: '#fff', borderRadius: '24px',
            border: '2px dashed #E3DEEE', color: '#A39AB4',
          }}>
            <PenSquare size={40} />
            <p style={{ margin: 0, fontWeight: 600 }}>Brak opublikowanych artykułów</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Dodaj artykuł w panelu administracyjnym</p>
          </div>
          <NewsletterBox />
        </div>
      </section>
    );
  }

  return (
    <section id="blog" style={{ padding: '80px 0', background: '#FBFAF8' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            display: 'inline-block', background: '#E3DEEE', color: '#3B2F8C',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '5px 14px', borderRadius: '999px', marginBottom: '20px',
          }}>
            Baza wiedzy HR
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#14183D', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Artykuły & Analizy
          </h1>
          <p style={{ color: '#6B6484', fontSize: '16px', maxWidth: '560px', margin: '0 auto' }}>
            Praktyczna wiedza o zarządzaniu ludźmi, analityce HR i trendach rynkowych.
          </p>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A39AB4' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj artykułów..."
              style={{
                width: '100%', padding: '10px 14px 10px 40px',
                borderRadius: '12px', border: '1.5px solid #E8E3F0',
                fontSize: '14px', color: '#14183D', background: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: '999px', border: 'none',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  background: activeCategory === cat ? '#3B2F8C' : '#F0EDFA',
                  color: activeCategory === cat ? '#fff' : '#3B2F8C',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: '#A39AB4' }}>
            <BookOpen size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>Brak artykułów dla wybranych filtrów.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {filtered.map((post, idx) => (
              <article
                key={post.id}
                onClick={() => handleCardClick(post)}
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  border: '1px solid #E8E3F0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(20,24,61,0.06)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(59,47,140,0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(20,24,61,0.06)';
                }}
              >
                {/* Cover image */}
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img
                    src={getArticleImage(post, idx)}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: '#3B2F8C', color: '#fff',
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px',
                  }}>
                    {post.category}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#14183D', margin: '0 0 8px', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B6484', margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#A39AB4' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(post.publishedAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3B2F8C', fontWeight: 600 }}>
                      Czytaj dalej <ChevronRight size={14} />
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
