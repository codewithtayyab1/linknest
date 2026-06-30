import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import api from '../api/axios';
import { Helmet } from 'react-helmet-async';

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

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const linkVariant = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function Skeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--bg)] px-4 pt-16">
      <div className="mb-3 h-24 w-24 animate-pulse rounded-full bg-[var(--border)]" />
      <div className="mb-2 h-5 w-40 animate-pulse rounded-lg bg-[var(--border)]" />
      <div className="mb-8 h-3 w-56 animate-pulse rounded bg-[var(--border)] opacity-60" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-3 h-12 w-full max-w-sm animate-pulse rounded-xl bg-[var(--border)]" />
      ))}
    </div>
  );
}

function NotFound({ username }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4 text-center">
      <p className="mb-3 text-[5rem] font-bold leading-none text-[var(--border)]">404</p>
      <h1 className="mb-1.5 text-xl">Profile not found</h1>
      <p className="mb-8 text-sm text-[var(--ink-muted)]">
        <span className="font-mono text-[var(--ink)]">@{username}</span> doesn't exist or has been removed.
      </p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  );
}

function NetworkError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4 text-center">
      <svg className="mb-5 h-12 w-12 text-[var(--border)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
      <h1 className="mb-1.5 text-xl">Something went wrong</h1>
      <p className="mb-8 text-sm text-[var(--ink-muted)]">Couldn't load this profile. Please try again later.</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  );
}

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [links, setLinks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    api.get(`/public/${username}`)
      .then(({ data }) => { setProfile(data.profile); setLinks(data.links); })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    const font = profile?.theme?.font;
    const url  = GOOGLE_FONT_URLS[font];
    if (!url) return;
    const id = `gfont-${font}`;
    if (!document.getElementById(id)) {
      const el = Object.assign(document.createElement('link'), { id, rel: 'stylesheet', href: url });
      document.head.appendChild(el);
    }
  }, [profile?.theme?.font]);

  if (loading)    return <Skeleton />;
  if (notFound)   return <NotFound username={username} />;
  if (loadError)  return <NetworkError />;

  const { displayName, bio, profilePhoto, theme } = profile;
  const bg      = theme?.backgroundColor || '#ffffff';
  const fg      = theme?.textColor       || '#111827';
  const accent  = theme?.primaryColor    || '#6366f1';
  const font    = FONT_FAMILIES[theme?.font] || FONT_FAMILIES.inter;
  const layout  = theme?.layout || 'list';

  const gridClass =
    layout === 'grid'    ? 'grid grid-cols-2 gap-3'  :
    layout === 'compact' ? 'flex flex-col gap-2'      :
                           'flex flex-col gap-3';

  const handleLinkClick = (link) => {
    api.post(`/public/${username}/click/${link._id}`).catch(() => {});
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const seoTitle = `${displayName || `@${username}`} | LinkNest`;
  const seoDesc  = bio?.trim() || `Check out ${displayName || username}'s links on LinkNest.`;
  const seoUrl   = window.location.href;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description"        content={seoDesc} />
        <meta property="og:type"        content="profile" />
        <meta property="og:title"       content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url"         content={seoUrl} />
        {profilePhoto && <meta property="og:image" content={profilePhoto} />}
        <meta name="twitter:card"        content={profilePhoto ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title"       content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        {profilePhoto && <meta name="twitter:image" content={profilePhoto} />}
      </Helmet>
      <div className="min-h-screen" style={{ background: bg, fontFamily: font, color: fg }}>
      <div className="mx-auto max-w-[480px] px-4 pb-16 pt-14">

        {/* profile header */}
        <motion.div
          className="mb-10 flex flex-col items-center text-center"
          initial={reduced ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={displayName || username}
              className="mb-4 h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-white/40"
            />
          ) : (
            <div
              className="mb-4 flex h-24 w-24 items-center justify-center rounded-full
                         text-3xl font-semibold text-white shadow-md"
              style={{ background: accent }}
            >
              {(displayName || username)[0].toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl font-semibold leading-tight" style={{ color: fg }}>
            {displayName || `@${username}`}
          </h1>

          {bio && (
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed" style={{ color: fg, opacity: 0.6 }}>
              {bio}
            </p>
          )}
        </motion.div>

        {/* links */}
        {links.length > 0 ? (
          <motion.div
            className={gridClass}
            variants={reduced ? {} : stagger}
            initial="hidden"
            animate="show"
          >
            {links.map((link) => (
              <motion.button
                key={link._id}
                variants={reduced ? {} : linkVariant}
                onClick={() => handleLinkClick(link)}
                whileHover={reduced ? {} : { scale: 1.02 }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl
                           border border-white/20 px-4 py-3.5 text-sm font-semibold
                           text-white shadow-sm transition-shadow hover:shadow-md"
                style={{ background: accent }}
              >
                {link.icon && (
                  <img
                    src={link.icon}
                    alt=""
                    className="h-5 w-5 rounded object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                {link.title}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-sm" style={{ opacity: 0.4 }}>No links yet.</p>
        )}

        {/* subtle footer */}
        <p className="mt-16 text-center text-xs font-medium" style={{ opacity: 0.25 }}>
          LinkNest
        </p>
      </div>
    </div>
    </>
  );
}
