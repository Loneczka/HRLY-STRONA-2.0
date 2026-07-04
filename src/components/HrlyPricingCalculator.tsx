import React, { useState } from 'react';
import { HRLY_PLANS, HRlyPlan } from '../data/hrlyData';
import { 
  Check, Info, Sparkles, HelpCircle, ArrowRight, X, 
  Send, Users, Mail, Building2, ChevronRight, CheckCircle2
} from 'lucide-react';

export interface HrlyPricingCalculatorProps {
  onNavigate?: (tab: string) => void;
}

export const HrlyPricingCalculator: React.FC<HrlyPricingCalculatorProps> = ({ onNavigate }) => {
  const [employeeCount, setEmployeeCount] = useState<number>(15);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<number>(0); // 0=none, 1=form, 2=thank you
  
  // Registration Form States
  const [rgName, setRgName] = useState("");
  const [rgEmail, setRgEmail] = useState("");
  const [rgCompany, setRgCompany] = useState("");
  const [rgConsent, setRgConsent] = useState(false);

  // Auto recommend plan based on employee count
  const recommendedPlan = React.useMemo(() => {
    if (employeeCount <= 20) return HRLY_PLANS.find(p => p.id === 'basic');
    if (employeeCount <= 100) return HRLY_PLANS.find(p => p.id === 'growth');
    if (employeeCount <= 250) return HRLY_PLANS.find(p => p.id === 'scale');
    return HRLY_PLANS.find(p => p.id === 'enterprise');
  }, [employeeCount]);

  const handleOpenRegistration = (plan: HRlyPlan) => {
    setSelectedPlanId(plan.id);
    setCheckoutStep(1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rgConsent) return;
    setCheckoutStep(2);
  };

  const resetForm = () => {
    setRgName("");
    setRgEmail("");
    setRgCompany("");
    setRgConsent(false);
    setCheckoutStep(0);
    setSelectedPlanId(null);
  };

  const activePlan = HRLY_PLANS.find(p => p.id === selectedPlanId);

  return (
    <div className="space-y-10" id="pricing">
      
      {/* Slider Widget: Dynamically calculate plan */}
      <div className="bg-[#FBFAF8] border border-[#EFEAE1]/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4A574]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="max-w-2xl text-center md:text-left space-y-1.5">
          <span className="text-[10px] text-[#3B2F8C] uppercase font-bold tracking-wider font-mono">
            Kalkulator zapotrzebowania
          </span>
          <h3 className="font-sans font-black text-xl text-[#14183D] tracking-tight leading-none uppercase">
            Dobierz pakiet według rozmiaru zespołu
          </h3>
          <p className="text-xs text-[#55506E] leading-relaxed">
            Zaczynamy od pakietu Lite dla mniejszych zespołów. Pakiety Standard i Premium systematycznie rozwijają współpracę z menedżerami w stale rosnących organizacjach. Przeciągnij suwak, by natychmiast sprawdzić rekomendowany plan.
          </p>
        </div>

        {/* The slider control */}
        <div className="bg-white border border-[#EFEAE1] p-5 rounded-xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F4F1EC] p-3.5 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#3B2F8C]" />
              <span className="text-xs font-semibold text-[#14183D]">Twój zespół operacyjny liczy:</span>
            </div>
            <div className="text-center sm:text-right">
              <span className="font-mono text-xl font-black text-[#14183D]">
                {employeeCount >= 300 ? '250+' : `${employeeCount} osób`}
              </span>
              <span className="text-[10px] text-[#6A5E8C] block leading-none mt-1">pracowników na etacie / B2B</span>
            </div>
          </div>

          <div className="space-y-1 pt-1.5">
            <input
              type="range"
              min="1"
              max="300"
              step="1"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Number(e.target.value))}
              className="w-full h-2.5 bg-[#EFEAE1] rounded-lg appearance-none cursor-pointer accent-[#3B2F8C]"
            />
            <div className="flex justify-between text-[9px] text-[#6A5E8C] font-mono leading-none pt-1">
              <span>Do 20 (Lite)</span>
              <span>21-100 (Standard)</span>
              <span>101-250 (Premium)</span>
              <span>Ponad 250 (Enterprise)</span>
            </div>
          </div>
        </div>

        {/* Live Recommendation Badge */}
        {recommendedPlan && (
          <div className="bg-[#3B2F8C]/5 border border-[#3B2F8C]/20 p-4.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ring-1 ring-[#F4A574]/15">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-[#C4BBDE] flex items-center justify-center font-bold text-lg text-[#3B2F8C] shrink-0">
                ⭐
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-[#F4A574]">AUTOPILOT SUGERUJE DLA CIEBIE:</p>
                <h4 className="text-sm font-black text-[#14183D] flex items-baseline gap-1.5 mt-0.5">
                  {recommendedPlan.name}
                  <span className="text-xs text-[#55506E] font-medium">({recommendedPlan.price})</span>
                </h4>
                <p className="text-[11px] text-[#55506E] mt-0.5">
                  {recommendedPlan.forWhom}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenRegistration(recommendedPlan)}
              className="w-full sm:w-auto py-2.5 px-5 bg-[#3B2F8C] hover:bg-[#231B5E] text-white rounded-xl text-xs font-bold tracking-tight shadow-sm hover:shadow transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            >
              Skonfiguruj pakiet próbny
              <ArrowRight className="w-4 h-4 text-[#F4A574]" />
            </button>
          </div>
        )}
      </div>

      {/* Grid of the 4 standard plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {HRLY_PLANS.map((plan) => {
          const isOptimal = recommendedPlan?.id === plan.id;
          const isEnterprise = plan.id === 'enterprise';
          
          return (
            <div
              key={plan.id}
              className={`bg-white border rounded-2xl flex flex-col justify-between transition-all duration-300 relative ${
                isOptimal 
                  ? 'border-[#3B2F8C] ring-2 ring-[#3B2F8C] shadow-lg scale-[1.01]' 
                  : 'border-[#EFEAE1] hover:border-[#C4BBDE] hover:shadow-md'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold tracking-widest bg-[#F4A574] text-white px-3 py-1 rounded-full shadow-sm">
                  Rekomendowany
                </span>
              )}
              {isOptimal && !plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold tracking-widest bg-[#3B2F8C] text-white px-3 py-1 rounded-full shadow-sm font-mono flex items-center gap-1">
                  💡 DOPASOWANY DO SUWAKA
                </span>
              )}

              {/* Card top details */}
              <div className="p-5.5 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-sans font-black text-base text-[#14183D] tracking-tight">{plan.name}</h4>
                  <p className="text-[10px] text-[#6A5E8C] font-medium leading-none">{plan.forWhom}</p>
                </div>

                <div className="pt-2 border-b border-[#EFEAE1] pb-3">
                  <div className="flex flex-col gap-1">
                    {plan.originalPrice && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#6A5E8C] line-through font-mono font-medium leading-none">
                          {plan.originalPrice}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-[#F4A574] bg-[#F4A574]/10 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                          PROMO -50%
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="font-sans font-black text-3xl text-[#14183D] tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-[10px] text-[#55506E] font-medium">
                        {plan.priceDetails}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features Checklist */}
                <ul className="space-y-2 pt-2">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-[11px] text-[#55506E] leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-[#3B2F8C] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card bottom trigger */}
              <div className="p-5 bg-[#FBFAF8] border-t border-[#EFEAE1] rounded-b-2xl">
                <button
                  onClick={() => handleOpenRegistration(plan)}
                  className={`w-full py-2.5 px-4 text-xs font-bold tracking-tight rounded-xl transition-all cursor-pointer text-center block ${
                    isOptimal 
                      ? 'bg-[#3B2F8C] text-white hover:bg-[#231B5E]' 
                      : 'bg-white border border-[#C4BBDE] hover:bg-[#F4F1EC] text-[#3B2F8C]'
                  }`}
                >
                  {isEnterprise 
                    ? 'Skontaktuj się z nami' 
                    : 'Wybierz ten plan'
                  }
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Pricing / Demo Booking Popup Modal */}
      {checkoutStep > 0 && activePlan && (
        <div className="fixed inset-0 bg-[#14183D]/65 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-[#EFEAE1] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            
            <button 
              onClick={resetForm}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#F4F1EC] text-[#55506E] rounded-full cursor-pointer"
              title="Zamknij formularz"
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutStep === 1 ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#F4A574]">Zasymulowana Rejestracja</span>
                  <h3 className="font-display font-extrabold text-base text-[#14183D] tracking-tight">
                    Inicjujesz pakiet: <span className="text-[#3B2F8C]">{activePlan.name}</span>
                  </h3>
                  <p className="text-[11px] text-[#6A5E8C] leading-relaxed">
                    Wspierasz budowanie zaangażowanych zespołów. Wpisz szczegóły konta testowego, by wejść do konfiguratora.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#55506E]">Twoje Imię i Nazwisko *</label>
                    <input
                      type="text"
                      required
                      placeholder="np. Anna Kępczyńska"
                      value={rgName}
                      onChange={(e) => setRgName(e.target.value)}
                      className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-lg p-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#55506E]">Adres E-mail Służbowy *</label>
                    <input
                      type="email"
                      required
                      placeholder="kontakt@twojafirma.pl"
                      value={rgEmail}
                      onChange={(e) => setRgEmail(e.target.value)}
                      className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-lg p-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#55506E]">Nazwa Organizacji / Spółki *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="HRLY Sp. z o.o."
                        value={rgCompany}
                        onChange={(e) => setRgCompany(e.target.value)}
                        className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-lg pl-9 pr-3 p-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:outline-none"
                      />
                      <Building2 className="w-4 h-4 text-[#6A5E8C] absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1.5">
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      checked={rgConsent}
                      onChange={(e) => setRgConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-[#EFEAE1] text-[#3B2F8C] focus:ring-[#3B2F8C] cursor-pointer mt-0.5"
                    />
                    <label htmlFor="consent" className="text-[10px] text-[#55506E] leading-normal select-none cursor-pointer">
                      Wyrażam zgodę na przetwarzanie moich danych osobowych przez HRLY Sp. z o.o. w celu utworzenia konta testowego zgodnie z polityką prywatności platformy.
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!rgConsent}
                  className="w-full py-2.5 px-4 bg-[#3B2F8C] hover:bg-[#231B5E] text-white rounded-xl text-xs font-bold tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Uruchom Sandbox Organizacji
                  <ArrowRight className="w-4 h-4 text-[#F4A574]" />
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-[#047857] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#047857]">Zgłoszenie Poprawne!</span>
                  <h3 className="font-display font-black text-lg text-[#14183D] tracking-tight">Witaj na pokładzie HRly, {rgName}!</h3>
                  <p className="text-xs text-[#55506E] leading-relaxed max-w-xs mx-auto">
                    Konto dla organizacji <strong>{rgCompany}</strong> zostało pomyślnie zadeklarowane w bazie. Na podany e-mail <strong>{rgEmail}</strong> wysłaliśmy panel logowania i darmową instrukcję wdrożenia analityki HR w kilka minut.
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-[#F4F1EC] hover:bg-[#EFEAE1] text-[#3B2F8C] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Powróć do cennika
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
