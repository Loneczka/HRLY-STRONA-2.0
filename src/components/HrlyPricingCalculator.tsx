import React, { useState } from 'react';
import { HRLY_PLANS, HRlyPlan } from '../data/hrlyData';
import { Check, ArrowRight, X, Users, Building2, CheckCircle2 } from 'lucide-react';
import Button from './Button';

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
      <div className="bg-neutral-bg border border-border-soft/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-2xl text-center md:text-left space-y-2">
          {/* FAZA 8: etykieta panelu wewnątrz sekcji `#pricing` z App.tsx — bez numeru,
              żeby nie dublować numeracji SectionLabel należącej do trasy. */}
          <span className="inline-flex items-center rounded-full px-3 py-1.5 type-label font-mono uppercase bg-primary-light/60 text-indigo-primary border border-border-indigo/35">
            Kalkulator zapotrzebowania
          </span>
          <h2 className="type-h2 font-display text-text-dark">
            Dobierz pakiet według rozmiaru zespołu
          </h2>
          <p className="type-body text-muted-purple">
            Zaczynamy od pakietu Lite dla mniejszych zespołów. Pakiety Standard i Premium systematycznie rozwijają współpracę z menedżerami w stale rosnących organizacjach. Przeciągnij suwak, by natychmiast sprawdzić rekomendowany plan.
          </p>
        </div>

        {/* The slider control */}
        <div className="bg-neutral-surface border border-border-soft p-5 rounded-xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-primary-faint p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-primary shrink-0" aria-hidden="true" />
              <span className="type-body font-semibold text-text-dark">Twój zespół operacyjny liczy:</span>
            </div>
            <div className="text-center sm:text-right">
              <span className="font-mono type-h3 text-text-dark block">
                {employeeCount >= 300 ? '250+' : `${employeeCount} osób`}
              </span>
              <span className="type-body-sm text-muted-purple block mt-1">pracowników na etacie / B2B</span>
            </div>
          </div>

          <div className="space-y-1 pt-1.5">
            <input
              type="range"
              min="1"
              max="300"
              step="1"
              value={employeeCount}
              aria-label="Liczba pracowników"
              onChange={(e) => setEmployeeCount(Number(e.target.value))}
              className="w-full h-2.5 bg-border-soft rounded-lg appearance-none cursor-pointer accent-indigo-primary"
            />
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 type-label font-mono text-muted-purple pt-1">
              <span>Do 20 (Lite)</span>
              <span>21-100 (Standard)</span>
              <span>101-250 (Premium)</span>
              <span>Ponad 250 (Enterprise)</span>
            </div>
          </div>
        </div>

        {/* Live Recommendation Badge */}
        {recommendedPlan && (
          <div className="bg-indigo-primary/5 border border-indigo-primary/20 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in ring-1 ring-indigo-primary/15">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-full bg-neutral-surface border border-border-indigo flex items-center justify-center type-h3 text-indigo-primary shrink-0" aria-hidden="true">
                ⭐
              </span>
              <div className="space-y-1">
                <p className="type-label font-mono uppercase text-indigo-primary">AUTOPILOT SUGERUJE DLA CIEBIE:</p>
                <h3 className="type-h3 font-display text-text-dark flex flex-wrap items-baseline gap-x-2">
                  {recommendedPlan.name}
                  <span className="type-body-sm text-muted-purple">({recommendedPlan.price})</span>
                </h3>
                <p className="type-body-sm text-muted-purple">
                  {recommendedPlan.forWhom}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto shrink-0"
              icon={<ArrowRight />}
              onClick={() => handleOpenRegistration(recommendedPlan)}
            >
              Skonfiguruj pakiet próbny
            </Button>
          </div>
        )}
      </div>

      {/* Grid of the 4 standard plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {HRLY_PLANS.map((plan) => {
          const isOptimal = recommendedPlan?.id === plan.id;
          const isEnterprise = plan.id === 'enterprise';

          return (
            <div
              key={plan.id}
              className={`bg-neutral-surface border rounded-2xl h-full flex flex-col justify-between transition-all duration-300 relative ${
                isOptimal
                  ? 'border-indigo-primary ring-2 ring-indigo-primary shadow-lg'
                  : 'border-border-soft hover:border-border-indigo hover:shadow-md'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap type-label font-mono uppercase bg-text-dark text-white px-3 py-1 rounded-full shadow-sm">
                  Rekomendowany
                </span>
              )}
              {isOptimal && !plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap type-label font-mono uppercase bg-indigo-primary text-white px-3 py-1 rounded-full shadow-sm">
                  💡 DOPASOWANY DO SUWAKA
                </span>
              )}

              {/* Card top details */}
              <div className="p-5 pt-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="type-h3 font-display text-text-dark">{plan.name}</h3>
                  <p className="type-body-sm text-muted-purple">{plan.forWhom}</p>
                </div>

                <div className="pt-2 border-b border-border-soft pb-3">
                  <div className="flex flex-col gap-1.5">
                    {plan.originalPrice && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="type-label font-mono text-muted-purple line-through">
                          {plan.originalPrice}
                        </span>
                        <span className="type-label font-mono uppercase text-indigo-primary bg-primary-light px-2 py-0.5 rounded">
                          PROMO -50%
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="type-h2 font-display text-text-dark">
                        {plan.price}
                      </span>
                      <span className="type-body-sm text-muted-purple">
                        {plan.priceDetails}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features Checklist */}
                <ul className="space-y-2.5 pt-2">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 type-body-sm text-muted-purple">
                      <Check className="w-4 h-4 text-indigo-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card bottom trigger */}
              <div className="p-5 bg-neutral-bg border-t border-border-soft rounded-b-2xl">
                <Button
                  variant={isOptimal ? 'primary' : 'secondary'}
                  size="lg"
                  fullWidth
                  onClick={() => handleOpenRegistration(plan)}
                >
                  {isEnterprise
                    ? 'Skontaktuj się z nami'
                    : 'Wybierz ten plan'
                  }
                </Button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Pricing / Demo Booking Popup Modal */}
      {checkoutStep > 0 && activePlan && (
        <div className="fixed inset-0 bg-text-dark/65 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={checkoutStep === 1 ? 'Rejestracja konta testowego' : 'Zgłoszenie przyjęte'}
            className="bg-neutral-surface border border-border-soft rounded-2xl max-w-md w-full p-6 pt-12 space-y-5 shadow-2xl relative my-auto"
          >

            <button
              type="button"
              onClick={resetForm}
              className="absolute top-4 right-4 p-1.5 hover:bg-primary-faint text-muted-purple rounded-full cursor-pointer"
              aria-label="Zamknij formularz"
              title="Zamknij formularz"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {checkoutStep === 1 ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center rounded-full px-3 py-1.5 type-label font-mono uppercase bg-primary-light/60 text-indigo-primary border border-border-indigo/35">
                    Zasymulowana Rejestracja
                  </span>
                  <h3 className="type-h3 font-display text-text-dark">
                    Inicjujesz pakiet: <span className="text-indigo-primary">{activePlan.name}</span>
                  </h3>
                  <p className="type-body-sm text-muted-purple">
                    Wspierasz budowanie zaangażowanych zespołów. Wpisz szczegóły konta testowego, by wejść do konfiguratora.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label htmlFor="rg-name" className="type-label uppercase text-muted-purple block">Twoje Imię i Nazwisko *</label>
                    <input
                      id="rg-name"
                      type="text"
                      required
                      placeholder="np. Anna Kępczyńska"
                      value={rgName}
                      onChange={(e) => setRgName(e.target.value)}
                      className="w-full type-body-sm bg-neutral-bg border border-border-soft rounded-lg p-3 text-text-dark focus:border-indigo-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="rg-email" className="type-label uppercase text-muted-purple block">Adres E-mail Służbowy *</label>
                    <input
                      id="rg-email"
                      type="email"
                      required
                      placeholder="kontakt@twojafirma.pl"
                      value={rgEmail}
                      onChange={(e) => setRgEmail(e.target.value)}
                      className="w-full type-body-sm bg-neutral-bg border border-border-soft rounded-lg p-3 text-text-dark focus:border-indigo-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="rg-company" className="type-label uppercase text-muted-purple block">Nazwa Organizacji / Spółki *</label>
                    <div className="relative">
                      <input
                        id="rg-company"
                        type="text"
                        required
                        placeholder="HRLY Sp. z o.o."
                        value={rgCompany}
                        onChange={(e) => setRgCompany(e.target.value)}
                        className="w-full type-body-sm bg-neutral-bg border border-border-soft rounded-lg pl-10 pr-3 p-3 text-text-dark focus:border-indigo-primary"
                      />
                      <Building2 className="w-4 h-4 text-muted-purple absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1.5">
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      checked={rgConsent}
                      onChange={(e) => setRgConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-border-soft accent-indigo-primary cursor-pointer mt-1 shrink-0"
                    />
                    <label htmlFor="consent" className="type-body-sm text-muted-purple select-none cursor-pointer">
                      Wyrażam zgodę na przetwarzanie moich danych osobowych przez HRLY Sp. z o.o. w celu utworzenia konta testowego zgodnie z polityką prywatności platformy.
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!rgConsent}
                  icon={<ArrowRight />}
                >
                  Uruchom Sandbox Organizacji
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-success-soft text-success rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center rounded-full px-3 py-1.5 type-label font-mono uppercase bg-success-soft text-success">
                    Zgłoszenie Poprawne!
                  </span>
                  <h3 className="type-h3 font-display text-text-dark">Witaj na pokładzie HRly, {rgName}!</h3>
                  <p className="type-body-sm text-muted-purple max-w-xs mx-auto">
                    Konto dla organizacji <strong className="text-text-dark font-semibold">{rgCompany}</strong> zostało pomyślnie zadeklarowane w bazie. Na podany e-mail <strong className="text-text-dark font-semibold">{rgEmail}</strong> wysłaliśmy panel logowania i darmową instrukcję wdrożenia analityki HR w kilka minut.
                  </p>
                </div>

                <Button variant="ghost" size="md" onClick={resetForm}>
                  Powróć do cennika
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
