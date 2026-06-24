import React, { useState, useMemo } from 'react';
import { BLOG_ARTICLES, BlogArticle } from '../data/hrlyData';
import { 
  Search, BookOpen, Clock, Calendar, ChevronRight, X, 
  Send, CheckCircle, ArrowRight, BookMarked, Filter, Share2, Mail
} from 'lucide-react';

// Exact categories from PDF Page 8 filter list
const PDF_CATEGORIES = [
  "Wszystkie", "Motywacja i zaangażowanie", "Analityka HR", "employee experience", 
  "motywacja", "rozwój liderów", "wypalenie zawodowe", "Zarządzanie talentami", 
  "rozwój kariery", "rozwój i szkolenia", "przyszłość pracy", "kultura organizacyjna"
];

const getArticleImage = (id: number) => {
  switch (id) {
    case 1: return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"; // Teamwork
    case 2: return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"; // Charts/Data
    case 3: return "https://images.unsplash.com/photo-1552581230-c01bc9148c5b?auto=format&fit=crop&w=600&q=80"; // Tough meeting
    case 4: return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"; // Planning/Talent
    case 5: return "https://images.unsplash.com/photo-1531535934202-f022eed250c2?auto=format&fit=crop&w=600&q=80"; // Happiness/EX
    default: return "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80"; // Future of work
  }
};

export interface HrlyBlogSectionProps {
  onNavigate?: (tab: string) => void;
}

export const HrlyBlogSection: React.FC<HrlyBlogSectionProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === "Wszystkie") {
        return matchesSearch;
      }
      
      // Flexible matching (case insensitive and taking into account small typos or subcategories)
      const matchesCategory = 
        article.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() === "") return;
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
              <span className="text-[#3B2F8C]">HRly operations</span>
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
                    <p className="text-[9.5px] text-[#A39AB4] font-mono uppercase font-bold tracking-wider mt-1">
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
                      <label className="text-[9.5px] font-bold text-[#A39AB4] uppercase tracking-wider block mb-1">Twój e-mail</label>
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
                    <p className="text-[9px] text-[#A39AB4] text-center leading-normal">
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
            <Search className="w-4 h-4 text-[#A39AB4] absolute left-3 top-3" />
          </div>
          <div className="text-xs text-[#55506E] font-mono shrink-0">
            Pokazano: <strong>{filteredArticles.length}</strong> artykułów z <strong>{BLOG_ARTICLES.length}</strong> ogółem
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFFFF] border border-dashed border-[#EFEAE1] rounded-2xl p-6">
            <BookOpen className="w-10 h-10 text-[#A39AB4] mx-auto opacity-40 mb-3" />
            <p className="text-sm text-[#14183D] font-bold">Brak pasujących artykułów</p>
            <p className="text-xs text-[#A39AB4] mt-1 max-w-sm mx-auto">
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
                        src={getArticleImage(article.id)} 
                        alt={article.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#3B2F8C] bg-white/95 px-2.5 py-1 rounded-full shadow-xs border border-[#C4BBDE]/35 leading-none">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#A39AB4] font-mono">
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
                    <span className="text-[10px] text-[#A39AB4] font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.publishDate}
                    </span>

                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="text-xs font-bold text-[#3B2F8C] hover:text-[#231B5E] flex items-center gap-1 cursor-pointer"
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

      {/* Pop-up Reading Dialog (Lightbox/Modal) */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-[#14183D]/65 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-[#EFEAE1] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            
            {/* Close trigger */}
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#F4F1EC] text-[#55506E] rounded-full transition-colors cursor-pointer z-10"
              title="Zamknij artykuł"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cinematic Cover photo inside Modal */}
            <div className="aspect-[21/9] w-full rounded-xl overflow-hidden bg-[#F4F1EC] border border-[#C4BBDE]/30 shadow-xs relative">
              <img 
                src={getArticleImage(selectedArticle.id)} 
                alt={selectedArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Meta details */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#3B2F8C] bg-[#E3DEEE] px-2.5 py-0.5 rounded-full">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-[#A39AB4] font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#F4A574]" /> {selectedArticle.readTime}
                </span>
                <span className="text-xs text-[#A39AB4] font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {selectedArticle.publishDate}
                </span>
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl text-[#14183D] tracking-tight leading-tight">
                {selectedArticle.title}
              </h2>
            </div>

            {/* Inner highlights */}
            <div className="bg-[#F4F1EC]/70 border-l-4 border-[#F4A574] p-4 rounded-r-xl">
              <p className="text-xs text-[#14183D] font-bold leading-relaxed italic">
                {selectedArticle.summary}
              </p>
            </div>

            {/* Main content body */}
            <div className="text-xs text-[#55506E] whitespace-pre-wrap leading-relaxed space-y-4 font-normal">
              {selectedArticle.content}
              <p className="pt-4 border-t border-[#EFEAE1] text-[10px] text-[#A39AB4] font-mono">
                Artykuł udostępniony bezpłatnie w ramach bazy wiedzy HRly operations. Kopiowanie i dystrybucja bez podania źródła (hrly.pl) zastrzeżona przez HRLY Sp. z o.o.
              </p>
            </div>

            {/* Bottom Actions inside modal */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[#EFEAE1] justify-between items-center bg-[#FBFAF8] p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#14183D] font-bold">Chcesz usprawnić swój HR?</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedArticle(null); }}
                  className="px-4 py-2 text-xs border border-[#C4BBDE] hover:bg-[#F4F1EC] text-[#3B2F8C] font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Zamknij okno
                </button>
                <a
                  href="#contact"
                  onClick={() => { setSelectedArticle(null); }}
                  className="px-4 py-2 text-xs bg-[#3B2F8C] hover:bg-[#231B5E] text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  Umów demo
                  <ArrowRight className="w-3 h-3 text-[#F4A574]" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
