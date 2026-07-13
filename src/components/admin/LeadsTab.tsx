import { useState, useMemo } from 'react';
import { ADMIN_COLORS, AdminButton, AdminInput, AdminCard, Badge, EmptyState, Modal, ConfirmDialog } from './ui';
import { useToast } from './Toast';
import type { SiteConfig, ContactLead } from '../../hooks/useSiteConfig';

export function LeadsTab({
  config,
  updateConfig,
}: {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'contact' | 'demo' | 'unread' | 'starred'>('all');
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return config.leads.filter((l) => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterType === 'all' ? true :
        filterType === 'unread' ? !l.read :
        filterType === 'starred' ? l.starred :
        l.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [config.leads, searchQuery, filterType]);

  const updateLead = (id: string, updates: Partial<ContactLead>) => {
    updateConfig({
      leads: config.leads.map((l) => l.id === id ? { ...l, ...updates } : l),
    });
  };

  const handleMarkRead = (lead: ContactLead) => {
    if (!lead.read) {
      updateLead(lead.id, { read: true });
    }
    setSelectedLead(lead);
  };

  const handleToggleStar = (id: string) => {
    const lead = config.leads.find((l) => l.id === id);
    if (lead) updateLead(id, { starred: !lead.starred });
  };

  const handleDelete = (id: string) => {
    updateConfig({ leads: config.leads.filter((l) => l.id !== id) });
    setConfirmDelete(null);
    setSelectedLead(null);
    toast('Lead usuni\u0119ty', 'success');
  };

  const handleExportCSV = () => {
    const csv = [
      'Imi\u0119,Email,Firma,Temat,Typ,Data,Odczytany,Gwiazdka',
      ...config.leads.map((l) =>
        `"${l.name}","${l.email}","${l.company}","${l.subject}","${l.type}","${l.receivedAt}","${l.read}","${l.starred}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Wyeksportowano ${config.leads.length} lead\u00F3w`, 'success');
  };

  const filterChips: { id: typeof filterType; label: string; count: number }[] = [
    { id: 'all', label: 'Wszystkie', count: config.leads.length },
    { id: 'unread', label: 'Nieprzeczytane', count: config.leads.filter((l) => !l.read).length },
    { id: 'starred', label: 'Oznaczone', count: config.leads.filter((l) => l.starred).length },
    { id: 'contact', label: 'Kontakt', count: config.leads.filter((l) => l.type === 'contact').length },
    { id: 'demo', label: 'Demo', count: config.leads.filter((l) => l.type === 'demo').length },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700 }}>
          Leady ({config.leads.length})
        </h2>
        <AdminButton variant="secondary" size="sm" onClick={handleExportCSV}>
          Eksport CSV
        </AdminButton>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <AdminInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Szukaj po imieniu, emailu, temacie..."
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilterType(chip.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              border: `1px solid ${filterType === chip.id ? ADMIN_COLORS.primary : ADMIN_COLORS.border}`,
              background: filterType === chip.id ? `${ADMIN_COLORS.primary}22` : ADMIN_COLORS.surface,
              color: filterType === chip.id ? ADMIN_COLORS.primary : ADMIN_COLORS.textDim,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {chip.label}
            <span style={{
              background: filterType === chip.id ? ADMIN_COLORS.primary : ADMIN_COLORS.surfaceLight,
              color: 'white',
              padding: '1px 6px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 700,
            }}>{chip.count}</span>
          </button>
        ))}
      </div>

      {filteredLeads.length === 0 ? (
        <EmptyState
          icon="📈"
          title="Brak lead\u00F3w"
          subtitle="Leady pojawi\u0105 si\u0119 tutaj, gdy kto\u015B wype\u0142ni formularz kontaktowy lub demo na stronie"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredLeads.map((lead) => (
            <AdminCard
              key={lead.id}
              onClick={() => handleMarkRead(lead)}
              style={{
                cursor: 'pointer',
                borderLeft: lead.read ? undefined : `3px solid ${ADMIN_COLORS.primary}`,
                opacity: lead.read ? 0.8 : 1,
                transition: 'transform 0.15s, border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: lead.type === 'demo' ? `${ADMIN_COLORS.accent}22` : `${ADMIN_COLORS.primary}22`,
                  color: lead.type === 'demo' ? ADMIN_COLORS.accent : ADMIN_COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ color: ADMIN_COLORS.text, fontSize: '14px', fontWeight: 600 }}>
                      {lead.name}
                    </span>
                    <Badge color={lead.type === 'demo' ? 'primary' : 'gray'}>{lead.type}</Badge>
                    {!lead.read && <Badge color="error">Nowy</Badge>}
                    {lead.starred && <span style={{ color: ADMIN_COLORS.warning, fontSize: '14px' }}>\u2605</span>}
                  </div>
                  <div style={{ color: ADMIN_COLORS.textDim, fontSize: '13px', marginBottom: '2px' }}>
                    {lead.email}{lead.company && ` \u00B7 ${lead.company}`}
                  </div>
                  <div style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lead.subject || lead.message.substring(0, 80)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ color: ADMIN_COLORS.textMuted, fontSize: '11px' }}>
                    {lead.receivedAt.split('T')[0]}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStar(lead.id); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: lead.starred ? ADMIN_COLORS.warning : ADMIN_COLORS.textMuted,
                        fontSize: '16px', padding: '2px',
                      }}
                    >\u2605</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(lead.id); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: ADMIN_COLORS.textMuted, fontSize: '14px', padding: '2px',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = ADMIN_COLORS.error; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = ADMIN_COLORS.textMuted; }}
                    >🗑</button>
                  </div>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <Modal
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.name || 'Lead'}
        maxWidth={600}
      >
        {selectedLead && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <Badge color={selectedLead.type === 'demo' ? 'primary' : 'gray'}>{selectedLead.type}</Badge>
              {!selectedLead.read && <Badge color="error">Nieprzeczytany</Badge>}
              {selectedLead.starred && <Badge color="warning">\u2605 Oznaczony</Badge>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }} className="admin-leads-grid">
              <div>
                <div style={{ fontSize: '11px', color: ADMIN_COLORS.textMuted, marginBottom: '4px' }}>Email</div>
                <div style={{ color: ADMIN_COLORS.text, fontSize: '14px' }}>{selectedLead.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: ADMIN_COLORS.textMuted, marginBottom: '4px' }}>Firma</div>
                <div style={{ color: ADMIN_COLORS.text, fontSize: '14px' }}>{selectedLead.company || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: ADMIN_COLORS.textMuted, marginBottom: '4px' }}>Data</div>
                <div style={{ color: ADMIN_COLORS.text, fontSize: '14px' }}>{selectedLead.receivedAt.split('T')[0]}</div>
              </div>
              {selectedLead.demoDate && (
                <div>
                  <div style={{ fontSize: '11px', color: ADMIN_COLORS.textMuted, marginBottom: '4px' }}>Data demo</div>
                  <div style={{ color: ADMIN_COLORS.text, fontSize: '14px' }}>{selectedLead.demoDate}</div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: ADMIN_COLORS.textMuted, marginBottom: '4px' }}>Temat</div>
              <div style={{ color: ADMIN_COLORS.text, fontSize: '14px' }}>{selectedLead.subject || '-'}</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: ADMIN_COLORS.textMuted, marginBottom: '4px' }}>Wiadomo\u015B\u0107</div>
              <div style={{
                color: ADMIN_COLORS.text,
                fontSize: '14px',
                lineHeight: 1.6,
                background: ADMIN_COLORS.bg,
                borderRadius: '8px',
                padding: '16px',
                whiteSpace: 'pre-wrap',
              }}>
                {selectedLead.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <AdminButton
                variant="ghost"
                onClick={() => handleToggleStar(selectedLead.id)}
              >
                {selectedLead.starred ? 'Usu\u0144 gwiazdk\u0119' : '\u2605 Oznacz'}
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={() => setConfirmDelete(selectedLead.id)}
              >
                Usu\u0144
              </AdminButton>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Usun\u0105\u0107 lead?"
        message="Czy na pewno chcesz usun\u0105\u0107 ten lead? Tej operacji nie mo\u017Cna cofn\u0105\u0107."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Usu\u0144"
        danger
      />
    </div>
  );
}
