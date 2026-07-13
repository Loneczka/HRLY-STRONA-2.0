import { useState } from 'react';
import { ADMIN_COLORS, AdminButton, AdminInput, AdminTextarea, AdminLabel, AdminCard, Badge } from './ui';
import { useToast } from './Toast';
import type { SiteConfig } from '../../hooks/useSiteConfig';

type Section = 'hero' | 'stats' | 'contact' | 'footer' | 'pricing';

export function PagesTab({
  config,
  updateConfig,
}: {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
  const { toast } = useToast();
  const [section, setSection] = useState<Section>('hero');

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: 'hero', label: 'Hero', icon: '🎯' },
    { id: 'stats', label: 'Statystyki', icon: '📊' },
    { id: 'contact', label: 'Kontakt', icon: '📞' },
    { id: 'footer', label: 'Footer', icon: '🗘' },
    { id: 'pricing', label: 'Cennik', icon: '💰' },
  ];

  return (
    <div>
      <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
        Tre\u015B\u0107 stron
      </h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: `1px solid ${section === s.id ? ADMIN_COLORS.primary : ADMIN_COLORS.border}`,
              background: section === s.id ? `${ADMIN_COLORS.primary}22` : ADMIN_COLORS.surface,
              color: section === s.id ? ADMIN_COLORS.primary : ADMIN_COLORS.textDim,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {section === 'hero' && <HeroEditor config={config} updateConfig={updateConfig} toast={toast} />}
      {section === 'stats' && <StatsEditor config={config} updateConfig={updateConfig} toast={toast} />}
      {section === 'contact' && <ContactEditor config={config} updateConfig={updateConfig} toast={toast} />}
      {section === 'footer' && <FooterEditor config={config} updateConfig={updateConfig} toast={toast} />}
      {section === 'pricing' && <PricingEditor config={config} updateConfig={updateConfig} toast={toast} />}
    </div>
  );
}

function HeroEditor({ config, updateConfig, toast }: { config: SiteConfig; updateConfig: (u: Partial<SiteConfig>) => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [hero, setHero] = useState(config.hero);
  return (
    <AdminCard>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <AdminLabel>Badge</AdminLabel>
          <AdminInput value={hero.badge} onChange={(v) => setHero({ ...hero, badge: v })} />
        </div>
        <div>
          <AdminLabel>Headline</AdminLabel>
          <AdminInput value={hero.headline} onChange={(v) => setHero({ ...hero, headline: v })} />
        </div>
        <div>
          <AdminLabel>Subheadline</AdminLabel>
          <AdminTextarea value={hero.subheadline} onChange={(v) => setHero({ ...hero, subheadline: v })} rows={3} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="admin-pages-grid">
          <div>
            <AdminLabel>CTA Primary - tekst</AdminLabel>
            <AdminInput value={hero.ctaPrimaryText} onChange={(v) => setHero({ ...hero, ctaPrimaryText: v })} />
          </div>
          <div>
            <AdminLabel>CTA Primary - link</AdminLabel>
            <AdminInput value={hero.ctaPrimaryLink} onChange={(v) => setHero({ ...hero, ctaPrimaryLink: v })} />
          </div>
        </div>
        <div>
          <AdminLabel>CTA Secondary - tekst</AdminLabel>
          <AdminInput value={hero.ctaSecondaryText} onChange={(v) => setHero({ ...hero, ctaSecondaryText: v })} />
        </div>
        <AdminButton onClick={() => { updateConfig({ hero }); toast('Hero zapisane', 'success'); }}>
          Zapisz zmiany
        </AdminButton>
      </div>
    </AdminCard>
  );
}

function StatsEditor({ config, updateConfig, toast }: { config: SiteConfig; updateConfig: (u: Partial<SiteConfig>) => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [stats, setStats] = useState(config.stats);
  return (
    <AdminCard>
      <div style={{ display: 'grid', gap: '16px' }}>
        {[1, 2, 3].map((i) => {
          const valKey = `stat${i}Value` as keyof typeof stats;
          const lblKey = `stat${i}Label` as keyof typeof stats;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }} className="admin-pages-grid">
              <div>
                <AdminLabel>Stat {i} - warto\u015B\u0107</AdminLabel>
                <AdminInput value={stats[valKey]} onChange={(v) => setStats({ ...stats, [valKey]: v })} />
              </div>
              <div>
                <AdminLabel>Stat {i} - etykieta</AdminLabel>
                <AdminInput value={stats[lblKey]} onChange={(v) => setStats({ ...stats, [lblKey]: v })} />
              </div>
            </div>
          );
        })}
        <AdminButton onClick={() => { updateConfig({ stats }); toast('Statystyki zapisane', 'success'); }}>
          Zapisz zmiany
        </AdminButton>
      </div>
    </AdminCard>
  );
}

function ContactEditor({ config, updateConfig, toast }: { config: SiteConfig; updateConfig: (u: Partial<SiteConfig>) => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [contact, setContact] = useState(config.contact);
  return (
    <AdminCard>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <AdminLabel>Email</AdminLabel>
          <AdminInput value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
        </div>
        <div>
          <AdminLabel>Telefon</AdminLabel>
          <AdminInput value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
        </div>
        <div>
          <AdminLabel>Adres</AdminLabel>
          <AdminInput value={contact.address} onChange={(v) => setContact({ ...contact, address: v })} />
        </div>
        <div>
          <AdminLabel>LinkedIn</AdminLabel>
          <AdminInput value={contact.linkedIn} onChange={(v) => setContact({ ...contact, linkedIn: v })} />
        </div>
        <div>
          <AdminLabel>Link do kalendarza</AdminLabel>
          <AdminInput value={contact.calendarLink} onChange={(v) => setContact({ ...contact, calendarLink: v })} />
        </div>
        <AdminButton onClick={() => { updateConfig({ contact }); toast('Kontakt zapisany', 'success'); }}>
          Zapisz zmiany
        </AdminButton>
      </div>
    </AdminCard>
  );
}

function FooterEditor({ config, updateConfig, toast }: { config: SiteConfig; updateConfig: (u: Partial<SiteConfig>) => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [footer, setFooter] = useState(config.footer);
  return (
    <AdminCard>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <AdminLabel>Opis firmy</AdminLabel>
          <AdminTextarea value={footer.companyDescription} onChange={(v) => setFooter({ ...footer, companyDescription: v })} rows={3} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="admin-pages-grid">
          <div>
            <AdminLabel>LinkedIn</AdminLabel>
            <AdminInput value={footer.linkedIn} onChange={(v) => setFooter({ ...footer, linkedIn: v })} />
          </div>
          <div>
            <AdminLabel>Twitter/X</AdminLabel>
            <AdminInput value={footer.twitter} onChange={(v) => setFooter({ ...footer, twitter: v })} />
          </div>
          <div>
            <AdminLabel>Facebook</AdminLabel>
            <AdminInput value={footer.facebook} onChange={(v) => setFooter({ ...footer, facebook: v })} />
          </div>
        </div>
        <div>
          <AdminLabel>Copyright</AdminLabel>
          <AdminInput value={footer.copyright} onChange={(v) => setFooter({ ...footer, copyright: v })} />
        </div>
        <AdminButton onClick={() => { updateConfig({ footer }); toast('Footer zapisany', 'success'); }}>
          Zapisz zmiany
        </AdminButton>
      </div>
    </AdminCard>
  );
}

function PricingEditor({ config, updateConfig, toast }: { config: SiteConfig; updateConfig: (u: Partial<SiteConfig>) => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [plans, setPlans] = useState(config.pricing);

  const updatePlan = (id: string, updates: Partial<typeof plans[0]>) => {
    setPlans(plans.map((p) => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {plans.map((plan) => (
        <AdminCard key={plan.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px' }}>{plan.name}</h3>
            {plan.highlighted && <Badge color="primary">Polecany</Badge>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="admin-pages-grid">
            <div>
              <AdminLabel>Cena</AdminLabel>
              <AdminInput value={plan.price} onChange={(v) => updatePlan(plan.id, { price: v })} />
            </div>
            <div>
              <AdminLabel>Okres</AdminLabel>
              <AdminInput value={plan.period} onChange={(v) => updatePlan(plan.id, { period: v })} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <AdminLabel>Opis</AdminLabel>
            <AdminTextarea value={plan.description} onChange={(v) => updatePlan(plan.id, { description: v })} rows={2} />
          </div>
          <div style={{ marginTop: '12px' }}>
            <AdminLabel>Features (oddzielone enterem)</AdminLabel>
            <AdminTextarea
              value={plan.features.join('\n')}
              onChange={(v) => updatePlan(plan.id, { features: v.split('\n').filter(Boolean) })}
              rows={5}
            />
          </div>
          <div style={{ marginTop: '12px' }}>
            <AdminLabel>Tekst CTA</AdminLabel>
            <AdminInput value={plan.ctaText} onChange={(v) => updatePlan(plan.id, { ctaText: v })} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={plan.highlighted}
              onChange={(e) => updatePlan(plan.id, { highlighted: e.target.checked })}
              style={{ accentColor: ADMIN_COLORS.primary, cursor: 'pointer' }}
            />
            <span style={{ color: ADMIN_COLORS.textDim, fontSize: '14px' }}>Plan polecany</span>
          </label>
        </AdminCard>
      ))}
      <AdminButton onClick={() => { updateConfig({ pricing: plans }); toast('Cennik zapisany', 'success'); }}>
        Zapisz wszystkie zmiany
      </AdminButton>
    </div>
  );
}
