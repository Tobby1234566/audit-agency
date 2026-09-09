import { NextRequest, NextResponse } from 'next/server';
import { runFullAudit, FullAuditResult } from '@/lib/audit-runner';
import fs from 'fs';
import path from 'path';

// Local storage for demo/MVP reports (persisted in JSON or memory)
const AUDITS_DIR = path.join(process.cwd(), '.audits');

function saveAuditLocally(result: FullAuditResult) {
  try {
    if (!fs.existsSync(AUDITS_DIR)) {
      fs.mkdirSync(AUDITS_DIR, { recursive: true });
    }
    const filePath = path.join(AUDITS_DIR, `${result.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save audit locally:', err);
  }
}

export function getAuditById(id: string): FullAuditResult | null {
  try {
    const filePath = path.join(AUDITS_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read audit:', err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    const auditResult = await runFullAudit(url);
    saveAuditLocally(auditResult);

    return NextResponse.json({
      success: true,
      reportUrl: `/report/${auditResult.id}`,
      audit: auditResult,
    });
  } catch (error: any) {
    console.error('Full audit scan error:', error);
    return NextResponse.json(
      { error: error.message || 'Audit execution failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Audit ID required' }, { status: 400 });
  }

  const audit = getAuditById(id);
  if (!audit) {
    return NextResponse.json({ error: 'Audit report not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, audit });
}
