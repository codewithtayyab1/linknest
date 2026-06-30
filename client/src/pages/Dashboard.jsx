import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LinkCard from '../components/LinkCard';
import LinkForm from '../components/LinkForm';
import Logo from '../components/Logo';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  const sensors = useSensors(
    // 8px distance threshold so clicks on buttons inside the card still fire
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    api.get('/links')
      .then(({ data }) => setLinks(data.links))
      .catch(() => setError('Failed to load links.'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditingLink(null); setFormOpen(true); };
  const openEdit   = (link) => { setEditingLink(link); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setEditingLink(null); };

  const handleCreate = async (fields) => {
    const { data } = await api.post('/links', fields);
    setLinks((prev) => [...prev, data.link]);
    closeForm();
  };

  const handleUpdate = async (fields) => {
    const { data } = await api.put(`/links/${editingLink._id}`, fields);
    setLinks((prev) => prev.map((l) => (l._id === editingLink._id ? data.link : l)));
    closeForm();
  };

  const handleDelete = async (id) => {
    const snapshot = links.find((l) => l._id === id);
    setLinks((prev) => prev.filter((l) => l._id !== id));
    try {
      await api.delete(`/links/${id}`);
    } catch {
      setLinks((prev) => [...prev, snapshot].sort((a, b) => a.order - b.order));
    }
  };

  const handleToggle = async (link) => {
    setLinks((prev) =>
      prev.map((l) => (l._id === link._id ? { ...l, isActive: !l.isActive } : l))
    );
    try {
      await api.put(`/links/${link._id}`, { isActive: !link.isActive });
    } catch {
      setLinks((prev) =>
        prev.map((l) => (l._id === link._id ? { ...l, isActive: link.isActive } : l))
      );
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l._id === active.id);
    const newIndex = links.findIndex((l) => l._id === over.id);
    const previous = links;
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }));

    setLinks(reordered);
    try {
      await api.put('/links/reorder', {
        links: reordered.map(({ _id, order }) => ({ id: _id, order })),
      });
    } catch {
      setLinks(previous);
    }
  };

  return (
    <div className="min-h-screen page-gradient-subtle">
      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Logo />

          <div className="flex items-center gap-1">
            <span className="mr-2 hidden text-xs text-[var(--ink-muted)] sm:block">
              /{user?.username}
            </span>
            <div className="mr-1 hidden h-4 w-px bg-[var(--border)] sm:block" />
            <Link to="/analytics" className="btn-nav">Analytics</Link>
            <Link to="/settings"  className="btn-nav">Settings</Link>
            <div className="mx-1 h-4 w-px bg-[var(--border)]" />
            <button onClick={logout} className="btn-nav">Log out</button>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg">Your links</h1>
          <button onClick={openCreate} className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add link
          </button>
        </div>

        {error && <p className="error-banner mb-5">{error}</p>}

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-xl bg-[var(--border)]" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div
            className="flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-16 text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <svg className="mb-4 h-10 w-10 text-[var(--border)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            <p className="text-sm font-semibold text-[var(--ink)]">No links yet</p>
            <p className="mt-1 mb-5 text-sm text-[var(--ink-muted)]">Add your first link to start sharing.</p>
            <button onClick={openCreate} className="btn-primary">Add your first link</button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((l) => l._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {links.map((link) => (
                    <LinkCard
                      key={link._id}
                      link={link}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {formOpen && (
        <LinkForm
          defaultValues={editingLink ?? undefined}
          onSubmit={editingLink ? handleUpdate : handleCreate}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
