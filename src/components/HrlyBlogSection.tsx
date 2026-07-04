import React, { useState, useMemo } from 'react';
import { BLOG_ARTICLES, BlogArticle } from '../data/hrlyData';
import {
  Search, BookOpen, Clock, Calendar, ChevronRight,
  Send, CheckCircle, Mail
} from 'lucide-react';
import { SiteConfig, addSubscriber } from '../hooks/useSiteConfig';

// Exact categories from PDF Page 8 filter list
const PDF_CATEGORIES = [
  "Wszystkie", "Motywacja i zaangażowanie", "Analityka HR", "employee experience", 
  "motywacja", "rozwój liderów", "wypalenie zawodowe", "Zarządzanie talentami", 
  "rozwój kariery", "rozwój i szkolenia", "przyszłość pracy", "kultura organizacyjna"
];

const getArticleImage = (article: BlogArticle & { imageUrl?: string }) => {
  if (article.imageUrl) return article.imageUrl;
  const idStr = String(article.id);
  const numericId = parseInt(idStr.replace(/\D/g, ''), 10) || 1;
  switch (numericId % 5 + 1) {
    case 1: return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"; // Teamwork
    case 2: return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"; // Charts/Data
    case 3: return "https://images.unsplash.com/photo-1552581230-c01bc9148c5b?auto=format&fit=crop&w=600&q=80"; // Tough meeting
    case 4: return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"; // Planning/Talent
    case 5: return "https://images.unsplash.com/photo-1531535934202-f022eed250c2?auto=format&fit=crop&w=600&q=80"; // Happiness/EX
    default: return "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80"; // Future of work
  }
};

// ── New-tab article rendering (standalone HTML document) ──────────
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

function openArticleInNewTab(article: any) {
  const win = window.open('', '_blank');
  if (!win) return; // popup blocked
  const title = escapeHtml(article.title || 'Artykuł HRly');
  const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · HRly</title>
<meta name="description" content="${escapeHtml(article.summary || '')}" />
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #FBFAF8; color: #55506E; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 80px; }
  .brand { font-weight: 800; font-size: 20px; letter-spacing: -0.03em; color: #14183D; text-transform: lowercase; margin-bottom: 28px; display: inline-block; text-decoration: none; }
  .cover { width: 100%; aspect-ratio: 21/9; object-fit: cover; border-radius: 18px; border: 1px solid #EFEAE1; margin: 8px 0 24px; }
  .meta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 12px; color: #A39AB4; margin-bottom: 12px; }
  .cat { text-transform: uppercase; font-weight: 700; letter-spacing: .12em; color: #3B2F8C; background: #E3DEEE; padding: 3px 10px; border-radius: 999px; font-size: 10px; }
  h1 { font-size: clamp(26px, 5vw, 38px); line-height: 1.12; color: #14183D; letter-spacing: -0.02em; margin: 0 0 18px; }
  .lead { background: rgba(244,241,236,.7); border-left: 4px solid #F4A574; padding: 14px 18px; border-radius: 0 12px 12px 0; font-weight: 700; color: #14183D; font-style: italic; margin: 0 0 28px; }
  .content h2 { font-size: 22px; color: #14183D; margin: 34px 0 14px; padding-bottom: 8px; border-bottom: 1px solid #EFEAE1; }
  .content h3 { font-size: 18px; color: #14183D; margin: 26px 0 10px; }
  .content p { margin: 16px 0; }
  .content ul { padding-left: 22px; margin: 16px 0; }
  .content li { margin: 6px 0; }
  .content blockquote { border-left: 4px solid #F4A574; background: rgba(244,241,236,.6); padding: 12px 18px; border-radius: 0 14px 14px 0; font-style: italic; margin: 20px 0; }
  .content a { color: #3B2F8C; font-weight: 700; }
  .content img { max-width: 100%; height: auto; border-radius: 14px; border: 1px solid #EFEAE1; margin: 20px auto; display: block; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #EFEAE1; font-size: 11px; color: #A39AB4; }
  .cta { display: inline-block; margin-top: 22px; background: #3B2F8C; color: #fff; text-decoration: none; font-weight: 700; padding: 12px 22px; border-radius: 12px; font-size: 14px; }
</style>
</head>
<body>
  <article class="wrap">
    <a class="brand" href="https://hrly.pl/">hrly</a>
    <img class="cover" src="${escapeHtml(getArticleImage(article))}" alt="${title}" referrerpolicy="no-referrer" />
    <div class="meta">
      <span class="cat">${escapeHtml(article.category || '')}</span>
      <span>${escapeHtml(article.readTime || '')}</span>
      <span>${escapeHtml(article.publishDate || '')}</span>
    </div>
    <h1>${title}</h1>
    ${article.summary ? `<p class="lead">${escapeHtml(article.summary)}</p>` : ''}
    <div class="content">${markdownToHtml(article.content || '')}</div>
    <a class="cta" href="https://hrly.pl/#contact">Umów demo HRly →</a>
    <p class="footer">Artykuł udostępniony bezpłatnie w ramach bazy wiedzy HRly. Kopiowanie i dystrybucja bez podania źródła (hrly.pl) zastrzeżona przez HRLY Sp. z o.o.</p>
  </article>
</body>
</html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

export interface HrlyBlogSectionProps {
  onNavigate?: (tab: string) => void;
  config?: SiteConfig;
}

export const HrlyBlogSection: React.FC<HrlyBlogSectionProps> = ({ onNavigate, config }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const allArticles = useMemo(() => {
    const dynamicArticles = (config?.blogPosts || [])
      .filter(post => post.status === 'published')
      .map(post => ({
        id: post.id,
        title: post.title,
        category: post.category,
        summary: post.excerpt || post.title,
        content: post.content,
        readTime: `${Math.ceil(post.content.split(/\s+/).length / 200) || 3} min czytania`,
        publishDate: post.publishedAt ? post.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        imageUrl: post.imageUrl
      }));
    return [...dynamicArticles, ...BLOG_ARTICLES];
  }, [config?.blogPosts]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === "Wszystkie") {
        return matchesSearch;
      }
      
      const matchesCategory = 
        article.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
      return matchesSearch && matchesCategory;
    });
  }, [allArticles, searchQuery, selectedCategory]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() === "") return;
    // Persist the e-mail so it shows up in the CMS "Newsletter" tab
    addSubscriber(newsletterEmail);
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <div className="space-y-8">
      
      {/* Premium Editorial Blog Hero */}
      <div className="relative rounded-[32px] border border-[#C4BBDE]/55 bg-gradient-to-tr from-[#F4F1EC] via-[#FBFAF8] to-[#FFFFFF] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xl bg-[linear-gradient(to_right,rgba(196,187,222,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,187,222,0.1)_1px,transparent_1px)] bg-[size:24px_24px]">
        {/* Dynamic Background Glowing Orbs */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#F4A574]/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-[#3B2F8C]/5 rounded-full blur-3xl pointer-events-none -mb-32" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Inspiring copy */}
          <div className="lg:col-span-7 space-y-5 text-left flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] tracking-widest font-extrabold uppercase bg-[#E3DEEE]/85 text-[#3B2F8C] px-3.5 py-1.5 rounded-full border border-[#C4BBDE]/60 shadow-xs leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4A574] animate-pulse" />
              SZCZERA STRONA PRACY • WIEDZA
            </span>
            
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] text-[#14183D] uppercase tracking-tight">
              Baza wiedzy <br />
              <span className="text-[#3B2F8C]">HRly</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed max-w-xl">
              Poznaj najnowsze trendy rynkowe, twarde dane o zaangażowaniu i gotowe scenariusze wdrożeniowe. Tworzymy merytoryczne artykuły dla menedżerów, liderów i pasjonatów HR, którzy chcą realnie usprawniać swoje organizacje.
            </p>

            {/* Small badge group for metrics/credibility */}
            <div className="flex flex-wrap gap-3 pt-2 text-[#3B2F8C] font-mono text-[9.5px] uppercase font-bold">
              <span className="flex items-center gap-1 bg-white/80 border border-[#C4BBDE]/40 px-2.5 py-1 rounded-lg shadow-2xs">
                ✓ 0% Lania Wody
              </span>
              <span className="flex items-center gap-1 bg-white/80 border border-[#C4BBDE]/40 px-2.5 py-1 rounded-lg shadow-2xs">
                ✓ 58 Mierzonych Wskaźników
              </span>
              <span className="flex items-center gap-1 bg-white/80 border border-[#C4BBDE]/40 px-2.5 py-1 rounded-lg shadow-2xs">
                ✓ Gotowe Scenariusze
              </span>
            </div>
          </div>

          {/* Right Column: Premium Newsletter Signup Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 border border-[#C4BBDE]/60 p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-lg backdrop-blur-xs flex flex-col justify-center">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#3B2F8C]/10 rounded-xl text-[#3B2F8C] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-[#14183D] uppercase tracking-tight leading-none">
                      Newsletter HRly
                    </h3>
                    <p className="text-[9.5px] text-[#6A5E8C] font-mono uppercase font-bold tracking-wider mt-1">
                      Twarde dane i mądre rady
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-[#55506E] leading-relaxed">
                  Zapisz się, aby otrzymywać merytoryczne analizy rynkowe, twarde wskaźniki i gotowe scenariusze prosto na skrzynkę pocztową. Zero spamu.
                </p>

                {!newsletterSubscribed ? (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3 pt-1">
                    <div>
                      <label className="text-[9.5px] font-bold text-[#6A5E8C] uppercase tracking-wider block mb-1">Twój e-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="np. monika@twojafirma.pl"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full text-xs bg-[#FBFAF8] border border-[#C4BBDE]/40 rounded-xl px-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:outline-none placeholder-[#A39AB4]/70"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#3B2F8C] hover:bg-[#231B5E] text-white rounded-xl text-xs font-bold tracking-tight shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono"
                    >
                      <span>Zapisz się bezpłatnie</span>
                      <Send className="w-3.5 h-3.5 text-[#F4A574]" />
                    </button>
                    <p className="text-[9px] text-[#6A5E8C] text-center leading-normal">
                      Bezpieczne przetwarzanie danych zgodnie z RODO.
                    </p>
                  </form>
                ) : (
                  <div className="bg-[#D1FAE5]/60 border border-[#047857]/20 text-[#047857] p-5 rounded-xl text-center space-y-2 animate-fade-in">
                    <CheckCircle className="w-8 h-8 mx-auto text-[#047857]" />
                    <p className="text-xs font-bold">Dziękujemy za zapis!</p>
                    <p className="text-[10px] text-[#047857]/80 leading-relaxed">
                      Wysłaliśmy link aktywacyjny. Potwierdź swój adres e-mail, aby otrzymywać merytoryczne treści.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Search Bar & Header Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-[#EFEAE1] p-4.5 rounded-2xl shadow-xs">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Wyszukaj artykuł (np. rekrutacja, analityka)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:outline-none placeholder-[#A39AB4]/80 transition-all"
            />
            <Search className="w-4 h-4 text-[#6A5E8C] absolute left-3 top-3" />
          </div>
          <div className="text-xs text-[#55506E] font-mono shrink-0">
            Pokazano: <strong>{filteredArticles.length}</strong> artykułów z <strong>{allArticles.length}</strong> ogółem
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFFFF] border border-dashed border-[#EFEAE1] rounded-2xl p-6">
            <BookOpen className="w-10 h-10 text-[#6A5E8C] mx-auto opacity-40 mb-3" />
            <p className="text-sm text-[#14183D] font-bold">Brak pasujących artykułów</p>
            <p className="text-xs text-[#6A5E8C] mt-1 max-w-sm mx-auto">
              Nie znaleźliśmy artykułów spełniających Twoje kryteria. Spróbuj wpisać inne słowo kluczowe.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 bg-[#E3DEEE] text-[#3B2F8C] text-xs font-bold rounded-lg hover:bg-[#C4BBDE] transition-colors cursor-pointer"
            >
              Zresetuj filtry wyszukiwania
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div 
                  key={article.id}
                  className="bg-white border border-[#EFEAE1] rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-indigo-900/5 hover:border-[#C4BBDE]/55 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Beautiful cover image with zoom effect on hover */}
                    <div className="aspect-[16/9] w-full overflow-hidden bg-[#F4F1EC] relative border-b border-[#EFEAE1]/60">
                      <img
                        src={getArticleImage(article)}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#3B2F8C] bg-white/95 px-2.5 py-1 rounded-full shadow-xs border border-[#C4BBDE]/35 leading-none">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6A5E8C] font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#F4A574]" />
                        <span>{article.readTime}</span>
                      </div>

                      <h3 className="font-display font-bold text-[#14183D] text-sm sm:text-base leading-snug group-hover:text-[#3B2F8C] transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-[11px] text-[#55506E] leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FBFAF8] px-5 py-3 border-t border-[#EFEAE1]/70 flex items-center justify-between">
                    <span className="text-[10px] text-[#6A5E8C] font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.publishDate}
                    </span>

                    <button
                      onClick={() => openArticleInNewTab(article)}
                      className="text-xs font-bold text-[#3B2F8C] hover:text-[#231B5E] flex items-center gap-1 cursor-pointer"
                      title="Otwórz artykuł w nowej karcie"
                    >
                      Czytaj dalej
                      <ChevronRight className="w-4 h-4 text-[#F4A574]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

      </div>
    </div>
  );
};
