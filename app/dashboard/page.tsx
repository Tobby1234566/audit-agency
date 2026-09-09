'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuditSummary {
  id: string;
  url: string;
  scannedAt: string;
  overallScore: number;
  grade: string;
  criticalCount: number;
  highCount: number;
}

export default function DashboardPage() {
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In MVP, we'll read from localStorage or fetch from API
    // For now, simulate loading saved audit IDs from localStorage
    const savedAuditIds = JSON.parse(localStorage.getItem('auditHistory') || '[]');

    const loadAudits = async () => {
      const loadedAudits: AuditSummary[] = [];

      for (const id of savedAuditIds) {
        try {
          const res = await fetch(`/api/audit/full?id=${id}`);
          const data = await res.json();
          if (data.success) {
            loadedAudits.push({
              id: data.audit.id,
              url: data.audit.url,
              scannedAt: data.audit.scannedAt,
              overallScore: data.audit.overallScore,
              grade: data.audit.grade,
              criticalCount: data.audit.summary.criticalCount,
              highCount: data.audit.summary.highCount,
            });
          }
        } catch (err) {
          console.error(`Failed to load audit ${id}:`, err);
        }
      }

      setAudits(loadedAudits.sort((a, b) =>
        new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
      ));
      setLoading(false);
    };

    loadAudits();
  }, []);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-300';
    if (grade === 'B') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (grade === 'D') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
            <p className="text-sm text-gray-600">View and manage your audit reports</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + New Audit
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading audits...</p>
          </div>
        ) : audits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Audits Yet</h2>
            <p className="text-gray-600 mb-6">
              Run your first free security & UX audit to get started
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Start Free Audit
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Your Audit History</h2>
              <p className="text-sm text-gray-600">{audits.length} total audit{audits.length !== 1 ? 's' : ''}</p>
            </div>

            {audits.map((audit) => (
              <Link
                key={audit.id}
                href={`/report/${audit.id}`}
                className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{audit.url}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(audit.scannedAt).toLocaleString()}
                    </p>

                    {(audit.criticalCount > 0 || audit.highCount > 0) && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {audit.criticalCount > 0 && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-300">
                            🚨 {audit.criticalCount} Critical
                          </span>
                        )}
                        {audit.highCount > 0 && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold border border-orange-300">
                            ⚠️ {audit.highCount} High
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={`px-4 py-2 rounded-lg font-bold text-2xl border-2 ${getGradeColor(
                        audit.grade
                      )}`}
                    >
                      {audit.grade}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{audit.overallScore}/100</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-600">View full report →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
