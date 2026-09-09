'use client';

import { useState } from 'react';

export default function FreeAuditWidget() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/audit/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 max-w-2xl mx-auto border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">
        Get Your Free Security & UX Check
      </h3>
      <p className="text-slate-600 mb-6 text-center">
        Enter any URL to get 5 instant findings. No signup required.
      </p>

      <form onSubmit={handleScan} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            placeholder="https://yoursite.com"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center">
          ✓ Checks SSL, security headers, mobile layout, SEO, data exposure
        </p>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-sm text-slate-500">Target:</span>
              <p className="font-mono text-sm font-semibold text-slate-800">{result.url}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-slate-500">Security Score:</span>
              <div className={`text-2xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {result.score}/100
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {result.checks.map((check: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                <span className={`text-lg font-bold ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {check.passed ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{check.name}</div>
                  <div className="text-slate-600 text-xs mt-0.5">{check.impact}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Upsell CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
            <h4 className="font-bold text-blue-900 text-base mb-1">
              Want the full 90-checkpoint deep scan?
            </h4>
            <p className="text-xs text-blue-700 mb-4">
              Get client-side paywall testing, database vulnerability analysis, line-by-line code fixes, and a branded PDF report.
            </p>
            <a
              href="#pricing"
              className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Full Audit ($199)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
