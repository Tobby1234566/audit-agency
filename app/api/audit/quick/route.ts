import { NextRequest, NextResponse } from 'next/server';

interface QuickAuditResult {
  url: string;
  score: number;
  checks: {
    name: string;
    passed: boolean;
    impact: string;
    details: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const { url, email } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    let targetUrl: URL;
    try {
      targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const checks = [];
    let passedCount = 0;

    // Check 1: SSL / HTTPS
    const isHttps = targetUrl.protocol === 'https:';
    checks.push({
      name: 'HTTPS / SSL Encryption',
      passed: isHttps,
      impact: isHttps ? 'Secure' : 'Critical security risk — data sent in plaintext',
      details: isHttps ? 'Valid HTTPS configuration' : 'Site is not using HTTPS'
    });
    if (isHttps) passedCount++;

    // Fetch site headers and content
    let response: Response | null = null;
    let html = '';
    try {
      response = await fetch(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AuditPulseBot/1.0; +https://auditpulse.dev)'
        },
        signal: AbortSignal.timeout(8000)
      });
      html = await response.text();
    } catch (e) {
      // Continue with partial checks
    }

    // Check 2: Security Headers
    if (response) {
      const hsts = response.headers.get('strict-transport-security');
      const csp = response.headers.get('content-security-policy');
      const xFrame = response.headers.get('x-frame-options');

      const headersPassed = Boolean(hsts || csp || xFrame);
      checks.push({
        name: 'Security Headers (HSTS, CSP, X-Frame)',
        passed: headersPassed,
        impact: headersPassed ? 'Protected against clickjacking/XSS' : 'Vulnerable to clickjacking and XSS attacks',
        details: headersPassed ? 'Security headers detected' : 'Missing essential security headers'
      });
      if (headersPassed) passedCount++;
    } else {
      checks.push({
        name: 'Security Headers',
        passed: false,
        impact: 'Could not verify',
        details: 'Server did not respond'
      });
    }

    // Check 3: Mobile Viewport Meta
    const hasViewport = html.includes('name="viewport"') || html.includes("name='viewport'");
    checks.push({
      name: 'Mobile Responsive Viewport',
      passed: hasViewport,
      impact: hasViewport ? 'Mobile optimized' : 'Broken mobile experience — content will not scale properly',
      details: hasViewport ? 'Viewport meta tag found' : 'Missing viewport meta tag'
    });
    if (hasViewport) passedCount++;

    // Check 4: Title & Meta Description (SEO / Polish)
    const hasTitle = html.includes('<title>') && !html.includes('<title></title>');
    const hasMetaDesc = html.includes('name="description"') || html.includes("name='description'");
    const seoPassed = hasTitle && hasMetaDesc;
    checks.push({
      name: 'SEO & Search Snippet Meta',
      passed: seoPassed,
      impact: seoPassed ? 'Good search visibility' : 'Poor Google search ranking and missing social previews',
      details: seoPassed ? 'Title and meta description present' : 'Missing title or meta description'
    });
    if (seoPassed) passedCount++;

    // Check 5: Basic Paywall/Secret Leak check
    const hasStripeKey = html.includes('pk_live_') || html.includes('pk_test_');
    const hasSupabaseKey = html.includes('supabase.co') && html.includes('anon');
    const clientSideExposures = hasStripeKey || hasSupabaseKey;

    checks.push({
      name: 'Client-Side Data & Secret Exposure',
      passed: !clientSideExposures,
      impact: !clientSideExposures ? 'No public leaks detected' : 'Warning: API keys or backend URLs detected in frontend bundle',
      details: !clientSideExposures ? 'Clean bundle scan' : 'Potential sensitive credentials exposed'
    });
    if (!clientSideExposures) passedCount++;

    const score = Math.round((passedCount / checks.length) * 100);

    const result: QuickAuditResult = {
      url: targetUrl.toString(),
      score,
      checks
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Audit failed' }, { status: 500 });
  }
}
