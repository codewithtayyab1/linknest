import { useEffect } from 'react';

const FONT_FAMILIES = {
  inter:   "'Inter', system-ui, sans-serif",
  roboto:  "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
  mono:    "'Fira Code', monospace",
};

const GOOGLE_FONT_URLS = {
  roboto:  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap',
  mono:    'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap',
};

const MOCK_LINKS = ['My Website', 'GitHub', 'Twitter / X', 'LinkedIn'];

export default function ProfilePreview({ form }) {
  const { displayName, bio, profilePhoto, theme } = form;
  const fontFamily = FONT_FAMILIES[theme.font] || FONT_FAMILIES.inter;

  useEffect(() => {
    const url = GOOGLE_FONT_URLS[theme.font];
    if (!url) return;
    const id = `gfont-${theme.font}`;
    if (!document.getElementById(id)) {
      const el = document.createElement('link');
      el.id = id;
      el.rel = 'stylesheet';
      el.href = url;
      document.head.appendChild(el);
    }
  }, [theme.font]);

  const linkClass =
    theme.layout === 'grid'
      ? 'grid grid-cols-2 gap-2'
      : theme.layout === 'compact'
      ? 'flex flex-col gap-1'
      : 'flex flex-col gap-2';

  const btnPad = theme.layout === 'compact' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm';

  return (
    <div className="ln-card overflow-hidden">
      {/* browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] bg-[var(--bg)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-2 truncate font-mono text-xs text-[var(--ink-muted)]">
          linknest.app/{'{username}'}
        </span>
      </div>

      {/* content */}
      <div
        className="min-h-[420px] p-6"
        style={{ background: theme.backgroundColor, fontFamily, color: theme.textColor }}
      >
        {/* profile header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt=""
              onError={(e) => { e.target.style.display = 'none'; }}
              className="mb-3 h-16 w-16 rounded-full object-cover ring-2 ring-white/40 shadow-sm"
            />
          ) : (
            <div
              className="mb-3 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold text-white shadow-sm"
              style={{ background: theme.primaryColor }}
            >
              {(displayName || 'U')[0].toUpperCase()}
            </div>
          )}
          <p className="text-base font-semibold leading-tight" style={{ color: theme.textColor }}>
            {displayName || 'Your Name'}
          </p>
          {bio && (
            <p className="mt-1 max-w-[200px] text-xs leading-relaxed opacity-60">{bio}</p>
          )}
        </div>

        {/* mock links */}
        <div className={linkClass}>
          {MOCK_LINKS.map((title) => (
            <div
              key={title}
              className={`${btnPad} rounded-xl text-center font-medium text-white cursor-default truncate border border-white/20`}
              style={{ background: theme.primaryColor }}
            >
              {title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
