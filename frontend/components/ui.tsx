import clsx from 'clsx';
import type { Severity, Category } from '@/lib/api';

// ── Severity Badge ─────────────────────────────────────────────────────────

const severityStyles: Record<Severity, string> = {
  High:   'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low:    'bg-slate-100 text-slate-600 border-slate-200',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full border', severityStyles[severity])}>
      {severity}
    </span>
  );
}

// ── Category Badge ─────────────────────────────────────────────────────────

const categoryStyles: Record<Category, string> = {
  Clarity:       'bg-blue-50 text-blue-700',
  Layout:        'bg-purple-50 text-purple-700',
  Navigation:    'bg-cyan-50 text-cyan-700',
  Accessibility: 'bg-green-50 text-green-700',
  Trust:         'bg-orange-50 text-orange-700',
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-md', categoryStyles[category])}>
      {category}
    </span>
  );
}

// ── Score Ring ─────────────────────────────────────────────────────────────

export function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x="50" y="54" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>
          {Math.round(score)}
        </text>
      </svg>
      <span className="text-xs text-slate-500 font-medium">UX Score</span>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-xl border border-slate-200 shadow-sm', className)}>
      {children}
    </div>
  );
}

// ── StatusDot ──────────────────────────────────────────────────────────────

export function StatusDot({ status }: { status: string }) {
  const ok = status === 'ok';
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-sm font-medium', ok ? 'text-green-600' : 'text-red-600')}>
      <span className={clsx('w-2 h-2 rounded-full', ok ? 'bg-green-500' : 'bg-red-500')} />
      {ok ? 'Operational' : status}
    </span>
  );
}
