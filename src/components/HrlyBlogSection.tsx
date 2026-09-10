import React, { useState, useMemo, useEffect } from 'react';
import { Search, BookOpen, Calendar, ChevronRight, ArrowLeft, Send, CircleCheck as CheckCircle, SquarePen as PenSquare, User } from 'lucide-react';
import Button from './Button';
import SectionLabel from './SectionLabel';
import { loadConfig, addSubscriber, type BlogPost } from '../hooks/useSiteConfig';
import { sanitizeHtml } from '../lib/sanitize';

// ── Image fallback ────────────────────────────────────────────
// Okładki importowane z WordPressa wskazują na /wp/wp-content/uploads/…, którego nie ma już na serwerze.
// Gdy obrazek się nie załaduje, karta dostaje lokalną, brandową okładkę zastępczą (public/images/cover-*.svg) — bez zewnętrznych żądań.
const FALLBACK_IMAGES = ['/images/cover-1.svg', '/images/cover-2.svg', '/images/cover-3.svg'];

const fallbackFor = (idx: number) => FALLBACK_IMAGES[Math.abs(idx) % FALLBACK_IMAGES.length];

const getArticleImage = (post: BlogPost, idx: number) => post.imageUrl || fallbackFor(idx);

const swapToFallback = (idx: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fallback === '1') return;
  img.dataset.fallback = '1';
  img.src = fallbackFor(idx);
};

// Tytuły z importu WordPress mają czasem podwójnie zakodowane encje („&amp;#8211;”).
const decodeEntities = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&quot;/g, '"');

const formatDate = (iso: string, style: 'short' | 'long' = 'short') =>
  new Date(iso).toLocaleDateString('pl-PL', { year: 'numeric', month: style, day: 'numeric' });

// ── Article view (in-app, replaces the old window.open popup) ──
function ArticleView({ post, index, onBack }: { post: BlogPost; index: number; onBack: () => void }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${decodeEntities(post.seoTitle || post.title)} · HRly`;
    window.scrollTo({ top: 0 });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => { document.title = previousTitle; window.removeEventListener('keydown', onKey); };
  }, [post, onBack]);

  const html = useMemo(() => sanitizeHtml(post.content), [post.content]);

  return (
    <section id="blog" className="py-12 sm:py-16 bg-neutral-bg">
      <article className="max-w-[800px] mx-auto px-6">
        <div className="mb-8">
          <Button variant="ghost" size="md" icon={undefined} onClick={onBack} className="-ml-5">
            <span className="inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" aria-hidden="true" />Wszystkie artykuły</span>
          </Button>
        </div>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="bg-primary-light/60 text-indigo-primary border border-border-indigo/35 type-label font-mono uppercase px-3 py-1.5 rounded-full">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 type-label font-mono text-muted-purple normal-case">
              <Calendar size={12} aria-hidden="true" />
              {formatDate(post.publishedAt, 'long')}
            </span>
            {post.author ? (
              <span className="flex items-center gap-1.5 type-label font-mono text-muted-purple normal-case">
                <User size={12} aria-hidden="true" />
                {post.author}
              </span>
            ) : null}
          </div>
          <h1 className="type-h2 font-display text-text-dark">{decodeEntities(post.title)}</h1>
          {post.excerpt ? <p className="type-body-lg text-muted-purple mt-4">{decodeEntities(post.excerpt)}</p> : null}
        </header>

        <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border border-border-soft mb-10 bg-primary-faint">
          <img
            src={getArticleImage(post, index)}
            alt=""
            decoding="async"
            onError={swapToFallback(index)}
            className="w-full h-full object-cover block"
          />
        </div>

        <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

        {post.tags && post.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2 mt-10" aria-label="Tagi">
            {post.tags.map((t) => (
              <li key={t} className="bg-primary-light/60 text-indigo-primary type-label font-mono px-3 py-1.5 rounded-full">#{t}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-12 pt-8 border-t border-border-soft">
          <Button variant="secondary" size="md" onClick={onBack}>
            <span className="inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" aria-hidden="true" />Wróć do bazy wiedzy</span>
          </Button>
        </div>
      </article>
    </section>
  );
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
  const [openPost, setOpenPost] = useState<{ post: BlogPost; index: number } | null>(null);

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

  const closeArticle = React.useCallback(() => setOpenPost(null), []);

  if (openPost) {
    return <ArticleView post={openPost.post} index={openPost.index} onBack={closeArticle} />;
  }

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
                className="bg-neutral-surface rounded-2xl border border-border-indigo overflow-hidden shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col relative"
              >
                {/* Cover image */}
                <div className="relative aspect-video overflow-hidden bg-primary-faint">
                  <img
                    src={getArticleImage(post, idx)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={swapToFallback(idx)}
                    className="w-full h-full object-cover block"
                  />
                  <span className="absolute top-3 left-3 bg-indigo-primary text-white type-label font-mono uppercase px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="type-h3 font-display text-text-dark mb-2">
                    {/* Cała karta klikalna przez rozciągnięty link; sam <a> ma wysokość tytułu. */}
                    <a
                      href="#blog"
                      onClick={(e) => { e.preventDefault(); setOpenPost({ post, index: idx }); }}
                      className="after:absolute after:inset-0 after:content-[''] hover:text-indigo-primary transition-colors"
                    >
                      {decodeEntities(post.title)}
                    </a>
                  </h3>
                  <p className="type-body-sm text-muted-purple mb-4 line-clamp-3">
                    {decodeEntities(post.excerpt)}
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-auto type-label font-mono">
                    <span className="flex items-center gap-1.5 text-muted-purple normal-case">
                      <Calendar size={12} aria-hidden="true" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-primary font-bold" aria-hidden="true">
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
