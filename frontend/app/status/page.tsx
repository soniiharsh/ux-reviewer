'use client';
import { useEffect, useState } from 'react';
import { getStatus, type StatusResponse } from '@/lib/api';
import { Card, StatusDot } from '@/components/ui';
import { RefreshCw } from 'lucide-react';

const CHECKS = [
  { key: 'backend' as const, label: 'Backend API', description: 'FastAPI server health' },
  { key: 'database' as const, label: 'Database', description: 'SQLite connection' },
  { key: 'llm' as const, label: 'LLM (OpenAI)', description: 'API key & connectivity' },
  { key: 'scraper' as const, label: 'Scraper', description: 'Playwright Chromium' },
];

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  async function check() {
    setLoading(true);
    setError('');
    try {
      const s = await getStatus();
      setStatus(s);
      setLastChecked(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { check(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
          {lastChecked && (
            <p className="text-xs text-slate-400 mt-1">Last checked: {lastChecked.toLocaleTimeString()}</p>
          )}
        </div>
        <button
          onClick={check}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">Failed to connect to backend: {error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {CHECKS.map(({ key, label, description }) => (
          <Card key={key} className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800 text-sm">{label}</span>
              {status ? <StatusDot status={status[key]} /> : <span className="text-slate-300 text-sm">—</span>}
            </div>
            <p className="text-xs text-slate-400">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
