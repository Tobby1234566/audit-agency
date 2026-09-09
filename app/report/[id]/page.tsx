'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FullAuditResult, AuditCategory } from '@/lib/audit-runner';

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [audit, setAudit] = useState<FullAuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/audit/full?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAudit(data.audit);
        } else {
          setError(data.error || 'Failed to load report');
        }
      })
      .catch((err) => {
        setError('Network error loading report');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!audit) return;
    const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${audit.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit report...</p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade === 'B') return 'text-blue-600';
    if (grade === 'C') return 'text-yellow-600';
    if (grade === 'D') return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      LOW: 'bg-blue-100 text-blue-800 border-blue-300',
      INFO: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[severity] || colors.INFO;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'PASS') return '✅';
    if (status === 'WARNING') return '⚠️';
    return '❌';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Print/Download Bar */}
      <div className="bg-white border-b border-gray-200 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
            ← Back to Home
          </a>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              📥 Download JSON
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 print:py-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 print:shadow-none print:border print:border-gray-300">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Full Security & UX Audit Report
              </h1>
              <p className="text-gray-600">
                <strong>Website:</strong> {audit.url}
              </p>
              <p className="text-gray-500 text-sm">
                Scanned: {new Date(audit.scannedAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-6xl font-bold ${getGradeColor(audit.grade)} mb-1`}>
                {audit.grade}
              </div>
              <div className="text-2xl font-semibold text-gray-700">{audit.overallScore}/100</div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{audit.summary.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{audit.summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{audit.summary.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">{audit.summary.total}</div>
              <div className="text-sm text-gray-600">Total Checks</div>
            </div>
          </div>

          {/* Critical Issues Alert */}
          {audit.summary.criticalCount > 0 && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-600 p-4 rounded">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚨</span>
                <div>
                  <h3 className="font-bold text-red-900">
                    {audit.summary.criticalCount} Critical Security Issue{audit.summary.criticalCount !== 1 ? 's' : ''} Found
                  </h3>
                  <p className="text-red-700 text-sm">Immediate remediation required</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Recommendations */}
        {audit.topRecommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Priority Actions</h2>
            <ul className="space-y-3">
              {audit.topRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700 pt-0.5">{rec}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="space-y-6">
          {audit.categories.map((category: AuditCategory, catIdx: number) => (
            <div
              key={catIdx}
              className="bg-white rounded-xl shadow-lg p-8 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{category.score}%</div>
                  <div className="text-sm text-gray-500">
                    {category.checks.filter((c) => c.status === 'PASS').length}/{category.checks.length} passed
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {category.checks.map((check, checkIdx) => (
                  <div
                    key={checkIdx}
                    className={`border rounded-lg p-5 ${
                      check.status === 'FAIL' ? 'border-red-300 bg-red-50' :
                      check.status === 'WARNING' ? 'border-yellow-300 bg-yellow-50' :
                      'border-green-300 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{getStatusIcon(check.status)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{check.name}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBadge(
                              check.severity
                            )} flex-shrink-0`}
                          >
                            {check.severity}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{check.description}</p>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Impact:</strong> {check.impact}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Details:</strong> {check.details}
                        </p>
                        {check.remediation && (
                          <div className="bg-white border border-gray-300 rounded p-3 mb-3">
                            <p className="text-sm font-semibold text-gray-900 mb-1">💡 Remediation:</p>
                            <p className="text-sm text-gray-700">{check.remediation}</p>
                          </div>
                        )}
                        {check.codeSnippet && (
                          <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                            <code>{check.codeSnippet}</code>
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm print:mt-12">
          <p>Generated by AuditPulse — Professional Web Security & UX Auditing</p>
          <p className="mt-1">Report ID: {audit.id}</p>
        </div>
      </div>
    </div>
  );
}
