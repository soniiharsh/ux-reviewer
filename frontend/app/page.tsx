'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { analyzeUrl } from '@/lib/api';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  function validate(value: string): string {
    if (!value.trim()) return 'Please enter a URL';
    if (!/^https?:\/\/.+\..+/.test(value.trim())) return 'Please enter a valid URL starting with http:// or https://';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(url);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const result = await analyzeUrl(url.trim());
      router.push(`/results/${result.id}`);
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-8">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-slate-900 leading-tight">
          AI-Powered UX Review
        </h1>
        <p className="text-lg text-slate-500 max-w-xl">
          Paste any website URL. We&apos;ll scrape the page, analyse UX issues with AI,
          and give you a structured report in seconds.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="url"
            value={url}
            onChange={e => { setUrl(e.target.value); setError(''); }}
            placeholder="https://example.com"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                       placeholder:text-slate-400 text-sm shadow-sm"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300
                     text-white font-semibold py-3.5 rounded-xl transition-colors
                     flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Spinner /> Analysing page — this may take 20–40 seconds…
            </>
          ) : (
            <>Analyse UX <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {['8–12 UX Issues', 'Severity Scoring', 'Before / After Fixes', 'Saves Last 5 Reviews'].map(f => (
          <span key={f} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
