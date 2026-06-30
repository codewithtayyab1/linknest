import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';
import Logo from '../components/Logo';

// ── helpers ──────────────────────────────────────────────────────────────────

const DEVICE_COLORS = {
  mobile:  '#6366f1',
  desktop: '#10b981',
  tablet:  '#f59e0b',
  unknown: '#d1d5db',
};

const fillDays = (data = []) => {
  const map = Object.fromEntries(data.map((d) => [d.date, d.count]));
  return Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(Date.now() - (6 - i) * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), count: map[key] ?? 0 };
  });
};

const toDomain = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url.slice(0, 28); }
};

// ── tiny shared components ────────────────────────────────────────────────────

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ln-card px-3 py-2 text-sm">
      <p className="text-xs text-[var(--ink-muted)]">{label}</p>
      <p className="font-semibold text-[var(--ink)]">{payload[0].value}</p>
    </div>
  );
};

const Pulse = ({ h = 40 }) => (
  <div className="animate-pulse rounded-xl bg-[var(--border)]" style={{ height: h }} />
);

function StatCard({ label, value, loading }) {
  return (
    <div className="ln-card p-6">
      <p className="text-sm text-[var(--ink-muted)]">{label}</p>
      {loading
        ? <Pulse h={40} />
        : <p className="mt-1.5 text-3xl font-semibold tracking-tight stat-gradient sm:text-4xl">{value ?? 0}</p>}
    </div>
  );
}

function Card({ title, loading, skeletonH = 160, children }) {
  return (
    <div className="ln-card p-6">
      <p className="mb-4 text-sm font-semibold text-[var(--ink)]">{title}</p>
      {loading ? <Pulse h={skeletonH} /> : children}
    </div>
  );
}

const Empty = () => <p className="text-sm text-[var(--ink-muted)]">No data yet.</p>;

// ── page ─────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [summary,   setSummary]   = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    Promise.all([api.get('/analytics/summary'), api.get('/analytics/breakdown')])
      .then(([s, b]) => { setSummary(s.data); setBreakdown(b.data); })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const days      = fillDays(breakdown?.viewsLast7Days);
  const perLink   = summary?.clicksPerLink ?? [];
  const devices   = breakdown?.byDevice    ?? [];
  const referrers = (breakdown?.topReferrers ?? []).map((r) => ({
    label: toDomain(r.referrer),
    count: r.count,
  }));

  const deviceTotal = devices.reduce((s, d) => s + d.count, 0);

  return (
    <div className="min-h-screen page-gradient-subtle">
      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="hidden select-none text-[var(--border)] sm:block">/</span>
            <Link to="/dashboard" className="btn-nav hidden sm:inline-flex">Dashboard</Link>
            <span className="hidden select-none text-[var(--border)] sm:block">/</span>
            <span className="hidden text-sm font-medium text-[var(--ink-muted)] sm:block">Analytics</span>
          </div>
          <Link to="/settings" className="btn-nav">Settings</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
        {error && <p className="error-banner">{error}</p>}

        {/* stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total views"  value={summary?.totalViews}  loading={loading} />
          <StatCard label="Total clicks" value={summary?.totalClicks} loading={loading} />
        </div>

        {/* 7-day area chart */}
        <Card title="Views — last 7 days" loading={loading} skeletonH={200}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="count" name="Views" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* clicks per link + device split */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_220px]">

          <Card title="Clicks per link" loading={loading} skeletonH={160}>
            {perLink.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={Math.max(120, perLink.length * 44)}>
                <BarChart layout="vertical" data={perLink} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={100}
                    tick={{ fontSize: 12, fill: 'var(--ink)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.length > 17 ? `${v.slice(0, 16)}…` : v}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgb(99 102 241 / 0.05)' }} />
                  <Bar dataKey="clicks" name="Clicks" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Devices" loading={loading} skeletonH={160}>
            {devices.length === 0 ? <Empty /> : (
              <div className="space-y-3.5">
                {devices.map(({ device, count }) => {
                  const pct  = deviceTotal ? Math.round((count / deviceTotal) * 100) : 0;
                  const fill = DEVICE_COLORS[device] ?? '#d1d5db';
                  return (
                    <div key={device}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="capitalize text-[var(--ink-muted)]">{device}</span>
                        <span className="font-medium tabular-nums text-[var(--ink)]">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

        </div>

        {/* top referrers */}
        <Card title="Top referrers" loading={loading} skeletonH={140}>
          {referrers.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={Math.max(100, referrers.length * 44)}>
              <BarChart layout="vertical" data={referrers} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tick={{ fontSize: 12, fill: 'var(--ink)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgb(99 102 241 / 0.05)' }} />
                <Bar dataKey="count" name="Visits" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

      </main>
    </div>
  );
}
