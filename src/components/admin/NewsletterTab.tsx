import { useState, useMemo } from 'react';
import { ADMIN_COLORS, AdminButton, AdminInput, AdminCard, Badge, EmptyState, ConfirmDialog } from './ui';
import { useToast } from './Toast';
import type { SiteConfig } from '../../hooks/useSiteConfig';

const PAGE_SIZE = 25;

export function NewsletterTab({
  config,
  updateConfig,
}: {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const filteredSubs = useMemo(() => {
    return config.subscribers.filter((s) =>
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [config.subscribers, searchQuery]);

  const totalPages = Math.ceil(filteredSubs.length / PAGE_SIZE);
  const pageSubs = filteredSubs.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const allOnPageSelected = pageSubs.length > 0 && pageSubs.every((s) => selectedIds.has(s.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageSubs.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageSubs.forEach((s) => next.add(s.id));
        return next;
      });
    }
  };

  const handleDelete = (id: string) => {
    updateConfig({ subscribers: config.subscribers.filter((s) => s.id !== id) });
    toast('Subskrybent usuni\u0119ty', 'success');
  };

  const handleBulkDelete = () => {
    updateConfig({ subscribers: config.subscribers.filter((s) => !selectedIds.has(s.id)) });
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    toast(`Usuni\u0119to ${selectedIds.size} subskrybent\u00F3w`, 'success');
  };

  const handleExportCSV = () => {
    const subs = selectedIds.size > 0
      ? config.subscribers.filter((s) => selectedIds.has(s.id))
      : config.subscribers;

    const csv = [
      'Email,Data subskrypcji,\u0179r\u00F3d\u0142o',
      ...subs.map((s) => `"${s.email}","${s.subscribedAt}","${s.source}"`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Wyeksportowano ${subs.length} subskrybent\u00F3w`, 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700 }}>
          Newsletter ({config.subscribers.length})
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedIds.size > 0 && (
            <AdminButton variant="danger" size="sm" onClick={() => setConfirmBulkDelete(true)}>
              Usu\u0144 zaznaczone ({selectedIds.size})
            </AdminButton>
          )}
          <AdminButton variant="secondary" size="sm" onClick={handleExportCSV}>
            Eksport CSV {selectedIds.size > 0 ? `(${selectedIds.size})` : '(wszystkie)'}
          </AdminButton>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <AdminInput
          value={searchQuery}
          onChange={(v) => { setSearchQuery(v); setCurrentPage(0); }}
          placeholder="Szukaj subskrybent\u00F3w..."
        />
      </div>

      {filteredSubs.length === 0 ? (
        <EmptyState
          icon="📧"
          title="Brak subskrybent\u00F3w"
          subtitle="Subskrybenci zapisz\u0105 si\u0119 przez formularz newslettera na stronie"
        />
      ) : (
        <>
          <AdminCard style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${ADMIN_COLORS.border}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer', accentColor: ADMIN_COLORS.primary }}
                    />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: ADMIN_COLORS.textDim, fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: ADMIN_COLORS.textDim, fontWeight: 600 }}>Data</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: ADMIN_COLORS.textDim, fontWeight: 600 }}>\u0179r\u00F3d\u0142o</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: ADMIN_COLORS.textDim, fontWeight: 600 }}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {pageSubs.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: `1px solid ${ADMIN_COLORS.border}`,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = ADMIN_COLORS.bg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(s.id)}
                        onChange={() => toggleSelect(s.id)}
                        style={{ cursor: 'pointer', accentColor: ADMIN_COLORS.primary }}
                      />
                    </td>
                    <td style={{ padding: '10px 12px', color: ADMIN_COLORS.text, fontSize: '14px' }}>{s.email}</td>
                    <td style={{ padding: '10px 12px', color: ADMIN_COLORS.textDim, fontSize: '13px' }}>{s.subscribedAt.split('T')[0]}</td>
                    <td style={{ padding: '10px 12px' }}><Badge color="gray">{s.source}</Badge></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{
                          background: 'none', border: 'none', color: ADMIN_COLORS.textMuted,
                          cursor: 'pointer', fontSize: '16px', padding: '4px 8px', borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = ADMIN_COLORS.error; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = ADMIN_COLORS.textMuted; }}
                      >🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                \u2190 Poprzednia
              </AdminButton>
              <span style={{ color: ADMIN_COLORS.textDim, fontSize: '13px' }}>
                Strona {currentPage + 1} z {totalPages}
              </span>
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Nast\u0119pna \u2192
              </AdminButton>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmBulkDelete}
        title="Usun\u0105\u0107 zaznaczonych subskrybent\u00F3w?"
        message={`Czy na pewno chcesz usun\u0105\u0107 ${selectedIds.size} subskrybent\u00F3w? Tej operacji nie mo\u017Cna cofn\u0105\u0107.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
        confirmText={`Usu\u0144 ${selectedIds.size}`}
        danger
      />
    </div>
  );
}
