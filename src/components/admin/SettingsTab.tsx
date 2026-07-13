import { useState, useRef } from 'react';
import { ADMIN_COLORS, AdminButton, AdminInput, AdminLabel, AdminCard, Badge, ConfirmDialog } from './ui';
import { useToast } from './Toast';
import type { SiteConfig, HashtagSet } from '../../hooks/useSiteConfig';

export function SettingsTab({
  config,
  updateConfig,
}: {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
  const { toast } = useToast();
  const [section, setSection] = useState<'global' | 'social' | 'security' | 'data'>('global');
  const [showWebhook, setShowWebhook] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [importData, setImportData] = useState<SiteConfig | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const sections: { id: typeof section; label: string; icon: string }[] = [
    { id: 'global', label: 'Globalne', icon: '🌐' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'security', label: 'Bezpiecze\u0144stwo', icon: '🔒' },
    { id: 'data', label: 'Dane', icon: '💾' },
  ];

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrly_config_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Konfiguracja wyeksportowana', 'success');
  };

  const handleImportFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as SiteConfig;
        setImportData(parsed);
        setConfirmImport(true);
      } catch {
        toast('Nieprawid\u0142owy plik JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  const confirmImportData = () => {
    if (importData) {
      updateConfig(importData);
      toast('Konfiguracja zaimportowana', 'success');
    }
    setImportData(null);
    setConfirmImport(false);
  };

  return (
    <div>
      <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
        Ustawienia
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

      {section === 'global' && <GlobalSettings config={config} updateConfig={updateConfig} toast={toast} />}
      {section === 'social' && <SocialSettings config={config} updateConfig={updateConfig} toast={toast} showWebhook={showWebhook} setShowWebhook={setShowWebhook} />}
      {section === 'security' && <SecuritySettings config={config} updateConfig={updateConfig} toast={toast} />}
      {section === 'data' && (
        <AdminCard>
          <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px', marginBottom: '16px' }}>Zarz\u0105dzanie danymi</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <AdminButton variant="secondary" onClick={handleExport}>
              📥 Eksport konfiguracji
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => importFileRef.current?.click()}>
              📤 Import z pliku
            </AdminButton>
            <input
              ref={importFileRef}
              type="file"
              accept="application/json"
              onChange={(e) => handleImportFile(e.target.files)}
              style={{ display: 'none' }}
            />
            <AdminButton variant="danger" onClick={() => setConfirmReset(true)}>
              Resetuj do domy\u015Blnych
            </AdminButton>
          </div>
          <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '13px', marginTop: '16px', lineHeight: 1.6 }}>
            Eksport zapisuje ca\u0142\u0105 konfiguracj\u0119 (artyku\u0142y, posty SM, leady, subskrybenci, ustawienia) do pliku JSON.
            Import przywraca dane z pliku. Reset przywraca domy\u015Bln\u0105 konfiguracj\u0119 startow\u0105.
          </p>
        </AdminCard>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Resetowa\u0107 konfiguracj\u0119?"
        message="Wszystkie dane (artyku\u0142y, posty, leady, subskrybenci) zostan\u0105 zast\u0105pione domy\u015Blnymi. Zalecamy wcze\u015Bniejszy eksport."
        onConfirm={() => {
          localStorage.removeItem('hrly_site_config');
          window.location.reload();
        }}
        onCancel={() => setConfirmReset(false)}
        confirmText="Resetuj"
        danger
      />

      <ConfirmDialog
        open={confirmImport}
        title="Importowa\u0107 konfiguracj\u0119?"
        message="Wszystkie obecne dane zostan\u0105 zast\u0105pione danymi z pliku. Czy chcesz kontynuowa\u0107?"
        onConfirm={confirmImportData}
        onCancel={() => { setConfirmImport(false); setImportData(null); }}
        confirmText="Importuj"
        danger
      />
    </div>
  );
}

function GlobalSettings({ config, updateConfig, toast }: { config: SiteConfig; updateConfig: (u: Partial<SiteConfig>) => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [global, setGlobal] = useState(config.global);
  return (
    <AdminCard>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <AdminLabel>Nazwa strony</AdminLabel>
          <AdminInput value={global.siteName} onChange={(v) => setGlobal({ ...global, siteName: v })} />
        </div>
        <div>
          <AdminLabel>Tagline</AdminLabel>
          <AdminInput value={global.tagline} onChange={(v) => setGlobal({ ...global, tagline: v })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="admin-settings-grid">
          <div>
            <AdminLabel>CTA - tekst</AdminLabel>
            <AdminInput value={global.primaryCTAText} onChange={(v) => setGlobal({ ...global, primaryCTAText: v })} />
          </div>
          <div>
            <AdminLabel>CTA - link</AdminLabel>
            <AdminInput value={global.primaryCTALink} onChange={(v) => setGlobal({ ...global, primaryCTALink: v })} />
          </div>
        </div>
        <AdminButton onClick={() => { updateConfig({ global }); toast('Ustawienia zapisane', 'success'); }}>
          Zapisz zmiany
        </AdminButton>
      </div>
    </AdminCard>
  );
}

function SocialSettings({
  config,
  updateConfig,
  toast,
  showWebhook,
  setShowWebhook,
}: {
  config: SiteConfig;
  updateConfig: (u: Partial<SiteConfig>) => void;
  toast: (m: string, t?: 'success' | 'error' | 'info') => void;
  showWebhook: boolean;
  setShowWebhook: (v: boolean) => void;
}) {
  const [social, setSocial] = useState(config.social);
  const [newHashtagName, setNewHashtagName] = useState('');
  const [newHashtagTags, setNewHashtagTags] = useState('');

  const handleAddHashtagSet = () => {
    if (!newHashtagName.trim() || !newHashtagTags.trim()) {
      toast('Nazwa i tagi s\u0105 wymagane', 'error');
      return;
    }
    const newSet: HashtagSet = {
      id: `hs_${Date.now()}`,
      name: newHashtagName.trim(),
      tags: newHashtagTags.trim(),
    };
    const updated = { ...social, savedHashtags: [...(social.savedHashtags || []), newSet] };
    setSocial(updated);
    setNewHashtagName('');
    setNewHashtagTags('');
    toast('Zestaw hashtag\u00F3w dodany', 'success');
  };

  const handleDeleteHashtagSet = (id: string) => {
    const updated = { ...social, savedHashtags: (social.savedHashtags || []).filter((h) => h.id !== id) };
    setSocial(updated);
    toast('Zestaw usuni\u0119ty', 'success');
  };

  const handleSave = () => {
    updateConfig({ social });
    toast('Ustawienia SM zapisane', 'success');
  };

  const maskedWebhook = social.makeWebhookUrl
    ? social.makeWebhookUrl.substring(0, 30) + '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AdminCard>
        <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px', marginBottom: '16px' }}>
          Integracja Make.com (Webhook)
        </h3>
        <AdminLabel>Webhook URL</AdminLabel>
        <div style={{ display: 'flex', gap: '8px' }}>
          <AdminInput
            type={showWebhook ? 'text' : 'password'}
            value={showWebhook ? social.makeWebhookUrl : maskedWebhook}
            onChange={(v) => setSocial({ ...social, makeWebhookUrl: v })}
            placeholder="https://hook.eu2.make.com/..."
          />
          <AdminButton variant="ghost" size="sm" onClick={() => setShowWebhook(!showWebhook)} style={{ flexShrink: 0 }}>
            {showWebhook ? 'Ukryj' : 'Poka\u017C'}
          </AdminButton>
        </div>
        <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px', marginTop: '8px', lineHeight: 1.5 }}>
          Webhook jest wywo\u0142ywany przy wysy\u0142aniu post\u00F3w na Social Media. Make.com przekazuje tre\u015B\u0107 do LinkedIn, Facebook i Instagram.
        </p>
      </AdminCard>

      <AdminCard>
        <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px', marginBottom: '16px' }}>
          ID stron (dla Make.com)
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <AdminLabel>Instagram Page ID</AdminLabel>
            <AdminInput value={social.instagramPageId} onChange={(v) => setSocial({ ...social, instagramPageId: v })} placeholder="np. 123456789" />
          </div>
          <div>
            <AdminLabel>Facebook Page ID</AdminLabel>
            <AdminInput value={social.facebookPageId} onChange={(v) => setSocial({ ...social, facebookPageId: v })} placeholder="np. 123456789" />
          </div>
          <div>
            <AdminLabel>LinkedIn Page ID</AdminLabel>
            <AdminInput value={social.linkedinPageId} onChange={(v) => setSocial({ ...social, linkedinPageId: v })} placeholder="np. 123456789" />
          </div>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px', marginBottom: '16px' }}>
          Zapisane zestawy hashtag\u00F3w
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', marginBottom: '16px' }} className="admin-hashtag-form">
          <AdminInput
            value={newHashtagName}
            onChange={setNewHashtagName}
            placeholder="Nazwa zestawu"
          />
          <AdminInput
            value={newHashtagTags}
            onChange={setNewHashtagTags}
            placeholder="#hr #hrly #analityka"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddHashtagSet(); }}
          />
          <AdminButton size="sm" onClick={handleAddHashtagSet}>Dodaj</AdminButton>
        </div>
        {social.savedHashtags && social.savedHashtags.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {social.savedHashtags.map((hs) => (
              <div key={hs.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: ADMIN_COLORS.bg,
              }}>
                <Badge color="primary">{hs.name}</Badge>
                <span style={{ color: ADMIN_COLORS.accent, fontSize: '13px', flex: 1 }}>{hs.tags}</span>
                <button
                  onClick={() => handleDeleteHashtagSet(hs.id)}
                  style={{
                    background: 'none', border: 'none', color: ADMIN_COLORS.textMuted,
                    cursor: 'pointer', fontSize: '16px', padding: '4px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ADMIN_COLORS.error; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ADMIN_COLORS.textMuted; }}
                >\u00D7</button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '13px' }}>Brak zapisanych zestaw\u00F3w</p>
        )}
      </AdminCard>

      <AdminButton onClick={handleSave}>Zapisz wszystkie ustawienia SM</AdminButton>
    </div>
  );
}

function SecuritySettings({ config, updateConfig, toast }: { config: SiteConfig; updateConfig: (u: Partial<SiteConfig>) => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = () => {
    if (oldPassword !== config.global.adminPassword) {
      toast('Obecne has\u0142o jest nieprawid\u0142owe', 'error');
      return;
    }
    if (newPassword.length < 6) {
      toast('Nowe has\u0142o musi mie\u0107 min. 6 znak\u00F3w', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Has\u0142a nie s\u0105 zgodne', 'error');
      return;
    }
    updateConfig({ global: { ...config.global, adminPassword: newPassword } });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast('Has\u0142o zmienione', 'success');
  };

  return (
    <AdminCard>
      <h3 style={{ color: ADMIN_COLORS.text, fontSize: '16px', marginBottom: '16px' }}>
        Zmiana has\u0142a administratora
      </h3>
      <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
        <div>
          <AdminLabel>Obecne has\u0142o</AdminLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            <AdminInput
              type={showPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="Obecne has\u0142o"
            />
            <AdminButton variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} style={{ flexShrink: 0 }}>
              {showPassword ? 'Ukryj' : 'Poka\u017C'}
            </AdminButton>
          </div>
        </div>
        <div>
          <AdminLabel>Nowe has\u0142o</AdminLabel>
          <AdminInput
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Min. 6 znak\u00F3w"
          />
        </div>
        <div>
          <AdminLabel>Powt\u00F3rz nowe has\u0142o</AdminLabel>
          <AdminInput
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Powt\u00F3rz has\u0142o"
            onKeyDown={(e) => { if (e.key === 'Enter') handleChangePassword(); }}
          />
        </div>
        <AdminButton onClick={handleChangePassword}>Zmie\u0144 has\u0142o</AdminButton>
      </div>
    </AdminCard>
  );
}
