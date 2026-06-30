import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function LinkCard({ link, onEdit, onDelete, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link._id });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  const displayUrl = link.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div ref={setNodeRef} style={dndStyle} className="link-card">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isDragging ? 0.4 : link.isActive ? 1 : 0.5, y: 0 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 px-4 py-3"
      >
        {/* drag handle */}
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="shrink-0 cursor-grab touch-none text-[var(--border)] hover:text-[var(--ink-muted)]
                     active:cursor-grabbing focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="5.5"  cy="4"  r="1.2" />
            <circle cx="10.5" cy="4"  r="1.2" />
            <circle cx="5.5"  cy="8"  r="1.2" />
            <circle cx="10.5" cy="8"  r="1.2" />
            <circle cx="5.5"  cy="12" r="1.2" />
            <circle cx="10.5" cy="12" r="1.2" />
          </svg>
        </button>

        {/* icon */}
        {link.icon ? (
          <img src={link.icon} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg)] text-[var(--ink-muted)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 10-5.656-5.656l-1.101 1.102" />
            </svg>
          </div>
        )}

        {/* text */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--ink)]">{link.title}</p>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs text-[var(--ink-muted)] transition hover:text-[var(--accent)]"
          >
            {displayUrl}
          </a>
        </div>

        {/* click count */}
        <span className="shrink-0 text-xs tabular-nums text-[var(--ink-muted)]">
          {link.clicks} clicks
        </span>

        {/* active toggle */}
        <button
          onClick={() => onToggle(link)}
          aria-label={link.isActive ? 'Deactivate link' : 'Activate link'}
          className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
                     transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
          style={{ background: link.isActive ? 'var(--accent)' : 'var(--border)' }}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white shadow
                        transition-transform ${link.isActive ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>

        {/* edit */}
        <button
          onClick={() => onEdit(link)}
          aria-label="Edit link"
          className="shrink-0 rounded-lg p-1.5 text-[var(--ink-muted)] transition
                     hover:bg-[var(--bg)] hover:text-[var(--ink)] focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414A2 2 0 019.586 13z" />
          </svg>
        </button>

        {/* delete */}
        <button
          onClick={() => onDelete(link._id)}
          aria-label="Delete link"
          className="shrink-0 rounded-lg p-1.5 text-[var(--ink-muted)] transition
                     hover:bg-red-50 hover:text-red-500 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}
