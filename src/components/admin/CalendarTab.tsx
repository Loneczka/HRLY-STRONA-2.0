import { useState, useMemo } from 'react';
import { ADMIN_COLORS, AdminCard, Badge, EmptyState } from './ui';
import type { SiteConfig, ScheduledEvent } from '../../hooks/useSiteConfig';
import type { AdminTab } from './Sidebar';

export function CalendarTab({
  config,
  onTabChange,
}: {
  config: SiteConfig;
  onTabChange: (tab: AdminTab) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [filterType, setFilterType] = useState<'all' | 'blog' | 'social'>('all');

  const events = useMemo<ScheduledEvent[]>(() => {
    const blogEvents: ScheduledEvent[] = config.blogPosts
      .filter((p) => p.status === 'published' || p.status === 'scheduled')
      .map((p) => ({
        id: `evt_${p.id}`,
        type: 'blog' as const,
        title: p.title,
        blogPostId: p.id,
        scheduledAt: p.scheduledAt || p.publishedAt,
        color: '#3b82f6',
      }));

    const socialEvents: ScheduledEvent[] = config.blogPosts.flatMap((p) =>
      p.socialPosts
        .filter((s) => s.status === 'scheduled' || s.status === 'approved' || s.status === 'sent')
        .map((s) => ({
          id: `evt_${s.id}`,
          type: 'social' as const,
          title: s.content.substring(0, 50),
          socialPostId: s.id,
          blogPostId: p.id,
          platform: s.platform,
          scheduledAt: s.scheduledAt || s.sentAt || p.publishedAt,
          color: s.platform === 'linkedin' ? '#0a66c2' : s.platform === 'facebook' ? '#1877f2' : '#e4405f',
        }))
    );

    return [...blogEvents, ...socialEvents].filter((e) => {
      if (filterType === 'all') return true;
      return e.type === filterType;
    });
  }, [config.blogPosts, filterType]);

  const getEventsForDate = (date: string) => {
    return events.filter((e) => {
      if (!e.scheduledAt) return false;
      const eventDate = e.scheduledAt.split('T')[0];
      return eventDate === date;
    });
  };

  const monthNames = ['Stycze\u0144', 'Luty', 'Marzec', 'Kwiecie\u0144', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpie\u0144', 'Wrzesie\u0144', 'Pa\u017Adziernik', 'Listopad', 'Grudzie\u0144'];
  const dayNames = ['Pon', 'Wt', '\u015Ar', 'Czw', 'Pt', 'Sob', 'Nd'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.scheduledAt && e.scheduledAt >= todayStr)
      .sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''))
      .slice(0, 20);
  }, [events, todayStr]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700 }}>Kalendarz</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', background: ADMIN_COLORS.surface, borderRadius: '8px', padding: '3px' }}>
            {(['month', 'week', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: view === v ? ADMIN_COLORS.primary : 'transparent',
                  color: view === v ? 'white' : ADMIN_COLORS.textDim,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {v === 'month' ? 'Miesi\u0105c' : v === 'week' ? 'Tydzie\u0144' : 'Lista'}
              </button>
            ))}
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'blog' | 'social')}
            style={{
              background: ADMIN_COLORS.surface,
              border: `1px solid ${ADMIN_COLORS.border}`,
              borderRadius: '8px',
              padding: '8px 14px',
              color: ADMIN_COLORS.text,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="all">Wszystkie</option>
            <option value="blog">Artyku\u0142y</option>
            <option value="social">Social Media</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={prevMonth} style={{
            background: ADMIN_COLORS.surface, border: 'none', borderRadius: '8px',
            padding: '8px 12px', color: ADMIN_COLORS.text, cursor: 'pointer', fontSize: '16px',
          }}>\u2190</button>
          <h3 style={{ color: ADMIN_COLORS.text, fontSize: '18px', fontWeight: 600, minWidth: '200px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </h3>
          <button onClick={nextMonth} style={{
            background: ADMIN_COLORS.surface, border: 'none', borderRadius: '8px',
            padding: '8px 12px', color: ADMIN_COLORS.text, cursor: 'pointer', fontSize: '16px',
          }}>\u2192</button>
        </div>
        <button onClick={goToday} style={{
          background: ADMIN_COLORS.surfaceLight, border: 'none', borderRadius: '8px',
          padding: '8px 16px', color: ADMIN_COLORS.text, cursor: 'pointer', fontSize: '13px', fontWeight: 600,
        }}>Dzi\u015B</button>
      </div>

      {view === 'month' && (
        <AdminCard style={{ padding: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
            {dayNames.map((d) => (
              <div key={d} style={{
                textAlign: 'center',
                padding: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: ADMIN_COLORS.textMuted,
              }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {Array.from({ length: startOffset }, (_, i) => (
              <div key={`empty_${i}`} style={{ minHeight: '80px' }} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={dateStr}
                  style={{
                    minHeight: '80px',
                    background: isToday ? `${ADMIN_COLORS.primary}11` : ADMIN_COLORS.bg,
                    borderRadius: '8px',
                    padding: '6px',
                    border: isToday ? `1px solid ${ADMIN_COLORS.primary}` : `1px solid ${ADMIN_COLORS.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? ADMIN_COLORS.primary : ADMIN_COLORS.textDim,
                    marginBottom: '4px',
                  }}>{dayNum}</div>
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      onClick={() => e.type === 'blog' ? onTabChange('blog') : onTabChange('social')}
                      style={{
                        background: `${e.color}22`,
                        borderLeft: `3px solid ${e.color}`,
                        borderRadius: '4px',
                        padding: '3px 6px',
                        marginBottom: '2px',
                        fontSize: '10px',
                        color: ADMIN_COLORS.text,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.transform = 'translateX(2px)'; }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                      {e.type === 'social' && e.platform && `${e.platform[0].toUpperCase()} \u00B7 `}
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: '10px', color: ADMIN_COLORS.textMuted, padding: '2px 6px' }}>
                      +{dayEvents.length - 3} wi\u0119cej
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}

      {view === 'week' && (
        <AdminCard style={{ padding: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {weekDays.map((d) => {
              const dateStr = d.toISOString().split('T')[0];
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div key={dateStr} style={{
                  minHeight: '200px',
                  background: isToday ? `${ADMIN_COLORS.primary}11` : ADMIN_COLORS.bg,
                  borderRadius: '8px',
                  padding: '8px',
                  border: isToday ? `1px solid ${ADMIN_COLORS.primary}` : `1px solid ${ADMIN_COLORS.border}`,
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? ADMIN_COLORS.primary : ADMIN_COLORS.text,
                    marginBottom: '8px',
                  }}>
                    {dayNames[(d.getDay() + 6) % 7]} {d.getDate()}
                  </div>
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => e.type === 'blog' ? onTabChange('blog') : onTabChange('social')}
                      style={{
                        background: `${e.color}22`,
                        borderLeft: `3px solid ${e.color}`,
                        borderRadius: '6px',
                        padding: '6px 8px',
                        marginBottom: '4px',
                        fontSize: '11px',
                        color: ADMIN_COLORS.text,
                        cursor: 'pointer',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.transform = 'translateX(2px)'; }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                      <Badge color={e.type === 'blog' ? 'primary' : 'accent'}>
                        {e.type === 'blog' ? 'Blog' : e.platform}
                      </Badge>
                      <div style={{ marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.title}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}

      {view === 'list' && (
        <AdminCard>
          {upcomingEvents.length === 0 ? (
            <EmptyState icon="📅" title="Brak nadchodz\u0105cych wydarze\u0144" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  onClick={() => e.type === 'blog' ? onTabChange('blog') : onTabChange('social')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: ADMIN_COLORS.bg,
                    cursor: 'pointer',
                    borderLeft: `3px solid ${e.color}`,
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(ev) => { ev.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={(ev) => { ev.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{
                    fontSize: '12px',
                    color: ADMIN_COLORS.textMuted,
                    minWidth: '100px',
                    fontWeight: 600,
                  }}>
                    {e.scheduledAt?.split('T')[0]}
                  </div>
                  <Badge color={e.type === 'blog' ? 'primary' : 'accent'}>
                    {e.type === 'blog' ? 'Blog' : e.platform}
                  </Badge>
                  <div style={{ color: ADMIN_COLORS.text, fontSize: '14px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {e.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      )}
    </div>
  );
}
