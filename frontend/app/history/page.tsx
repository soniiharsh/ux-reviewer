'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHistory, type HistoryItem } from '@/lib/api';
import { Card, ScoreRing } from '@/components/ui';
import { ExternalLink, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Review History</h1>
        <p className="text-sm text-slate-500">The last 5 UX reviews are saved automatically.</p>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && history.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-500 text-sm">No reviews yet.</p>
          <Link href="/" className="text-brand-600 text-sm hover:underline mt-2 inline-block">
            Analyse your first URL →
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {history.map(item => (
          <Card key={item.id} className="p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="min-w-0 space-y-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-800 hover:text-brand-600 flex items-center gap-1 truncate"
              >
                {item.url} <ExternalLink size={12} className="shrink-0" />
              </a>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <ScoreRing score={item.score} />
              <Link
                href={`/results/${item.id}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline whitespace-nowrap"
              >
                View Review →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
