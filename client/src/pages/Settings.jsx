import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProfilePreview from '../components/ProfilePreview';
import Logo from '../components/Logo';

const FONTS = [
  { value: 'inter',   label: 'Inter'   },
  { value: 'roboto',  label: 'Roboto'  },
  { value: 'poppins', label: 'Poppins' },
  { value: 'mono',    label: 'Mono'    },
];

const LAYOUTS = [
  { value: 'list',    label: 'List'    },
  { value: 'grid',    label: 'Grid'    },
  { value: 'compact', label: 'Compact' },
];

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="ln-label">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-9 shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer rounded-lg border-0 p-0 opacity-0"
          />
          <div
            className="h-9 w-9 rounded-lg border border-[var(--border)] shadow-sm"
            style={{ background: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="ln-input w-28 font-mono"
          style={{ width: '7rem' }}
        />
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    displayName:  user?.displayName  || '',
    bio:          user?.bio          || '',
    profilePhoto: user?.profilePhoto || '',
    theme: {
      primaryColor:    user?.theme?.primaryColor    || '#6366f1',
      backgroundColor: user?.theme?.backgroundColor || '#ffffff',
      textColor:       user?.theme?.textColor       || '#111827',
      font:            user?.theme?.font            || 'inter',
      layout:          user?.theme?.layout          || 'grid',
    },
  });
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState('');

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const setTheme = (key, val) =>
    setForm((prev) => ({ ...prev, theme: { ...prev.theme, [key]: val } }));

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');
    try {
      await updateProfile(form);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen page-gradient-subtle">
      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="hidden select-none text-[var(--border)] sm:block">/</span>
            <Link to="/dashboard" className="btn-nav hidden sm:inline-flex">Dashboard</Link>
            <span className="hidden select-none text-[var(--border)] sm:block">/</span>
            <span className="hidden text-sm font-medium text-[var(--ink-muted)] sm:block">Settings</span>
          </div>
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="btn-primary"
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {errorMsg && <p className="error-banner mb-6">{errorMsg}</p>}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">

          {/* ── left: form ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* profile section */}
            <section className="ln-card p-6">
              <h2 className="mb-5 text-sm font-semibold text-[var(--ink)]">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="ln-label">Display name</label>
                  <input
                    type="text"
                    className="ln-input"
                    placeholder="Your Name"
                    maxLength={50}
                    value={form.displayName}
                    onChange={(e) => set('displayName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="ln-label">Bio</label>
                  <textarea
                    className="ln-input resize-none"
                    rows={3}
                    placeholder="A short bio…"
                    maxLength={300}
                    value={form.bio}
                    onChange={(e) => set('bio', e.target.value)}
                  />
                  <p className="mt-1 text-right text-xs text-[var(--ink-muted)]">{form.bio.length}/300</p>
                </div>
                <div>
                  <label className="ln-label">Profile photo URL</label>
                  <input
                    type="url"
                    className="ln-input"
                    placeholder="https://example.com/photo.jpg"
                    value={form.profilePhoto}
                    onChange={(e) => set('profilePhoto', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* appearance section */}
            <section className="ln-card p-6">
              <h2 className="mb-5 text-sm font-semibold text-[var(--ink)]">Appearance</h2>
              <div className="space-y-5">

                {/* colors */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <ColorField
                    label="Background"
                    value={form.theme.backgroundColor}
                    onChange={(v) => setTheme('backgroundColor', v)}
                  />
                  <ColorField
                    label="Text"
                    value={form.theme.textColor}
                    onChange={(v) => setTheme('textColor', v)}
                  />
                  <ColorField
                    label="Button color"
                    value={form.theme.primaryColor}
                    onChange={(v) => setTheme('primaryColor', v)}
                  />
                </div>

                {/* font */}
                <div>
                  <label className="ln-label">Font</label>
                  <div className="flex flex-wrap gap-2">
                    {FONTS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setTheme('font', f.value)}
                        className="rounded-lg border px-3 py-1.5 text-sm transition focus:outline-none"
                        style={form.theme.font === f.value ? {
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                          background: 'rgb(99 102 241 / 0.06)',
                          fontWeight: 500,
                        } : {
                          borderColor: 'var(--border)',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* layout */}
                <div>
                  <label className="ln-label">Layout</label>
                  <div className="flex gap-2">
                    {LAYOUTS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setTheme('layout', l.value)}
                        className="flex flex-1 items-center justify-center rounded-lg border py-2.5 text-sm transition focus:outline-none"
                        style={form.theme.layout === l.value ? {
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                          background: 'rgb(99 102 241 / 0.06)',
                          fontWeight: 500,
                        } : {
                          borderColor: 'var(--border)',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </motion.div>

          {/* ── right: preview ── */}
          <div className="lg:sticky lg:top-[88px] lg:h-fit">
            <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
              Live preview
            </p>
            <ProfilePreview form={form} />
          </div>

        </div>
      </main>
    </div>
  );
}
