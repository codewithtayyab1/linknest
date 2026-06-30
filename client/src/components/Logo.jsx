import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      aria-label="LinkNest — home"
      className={`inline-flex items-center gap-2 select-none no-underline
                  hover:opacity-80 transition-opacity duration-150 ${className}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0F172A"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <path d="M3 13c0-3 4-5 9-5s9 2 9 5" />
        <path d="M5 13c1.5 2.5 4 4 7 4s5.5-1.5 7-4" />
        <circle cx="9.5" cy="13.5" r="1" />
        <circle cx="14.5" cy="13.5" r="1" />
      </svg>
      <span className="text-sm font-semibold tracking-tight">
        <span style={{ color: '#0F172A' }}>Link</span>
        <span style={{ color: 'var(--accent)' }}>Nest</span>
      </span>
    </Link>
  );
}
