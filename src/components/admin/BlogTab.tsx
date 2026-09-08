import { useState, useEffect, useRef, useCallback, type MutableRefObject } from 'react';
import { ADMIN_COLORS, AdminButton, AdminInput, AdminTextarea, AdminLabel, AdminCard, Badge, EmptyState, ConfirmDialog, Modal } from './ui';
import { useToast } from './Toast';
import { COPYWRITING_FRAMEWORKS } from '../../hooks/useSiteConfig';
import type { BlogPost, SocialPost, SiteConfig } from '../../hooks/useSiteConfig';

export function BlogTab({
  config,
  updateConfig,
}: {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
  const { toast } = useToast();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredPosts = config.blogPosts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSavePost = useCallback((post: BlogPost) => {
    const existing = config.blogPosts.find((p) => p.id === post.id);
    let updatedPosts: BlogPost[];
    if (existing) {
      updatedPosts = config.blogPosts.map((p) => p.id === post.id ? post : p);
    } else {
      updatedPosts = [post, ...config.blogPosts];
    }
    updateConfig({ blogPosts: updatedPosts });
    setHasUnsavedChanges(false);
    setEditingPost(null);
    setIsCreating(false);
    toast(existing ? 'Artyku\u0142 zapisany' : 'Artyku\u0142 utworzony', 'success');
  }, [config.blogPosts, updateConfig, toast]);

  const handleDeletePost = (id: string) => {
    const updatedPosts = config.blogPosts.filter((p) => p.id !== id);
    updateConfig({ blogPosts: updatedPosts });
    setConfirmDelete(null);
    toast('Artyku\u0142 usuni\u0119ty', 'success');
  };

  const handleStartNew = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation(() => () => {
        setEditingPost({ id: "bp_new_" + Date.now(), title: "", slug: "", excerpt: "", content: "", category: "", tags: [], author: "", publishedAt: new Date().toISOString().split("T")[0], status: "draft", seoTitle: "", seoDescription: "", copywritingFramework: "", socialPosts: [] });
        setIsCreating(true);
        setHasUnsavedChanges(false);
      });
    } else {
      setEditingPost({ id: "bp_new_" + Date.now(), title: "", slug: "", excerpt: "", content: "", category: "", tags: [], author: "", publishedAt: new Date().toISOString().split("T")[0], status: "draft", seoTitle: "", seoDescription: "", copywritingFramework: "", socialPosts: [] });
      setIsCreating(true);
    }
  };

  const handleStartEdit = (post: BlogPost) => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation(() => () => {
        setEditingPost({ ...post });
        setIsCreating(false);
        setHasUnsavedChanges(false);
      });
    } else {
      setEditingPost({ ...post });
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation(() => () => {
        setEditingPost(null);
        setIsCreating(false);
        setHasUnsavedChanges(false);
      });
    } else {
      setEditingPost(null);
      setIsCreating(false);
    }
  };

  const confirmNavigation = () => {
    setShowUnsavedWarning(false);
    setHasUnsavedChanges(false);
    if (pendingNavigation) pendingNavigation();
    setPendingNavigation(null);
  };

  if (editingPost) {
    return (
      <BlogPostEditor
        post={editingPost}
        onSave={handleSavePost}
        onBack={handleBack}
        onDirty={() => setHasUnsavedChanges(true)}
        autosaveTimer={autosaveTimer}
        allPosts={config.blogPosts}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: ADMIN_COLORS.text, fontSize: '24px', fontWeight: 700 }}>
          Artyku\u0142y ({config.blogPosts.length})
        </h2>
        <AdminButton onClick={handleStartNew}>+ Nowy artyku\u0142</AdminButton>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <AdminInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Szukaj artyku\u0142\u00F3w..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: ADMIN_COLORS.bg,
            border: `1px solid ${ADMIN_COLORS.border}`,
            borderRadius: '8px',
            padding: '10px 14px',
            color: ADMIN_COLORS.text,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="all">Wszystkie statusy</option>
          <option value="published">Opublikowane</option>
          <option value="draft">Szkice</option>
          <option value="scheduled">Zaplanowane</option>
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Brak artyku\u0142\u00F3w"
          subtitle={searchQuery ? 'Spr\u00F3buj zmieni\u0107 kryteria wyszukiwania' : 'Utw\u00F3rz pierwszy artyku\u0142 na blogu'}
          action={<AdminButton onClick={handleStartNew}>+ Nowy artyku\u0142</AdminButton>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPosts.map((post) => (
            <AdminCard
              key={post.id}
              onClick={() => handleStartEdit(post)}
              style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '8px',
                    background: ADMIN_COLORS.surfaceLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>📄</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ color: ADMIN_COLORS.text, fontSize: '15px', fontWeight: 600, margin: 0 }}>
                      {post.title}
                    </h3>
                    <Badge color={post.status === 'published' ? 'success' : post.status === 'draft' ? 'gray' : 'primary'}>
                      {post.status}
                    </Badge>
                  </div>
                  <div style={{ color: ADMIN_COLORS.textDim, fontSize: '13px', marginBottom: '6px' }}>
                    {post.category} \u00B7 {post.author} \u00B7 {post.publishedAt}
                  </div>
                  <div style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px' }}>
                    {post.socialPosts.length} post\u00F3w SM \u00B7 {post.tags.join(', ')}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(post.id); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: ADMIN_COLORS.textMuted,
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '8px',
                    borderRadius: '6px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ADMIN_COLORS.error; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ADMIN_COLORS.textMuted; }}
                >
                  🗑
                </button>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Usun\u0105\u0107 artyku\u0142?"
        message="Czy na pewno chcesz usun\u0105\u0107 ten artyku\u0142? Tej operacji nie mo\u017Cna cofn\u0105\u0107."
        onConfirm={() => confirmDelete && handleDeletePost(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Usu\u0144"
        danger
      />

      <ConfirmDialog
        open={showUnsavedWarning}
        title="Niezapisane zmiany"
        message="Masz niezapisane zmiany w edytorze. Czy na pewno chcesz je odrzuci\u0107?"
        onConfirm={confirmNavigation}
        onCancel={() => { setShowUnsavedWarning(false); setPendingNavigation(null); }}
        confirmText="Odrzu\u0107 i kontynuuj"
        danger
      />
    </div>
  );
}

function BlogPostEditor({
  post,
  onSave,
  onBack,
  onDirty,
  autosaveTimer,
  allPosts,
}: {
  post: BlogPost;
  onSave: (post: BlogPost) => void;
  onBack: () => void;
  onDirty: () => void;
  autosaveTimer: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  allPosts: BlogPost[];
}) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<BlogPost>(post);
  const [showSocialComposer, setShowSocialComposer] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = draft.content.split(/\s+/).filter(Boolean).length;
  const charCount = draft.content.length;

  const update = (updates: Partial<BlogPost>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
    onDirty();
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      toast('Autozapis...', 'info');
    }, 30000);
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast('Wybierz plik obrazu', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update({ imageUrl: reader.result as string });
      toast('Obraz wgrany', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: { preventDefault: () => void; dataTransfer: { files: FileList | null } }) => {
    e.preventDefault();
    setDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleSave = () => {
    if (!draft.title.trim()) {
      toast('Tytu\u0142 jest wymagany', 'error');
      return;
    }
    if (!draft.slug.trim()) {
      update({ slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') });
    }
    onSave(draft);
  };

  const addSocialPost = (sp: SocialPost) => {
    update({ socialPosts: [...draft.socialPosts, sp] });
    setShowSocialComposer(false);
    toast('Post SM dodany', 'success');
  };

  const removeSocialPost = (id: string) => {
    update({ socialPosts: draft.socialPosts.filter((s) => s.id !== id) });
  };

  const updateSocialPost = (id: string, updates: Partial<SocialPost>) => {
    update({
      socialPosts: draft.socialPosts.map((s) => s.id === id ? { ...s, ...updates } : s),
    });
  };

  if (fullscreen) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: ADMIN_COLORS.bg, zIndex: 8000, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <AdminButton variant="ghost" onClick={() => setFullscreen(false)}>\u2190 Wyjd\u017A z trybu pe\u0142noekranowego</AdminButton>
          <AdminButton onClick={handleSave}>Zapisz</AdminButton>
        </div>
        <AdminInput
          value={draft.title}
          onChange={(v) => update({ title: v })}
          placeholder="Tytu\u0142 artyku\u0142u..."
          style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}
        />
        <textarea
          value={draft.content}
          onChange={(e) => update({ content: e.target.value })}
          style={{
            flex: 1,
            background: ADMIN_COLORS.surface,
            border: `1px solid ${ADMIN_COLORS.border}`,
            borderRadius: '12px',
            padding: '20px',
            color: ADMIN_COLORS.text,
            fontSize: '15px',
            lineHeight: 1.8,
            resize: 'none',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px', marginTop: '8px', textAlign: 'right' }}>
          {wordCount} s\u0142\u00F3w \u00B7 {charCount} znak\u00F3w
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AdminButton variant="ghost" onClick={onBack}>\u2190 Powr\u00F3t</AdminButton>
          <span style={{ color: ADMIN_COLORS.textMuted, fontSize: '13px' }}>
            {allPosts.find((p) => p.id === draft.id) ? 'Edycja' : 'Nowy artyku\u0142'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <AdminButton variant="ghost" onClick={() => setFullscreen(true)}>
            \u26F6 Pe\u0142ny ekran
          </AdminButton>
          <AdminButton onClick={handleSave}>Zapisz</AdminButton>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }} className="admin-editor-layout">
        <div style={{ flex: 1, minWidth: '300px' }}>
          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Tytu\u0142</AdminLabel>
            <AdminInput
              value={draft.title}
              onChange={(v) => update({ title: v })}
              placeholder="Tytu\u0142 artyku\u0142u..."
            />
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Slug (URL)</AdminLabel>
            <AdminInput
              value={draft.slug}
              onChange={(v) => update({ slug: v })}
              placeholder="url-artykulu"
            />
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Tre\u015B\u0107 (HTML)</AdminLabel>
            <AdminTextarea
              value={draft.content}
              onChange={(v) => update({ content: v })}
              rows={16}
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: ADMIN_COLORS.textMuted, fontSize: '12px' }}>
                {wordCount} s\u0142\u00F3w \u00B7 {charCount} znak\u00F3w
              </span>
            </div>
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Excerpt</AdminLabel>
            <AdminTextarea
              value={draft.excerpt}
              onChange={(v) => update({ excerpt: v })}
              rows={3}
              placeholder="Kr\u00F3tki opis artyku\u0142u..."
            />
          </AdminCard>

          <AdminCard>
            <AdminLabel>Obrazek wyr\u00F3\u017Cniaj\u0105cy</AdminLabel>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragOver ? ADMIN_COLORS.primary : ADMIN_COLORS.border}`,
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                background: dragOver ? `${ADMIN_COLORS.primary}11` : ADMIN_COLORS.bg,
              }}
            >
              {draft.imageUrl ? (
                <div>
                  <img src={draft.imageUrl} alt="Thumbnail" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '12px' }} />
                  <div style={{ color: ADMIN_COLORS.textDim, fontSize: '13px' }}>Kliknij lub przeci\u0105gnij, aby zmieni\u0107</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                  <div style={{ color: ADMIN_COLORS.textDim, fontSize: '13px' }}>
                    Kliknij lub przeci\u0105gnij obraz tutaj
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              style={{ display: 'none' }}
            />
            {draft.imageUrl && (
              <AdminButton variant="ghost" size="sm" style={{ marginTop: '8px' }} onClick={() => update({ imageUrl: undefined })}>
                Usu\u0144 obraz
              </AdminButton>
            )}
          </AdminCard>
        </div>

        <div style={{ width: '300px', flexShrink: 0 }} className="admin-editor-sidebar">
          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Status</AdminLabel>
            <select
              value={draft.status}
              onChange={(e) => update({ status: e.target.value as BlogPost['status'] })}
              style={{
                background: ADMIN_COLORS.bg,
                border: `1px solid ${ADMIN_COLORS.border}`,
                borderRadius: '8px',
                padding: '10px 14px',
                color: ADMIN_COLORS.text,
                fontSize: '14px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <option value="draft">Szkic</option>
              <option value="published">Opublikowany</option>
              <option value="scheduled">Zaplanowany</option>
            </select>
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Kategoria</AdminLabel>
            <AdminInput
              value={draft.category}
              onChange={(v) => update({ category: v })}
              placeholder="Np. Analityka HR"
            />
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Autor</AdminLabel>
            <AdminInput
              value={draft.author}
              onChange={(v) => update({ author: v })}
              placeholder="Imi\u0119 i nazwisko"
            />
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Data publikacji</AdminLabel>
            <AdminInput
              type="date"
              value={draft.publishedAt}
              onChange={(v) => update({ publishedAt: v })}
            />
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Tagi (oddzielone przecinkami)</AdminLabel>
            <AdminInput
              value={draft.tags.join(', ')}
              onChange={(v) => update({ tags: v.split(',').map((t) => t.trim()).filter(Boolean) })}
              placeholder="tag1, tag2, tag3"
            />
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>Framework copywriterski</AdminLabel>
            <select
              value={draft.copywritingFramework}
              onChange={(e) => update({ copywritingFramework: e.target.value })}
              style={{
                background: ADMIN_COLORS.bg,
                border: `1px solid ${ADMIN_COLORS.border}`,
                borderRadius: '8px',
                padding: '10px 14px',
                color: ADMIN_COLORS.text,
                fontSize: '14px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <option value="">Brak</option>
              {COPYWRITING_FRAMEWORKS.map((fw) => (
                <option key={fw.id} value={fw.id}>{fw.icon} {fw.name}</option>
              ))}
            </select>
          </AdminCard>

          <AdminCard style={{ marginBottom: '16px' }}>
            <AdminLabel>SEO Title</AdminLabel>
            <AdminInput
              value={draft.seoTitle}
              onChange={(v) => update({ seoTitle: v })}
              placeholder="Tytu\u0142 SEO..."
            />
            <div style={{ height: '8px' }} />
            <AdminLabel>SEO Description</AdminLabel>
            <AdminTextarea
              value={draft.seoDescription}
              onChange={(v) => update({ seoDescription: v })}
              rows={2}
            />
          </AdminCard>

          <AdminCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <AdminLabel style={{ margin: 0 }}>Posty Social Media</AdminLabel>
              <AdminButton size="sm" onClick={() => setShowSocialComposer(true)}>+ Dodaj</AdminButton>
            </div>
            {draft.socialPosts.length === 0 ? (
              <p style={{ color: ADMIN_COLORS.textMuted, fontSize: '13px' }}>Brak post\u00F3w SM</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {draft.socialPosts.map((sp) => (
                  <SocialPostCard
                    key={sp.id}
                    post={sp}
                    onUpdate={(updates) => updateSocialPost(sp.id, updates)}
                    onRemove={() => removeSocialPost(sp.id)}
                  />
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      </div>

      <Modal
        open={showSocialComposer}
        onClose={() => setShowSocialComposer(false)}
        title="Nowy post Social Media"
        maxWidth={700}
      >
        <SocialPostForm onAdd={addSocialPost} onCancel={() => setShowSocialComposer(false)} />
      </Modal>
    </div>
  );
}

function SocialPostCard({
  post,
  onUpdate,
  onRemove,
}: {
  post: SocialPost;
  onUpdate: (updates: Partial<SocialPost>) => void;
  onRemove: () => void;
  key?: string;
}) {
  const platformIcons: Record<string, string> = { instagram: '📷', facebook: '📲', linkedin: '💼' };
  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'primary' | 'gray'> = {
    draft: 'gray', approved: 'primary', scheduled: 'warning', sent: 'success', error: 'error',
  };
  return (
    <div style={{
      background: ADMIN_COLORS.bg,
      borderRadius: '8px',
      padding: '12px',
      border: `1px solid ${ADMIN_COLORS.border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{platformIcons[post.platform]}</span>
          <Badge color={statusColors[post.status]}>{post.status}</Badge>
        </div>
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', color: ADMIN_COLORS.textMuted, cursor: 'pointer', fontSize: '16px' }}
        >\u00D7</button>
      </div>
      <p style={{ color: ADMIN_COLORS.textDim, fontSize: '12px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {post.content.substring(0, 80)}...
      </p>
      {post.hashtags && (
        <p style={{ color: ADMIN_COLORS.accent, fontSize: '11px', margin: '4px 0 0 0' }}>{post.hashtags}</p>
      )}
      <select
        value={post.status}
        onChange={(e) => onUpdate({ status: e.target.value as SocialPost['status'] })}
        style={{
          background: ADMIN_COLORS.surface,
          border: `1px solid ${ADMIN_COLORS.border}`,
          borderRadius: '6px',
          padding: '4px 8px',
          color: ADMIN_COLORS.text,
          fontSize: '12px',
          marginTop: '6px',
          cursor: 'pointer',
        }}
      >
        <option value="draft">Draft</option>
        <option value="approved">Approved</option>
        <option value="scheduled">Scheduled</option>
        <option value="sent">Sent</option>
        <option value="error">Error</option>
      </select>
    </div>
  );
}

function SocialPostForm({
  onAdd,
  onCancel,
}: {
  onAdd: (sp: SocialPost) => void;
  onCancel: () => void;
}) {
  const [platform, setPlatform] = useState<SocialPost['platform']>('linkedin');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [framework, setFramework] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const limits: Record<string, number> = { instagram: 2200, facebook: 5000, linkedin: 3000 };
  const limit = limits[platform];
  const progress = content.length / limit;
  const progressColor = progress > 0.9 ? ADMIN_COLORS.error : progress > 0.7 ? ADMIN_COLORS.warning : ADMIN_COLORS.success;

  const handleAdd = () => {
    if (!content.trim()) return;
    onAdd({
      id: `sp_${Date.now()}`,
      platform,
      content,
      hashtags,
      framework,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt || undefined,
      mediaUrls: [],
      mediaTypes: [],
      makeWebhookSent: false,
    });
  };

  return (
    <div>
      <AdminLabel>Platforma</AdminLabel>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['linkedin', 'facebook', 'instagram'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${platform === p ? ADMIN_COLORS.primary : ADMIN_COLORS.border}`,
              background: platform === p ? `${ADMIN_COLORS.primary}22` : ADMIN_COLORS.bg,
              color: platform === p ? ADMIN_COLORS.primary : ADMIN_COLORS.textDim,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {p === 'linkedin' ? '💼' : p === 'facebook' ? '📲' : '📷'} {p}
          </button>
        ))}
      </div>

      <AdminLabel>Tre\u015B\u0107 postu</AdminLabel>
      <AdminTextarea
        value={content}
        onChange={setContent}
        rows={6}
        placeholder="Tre\u015B\u0107 posta..."
      />
      <div style={{ marginTop: '6px' }}>
        <div style={{
          height: '4px',
          background: ADMIN_COLORS.surfaceLight,
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(progress * 100, 100)}%`,
            background: progressColor,
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ color: ADMIN_COLORS.textMuted, fontSize: '11px' }}>
            {content.length} / {limit} znak\u00F3w
          </span>
          <span style={{ color: progressColor, fontSize: '11px', fontWeight: 600 }}>
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>

      <div style={{ height: '12px' }} />
      <AdminLabel>Hashtagi</AdminLabel>
      <AdminInput
        value={hashtags}
        onChange={setHashtags}
        placeholder="#hr #hrly #analityka"
      />

      <div style={{ height: '12px' }} />
      <AdminLabel>Framework</AdminLabel>
      <select
        value={framework}
        onChange={(e) => setFramework(e.target.value)}
        style={{
          background: ADMIN_COLORS.bg,
          border: `1px solid ${ADMIN_COLORS.border}`,
          borderRadius: '8px',
          padding: '10px 14px',
          color: ADMIN_COLORS.text,
          fontSize: '14px',
          width: '100%',
          cursor: 'pointer',
        }}
      >
        <option value="">Brak</option>
        {COPYWRITING_FRAMEWORKS.map((fw) => (
          <option key={fw.id} value={fw.id}>{fw.icon} {fw.name}</option>
        ))}
      </select>

      <div style={{ height: '12px' }} />
      <AdminLabel>Data publikacji (opcjonalnie)</AdminLabel>
      <AdminInput
        type="datetime-local"
        value={scheduledAt}
        onChange={setScheduledAt}
      />

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <AdminButton variant="ghost" onClick={onCancel}>Anuluj</AdminButton>
        <AdminButton onClick={handleAdd}>Dodaj post</AdminButton>
      </div>
    </div>
  );
}
