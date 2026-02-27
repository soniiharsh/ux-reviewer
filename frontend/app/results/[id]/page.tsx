'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getReview, type ReviewResponse, type Issue, type Category } from '@/lib/api';
import { ScoreRing, SeverityBadge, CategoryBadge, Card } from '@/components/ui';
import { ChevronDown, ChevronUp, ExternalLink, ArrowLeft } from 'lucide-react';

const CATEGORIES: Category[] = ['Clarity', 'Layout', 'Navigation', 'Accessibility', 'Trust'];

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    getReview(Number(id))
      .then(setReview)
      .catch(e => setError(e.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!review) return <Loading />;

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = review.issues.filter(i => i.category === cat);
    return acc;
  }, {} as Record<Category, Issue[]>);

  function toggle(key: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">UX Review</h1>
          <a
            href={review.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            {review.url} <ExternalLink size={12} />
          </a>
          <p className="text-xs text-slate-400">
            {new Date(review.created_at).toLocaleString()}
          </p>
        </div>
        <ScoreRing score={review.score} />
      </div>

      {/* Top 3 Before/After Fixes */}
      {review.top_fixes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">🔧 Top Priority Fixes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {review.top_fixes.map((fix, i) => (
              <Card key={i} className="p-4 space-y-3">
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Fix #{i + 1}</p>
                <p className="font-medium text-slate-800 text-sm">{fix.issue_title}</p>
                <div className="space-y-2">
                  <div className="bg-red-50 rounded-lg p-2.5">
                    <p className="text-[11px] font-semibold text-red-500 mb-1">BEFORE</p>
                    <p className="text-xs text-slate-700">{fix.before}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <p className="text-[11px] font-semibold text-green-600 mb-1">AFTER</p>
                    <p className="text-xs text-slate-700">{fix.after}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Issues grouped by category */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">📋 All Issues</h2>
        {CATEGORIES.map(cat => {
          const issues = grouped[cat];
          if (!issues.length) return null;
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <CategoryBadge category={cat} />
                <span className="text-sm text-slate-500">{issues.length} issue{issues.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {issues.map((issue, idx) => {
                  const key = `${cat}-${idx}`;
                  const open = expanded.has(key);
                  return (
                    <Card key={key}>
                      <button
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                        onClick={() => toggle(key)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SeverityBadge severity={issue.severity} />
                          <span className="font-medium text-slate-800 text-sm truncate">{issue.title}</span>
                        </div>
                        {open ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                      </button>
                      {open && (
                        <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Why it&apos;s a problem</p>
                            <p className="text-sm text-slate-700">{issue.why}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Evidence</p>
                            <code className="text-xs bg-slate-100 rounded px-2 py-1 text-slate-700 block">{issue.proof}</code>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Suggested Fix</p>
                            <p className="text-sm text-slate-700">{issue.suggested_fix}</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <svg className="animate-spin h-8 w-8 text-brand-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <p className="text-slate-500 text-sm">Loading review…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 text-center px-6">
      <p className="text-red-600 font-medium">{message}</p>
      <button onClick={() => router.push('/')} className="text-sm text-brand-600 hover:underline">
        ← Try another URL
      </button>
    </div>
  );
}
