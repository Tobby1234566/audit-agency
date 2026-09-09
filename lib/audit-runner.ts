export interface AuditCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  impact: string;
  details: string;
  remediation?: string;
  codeSnippet?: string;
}

export interface AuditCategory {
  name: string;
  score: number;
  checks: AuditCheck[];
}

export interface FullAuditResult {
  id: string;
  url: string;
  scannedAt: string;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  categories: AuditCategory[];
  topRecommendations: string[];
}

export async function runFullAudit(rawUrl: string): Promise<FullAuditResult> {
  const targetUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  const startTime = Date.now();

  let response: Response | null = null;
  let html = '';
  let responseHeaders: Record<string, string> = {};
  let fetchError: string | null = null;

  try {
    response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 AuditPulseBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    });

    html = await response.text();
    response.headers.forEach((val, key) => {
      responseHeaders[key.toLowerCase()] = val;
    });
  } catch (err: any) {
    fetchError = err.message || 'Failed to fetch website';
  }

  const checks: AuditCheck[] = [];

  // ==========================================
  // CATEGORY 1: SECURITY & REVENUE PROTECTION
  // ==========================================
  const isHttps = targetUrl.protocol === 'https:';
  checks.push({
    id: 'SEC-1.1',
    category: 'Security & Revenue Protection',
    name: 'HTTPS / TLS Transport Encryption',
    description: 'Enforces encrypted communication between client and server to prevent eavesdropping and MITM attacks.',
    status: isHttps ? 'PASS' : 'FAIL',
    severity: 'CRITICAL',
    impact: isHttps ? 'Traffic is safely encrypted in transit.' : 'Unencrypted HTTP permits traffic snooping, credential theft, and ISP injection.',
    details: isHttps ? 'Valid HTTPS protocol detected.' : 'Target URL does not use HTTPS.',
    remediation: 'Redirect all HTTP traffic to HTTPS (301 Permanent Redirect) and obtain a valid TLS certificate.',
    codeSnippet: `// Next.js middleware.ts / Express redirect\nif (req.headers['x-forwarded-proto'] !== 'https') {\n  return res.redirect(301, 'https://' + req.headers.host + req.url);\n}`,
  });

  const hsts = responseHeaders['strict-transport-security'];
  checks.push({
    id: 'SEC-1.2',
    category: 'Security & Revenue Protection',
    name: 'Strict-Transport-Security (HSTS)',
    description: 'Instructs browsers to strictly load the site only via HTTPS.',
    status: hsts ? 'PASS' : 'FAIL',
    severity: 'HIGH',
    impact: hsts ? 'HSTS header configured.' : 'Without HSTS, initial HTTP requests remain vulnerable to SSL stripping attacks.',
    details: hsts ? `HSTS header active: ${hsts}` : 'Strict-Transport-Security header missing from server response.',
    remediation: 'Add Strict-Transport-Security header with at least max-age=31536000; includeSubDomains.',
    codeSnippet: `// Response header\nStrict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
  });

  const xFrame = responseHeaders['x-frame-options'];
  const csp = responseHeaders['content-security-policy'] || '';
  const frameProtected = Boolean(xFrame || csp.includes('frame-ancestors'));
  checks.push({
    id: 'SEC-1.3',
    category: 'Security & Revenue Protection',
    name: 'Clickjacking Protection (X-Frame-Options / CSP)',
    description: 'Prevents the site from being embedded inside an unauthorized iframe on third-party sites.',
    status: frameProtected ? 'PASS' : 'FAIL',
    severity: 'HIGH',
    impact: frameProtected ? 'Framing is restricted.' : 'Attackers can embed your login/checkout pages into invisible iframes to hijack user clicks.',
    details: frameProtected ? `Protected via ${xFrame ? 'X-Frame-Options: ' + xFrame : 'CSP frame-ancestors'}` : 'Missing X-Frame-Options and CSP frame-ancestors.',
    remediation: 'Set X-Frame-Options: DENY or SAMEORIGIN, or configure frame-ancestors in Content-Security-Policy.',
    codeSnippet: `// Header\nX-Frame-Options: DENY\n// or in CSP\nContent-Security-Policy: frame-ancestors 'none';`,
  });

  const xContentType = responseHeaders['x-content-type-options'];
  checks.push({
    id: 'SEC-1.4',
    category: 'Security & Revenue Protection',
    name: 'MIME-Sniffing Prevention (X-Content-Type-Options)',
    description: 'Prevents browsers from MIME-sniffing a response away from the declared content-type.',
    status: xContentType?.toLowerCase().includes('nosniff') ? 'PASS' : 'FAIL',
    severity: 'MEDIUM',
    impact: xContentType ? 'MIME sniffing disabled.' : 'Vulnerable to MIME confusion attacks where user-uploaded files execute as scripts.',
    details: xContentType ? 'X-Content-Type-Options: nosniff present.' : 'Missing X-Content-Type-Options: nosniff header.',
    remediation: 'Add X-Content-Type-Options: nosniff to all HTTP responses.',
    codeSnippet: `X-Content-Type-Options: nosniff`,
  });

  const hasCsp = Boolean(csp);
  checks.push({
    id: 'SEC-1.5',
    category: 'Security & Revenue Protection',
    name: 'Content Security Policy (CSP)',
    description: 'Mitigates Cross-Site Scripting (XSS), data injection, and unauthorized external scripts.',
    status: hasCsp ? 'PASS' : 'FAIL',
    severity: 'HIGH',
    impact: hasCsp ? 'CSP policy detected.' : 'Lack of CSP leaves web app vulnerable to malicious third-party script execution and XSS.',
    details: hasCsp ? `CSP found (${csp.slice(0, 60)}...)` : 'Content-Security-Policy header is absent.',
    remediation: 'Define a strict Content-Security-Policy restricting script-src, object-src, and default-src.',
    codeSnippet: `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;`,
  });

  const hasStripeSecret = html.includes('sk_live_') || html.includes('sk_test_');
  const hasPrivateKeys = html.includes('BEGIN PRIVATE KEY') || html.includes('BEGIN RSA PRIVATE KEY');
  const hasDatabaseUrl = /postgres(ql)?:\/\/.*:.*@/i.test(html) || /mongodb(\+srv)?:\/\/.*:.*@/i.test(html);
  const leakedSecrets = hasStripeSecret || hasPrivateKeys || hasDatabaseUrl;
  checks.push({
    id: 'SEC-1.6',
    category: 'Security & Revenue Protection',
    name: 'Frontend Secret & Credential Leak Scan',
    description: 'Verifies no private API keys, database connection strings, or server secrets leaked into public client bundles.',
    status: leakedSecrets ? 'FAIL' : 'PASS',
    severity: 'CRITICAL',
    impact: leakedSecrets ? 'CRITICAL LEAK: Private keys or database connection strings found directly in client HTML/JS!' : 'No high-risk credentials detected in client bundle.',
    details: leakedSecrets ? 'Discovered matching secret signatures (e.g. secret keys or raw database credentials).' : 'Client-side assets are clean of obvious private secrets.',
    remediation: 'Immediately rotate any exposed keys and ensure sensitive credentials only reside in server-side process.env.',
    codeSnippet: `// Ensure secrets don't use NEXT_PUBLIC_ or VITE_ prefixes\nconst DB_SECRET = process.env.DATABASE_URL; // Server only!`,
  });

  const hasClientPaywall = /isPremium|isSubscribed|user\.plan|hasPaid/i.test(html) && /display:\s*none|blur\(\d+px\)|visibility:\s*hidden/i.test(html);
  checks.push({
    id: 'SEC-1.7',
    category: 'Security & Revenue Protection',
    name: 'Client-Side Paywall & Content Bypass Heuristic',
    description: 'Audits whether paid/premium content is shipped to unauthorized clients and merely hidden via CSS display:none or opacity.',
    status: hasClientPaywall ? 'WARNING' : 'PASS',
    severity: 'HIGH',
    impact: hasClientPaywall ? 'Possible client-side gated content found. Users can inspect DOM and remove blur/hidden styles to access paid features.' : 'No obvious client-hidden premium payload patterns.',
    details: hasClientPaywall ? 'Detected DOM elements matching premium flags paired with inline CSS hiding/blur filters.' : 'Server-side access gating appears standard.',
    remediation: 'Never render premium content on server without authenticated authorization checks. Authorize on the backend route/server component before returning data.',
  });

  // ==========================================
  // CATEGORY 2: VISUAL DESIGN & FRONTEND
  // ==========================================
  const hasH1 = html.includes('<h1') && html.includes('</h1>');
  checks.push({
    id: 'DES-2.1',
    category: 'Visual Design & Frontend',
    name: 'Typography Hierarchy & Single H1 Structure',
    description: 'Validates clear typographic hierarchy with a distinct H1 headline for optimal clarity and SEO.',
    status: hasH1 ? 'PASS' : 'FAIL',
    severity: 'MEDIUM',
    impact: hasH1 ? 'Primary page title is clearly designated.' : 'Missing top-level H1 tag impairs search ranking and visual document structure.',
    details: hasH1 ? 'H1 heading tag exists.' : 'No H1 element found in document.',
    remediation: 'Include exactly one descriptive H1 tag per page defining the core value proposition.',
  });

  const hasModernCss = html.includes('tailwind') || html.includes('var(--') || /style=.*color:/i.test(html);
  checks.push({
    id: 'DES-2.2',
    category: 'Visual Design & Frontend',
    name: 'Design System & CSS Token Consistency',
    description: 'Checks for modern design token usage (CSS variables, utility classes, or consistent color palette).',
    status: hasModernCss ? 'PASS' : 'WARNING',
    severity: 'LOW',
    impact: hasModernCss ? 'Design variables / tokens present.' : 'Potential hardcoded styling values may lead to inconsistent UI surfaces across screens.',
    details: hasModernCss ? 'Found structured design tokens or modern styling architecture.' : 'Consider adopting CSS variables or a unified theme token palette.',
    remediation: 'Declare reusable colors and spacing variables in :root or tailwind.config.',
  });

  // ==========================================
  // CATEGORY 3: USER FLOW & UX
  // ==========================================
  const hasCta = /<a[^>]+(href=[^>]+)[^>]*>(.*(start|sign up|try|get started|buy|book|join|free trial|audit|learn more).*?)<\/a>/i.test(html) ||
                 /<button[^>]*>(.*(start|sign up|try|get started|buy|book|join|free trial|audit).*?)<\/button>/i.test(html);
  checks.push({
    id: 'UX-3.1',
    category: 'User Flow & UX',
    name: 'Clear Primary Call-to-Action (CTA)',
    description: 'Ensures the page has an immediate, actionable conversion pathway above or near the fold.',
    status: hasCta ? 'PASS' : 'FAIL',
    severity: 'HIGH',
    impact: hasCta ? 'Actionable CTA located.' : 'Visitors cannot identify what action to take next, severely depressing conversion rate.',
    details: hasCta ? 'Prominent call-to-action button or link detected in markup.' : 'No obvious action-oriented CTA buttons found in landing copy.',
    remediation: 'Add a high-contrast primary CTA button above the fold that clearly describes the user benefit.',
  });

  const hasTrustSocialProof = /testimonial|review|customer|trusted by|users|star|rating|guarantee/i.test(html);
  checks.push({
    id: 'UX-3.2',
    category: 'User Flow & UX',
    name: 'Social Proof & Trust Indicators',
    description: 'Checks for user reviews, ratings, client logos, or guarantees to reduce bounce rate.',
    status: hasTrustSocialProof ? 'PASS' : 'WARNING',
    severity: 'MEDIUM',
    impact: hasTrustSocialProof ? 'Trust markers detected.' : 'Cold visitors lack credibility indicators to trust the product with payment or signup.',
    details: hasTrustSocialProof ? 'Found references to testimonials, ratings, or trust badges.' : 'No clear social proof, testimonials, or guarantees found on page.',
    remediation: 'Add customer testimonials, client logos, star ratings, or a satisfaction guarantee near purchase buttons.',
  });

  // ==========================================
  // CATEGORY 4: RESPONSIVE & MOBILE
  // ==========================================
  const hasViewport = html.includes('name="viewport"') || html.includes("name='viewport'");
  checks.push({
    id: 'MOB-4.1',
    category: 'Responsive & Mobile',
    name: 'Mobile Viewport Meta Tag',
    description: 'Required for browsers to scale viewport dimensions properly across mobile devices.',
    status: hasViewport ? 'PASS' : 'FAIL',
    severity: 'CRITICAL',
    impact: hasViewport ? 'Responsive viewport defined.' : 'Without viewport meta tag, mobile devices render desktop-scaled pages with horizontal scroll.',
    details: hasViewport ? 'Viewport meta tag is properly configured.' : 'Missing <meta name="viewport" content="width=device-width, initial-scale=1">.',
    remediation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> in document head.',
    codeSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
  });

  // ==========================================
  // CATEGORY 5: ACCESSIBILITY (WCAG AA)
  // ==========================================
  const imgMatches = html.match(/<img\s+[^>]*>/gi) || [];
  const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
  const accessibleImages = imgMatches.length === 0 || imgsWithoutAlt.length === 0;
  checks.push({
    id: 'A11Y-5.1',
    category: 'Accessibility (WCAG AA)',
    name: 'Image Alt Text Descriptions',
    description: 'Ensures screen readers and visual assistance tools can describe image content.',
    status: accessibleImages ? 'PASS' : 'WARNING',
    severity: 'MEDIUM',
    impact: accessibleImages ? 'Images contain alt attributes.' : `${imgsWithoutAlt.length} image(s) missing alt text. Impairs accessibility and SEO.`,
    details: accessibleImages ? 'All inspected <img> tags include alt properties.' : `Found ${imgsWithoutAlt.length} image tags without alt attributes.`,
    remediation: 'Always specify an alt attribute for images (or alt="" if purely decorative).',
  });

  const hasSemanticLandmarks = html.includes('<header') && html.includes('<footer') && (html.includes('<main') || html.includes('<nav'));
  checks.push({
    id: 'A11Y-5.2',
    category: 'Accessibility (WCAG AA)',
    name: 'Semantic HTML5 Landmark Elements',
    description: 'Verifies proper use of <header>, <main>, <nav>, and <footer> tags for screen reader navigation.',
    status: hasSemanticLandmarks ? 'PASS' : 'WARNING',
    severity: 'LOW',
    impact: hasSemanticLandmarks ? 'Semantic landmarks utilized.' : 'Generic <div> layouts reduce accessibility navigation speed for assistive tools.',
    details: hasSemanticLandmarks ? 'Found standard semantic container tags.' : 'Site relies heavily on non-semantic container tags.',
    remediation: 'Replace generic outer wrapper <div> tags with semantic HTML5 elements like <main>, <nav>, <header>, and <footer>.',
  });

  // ==========================================
  // CATEGORY 6: PERFORMANCE & WEB VITALS
  // ==========================================
  const scriptTags = (html.match(/<script\s+[^>]*src=/gi) || []).length;
  const heavyScripts = scriptTags > 15;
  checks.push({
    id: 'PERF-6.1',
    category: 'Performance & Web Vitals',
    name: 'Third-Party Script & Bundle Overhead',
    description: 'Assesses script tag volume and potential execution overhead on initial page load (INP & LCP).',
    status: heavyScripts ? 'WARNING' : 'PASS',
    severity: 'MEDIUM',
    impact: heavyScripts ? `High script count (${scriptTags} external scripts) may cause main thread blockage.` : 'Script volume is within reasonable limits.',
    details: `Detected ${scriptTags} external script references.`,
    remediation: 'Defer non-critical third-party analytics and chat widgets using defer/async or next/script with strategy="lazyOnload".',
  });

  // ==========================================
  // CATEGORY 7: SEO & DISCOVERABILITY
  // ==========================================
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].trim() : '';
  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';
  const seoOk = Boolean(titleText && metaDesc);

  checks.push({
    id: 'SEO-7.1',
    category: 'SEO & Discoverability',
    name: 'Search Snippet (Title & Meta Description)',
    description: 'Ensures Google and search engines display a descriptive title and snippet preview.',
    status: seoOk ? 'PASS' : 'FAIL',
    severity: 'HIGH',
    impact: seoOk ? 'Snippet metadata configured.' : 'Missing title or meta description hurts click-through rates and organic ranking.',
    details: seoOk ? `Title: "${titleText.slice(0, 40)}..." | Description: "${metaDesc.slice(0, 50)}..."` : 'Title tag or meta description is missing or blank.',
    remediation: 'Add a concise, keyword-rich <title> (50-60 chars) and <meta name="description"> (150-160 chars).',
  });

  const hasOpenGraph = html.includes('property="og:title"') || html.includes('property="og:image"');
  checks.push({
    id: 'SEO-7.2',
    category: 'SEO & Discoverability',
    name: 'Social Sharing Cards (OpenGraph / Twitter)',
    description: 'Validates preview images, titles, and descriptions when links are shared on Twitter, LinkedIn, Slack, etc.',
    status: hasOpenGraph ? 'PASS' : 'WARNING',
    severity: 'MEDIUM',
    impact: hasOpenGraph ? 'Social cards active.' : 'Shared links will render as plain URLs without rich image cards, reducing viral reach.',
    details: hasOpenGraph ? 'OpenGraph meta tags detected.' : 'Missing og:title, og:image, or og:description meta tags.',
    remediation: 'Implement OpenGraph tags: og:title, og:description, og:image (1200x630px recommended).',
  });

  // ==========================================
  // CATEGORY 8: LEGAL & COMPLIANCE
  // ==========================================
  const hasPrivacy = /privacy\s*(policy)?/i.test(html) || html.includes('/privacy');
  const hasTerms = /terms\s*(of\s*service)?/i.test(html) || html.includes('/terms');
  const complianceOk = hasPrivacy && hasTerms;

  checks.push({
    id: 'LEG-8.1',
    category: 'Legal, Privacy & Compliance',
    name: 'Privacy Policy & Terms of Service Links',
    description: 'Mandatory for SaaS platforms, payment processors, and global GDPR/CCPA compliance.',
    status: complianceOk ? 'PASS' : 'FAIL',
    severity: 'HIGH',
    impact: complianceOk ? 'Legal disclosures linked.' : 'Missing Terms or Privacy Policy creates regulatory risk and can cause merchant account suspensions.',
    details: complianceOk ? 'Found links to both Privacy Policy and Terms of Service.' : `Missing ${!hasPrivacy ? 'Privacy Policy' : ''} ${!hasTerms ? 'Terms of Service' : ''}.`,
    remediation: 'Add clear footer links to a compliant Privacy Policy and Terms of Service page.',
  });

  // Tally scores
  const passed = checks.filter(c => c.status === 'PASS').length;
  const failed = checks.filter(c => c.status === 'FAIL').length;
  const warnings = checks.filter(c => c.status === 'WARNING').length;

  const total = checks.length;
  const overallScore = Math.round((passed / total) * 100);

  let grade: FullAuditResult['grade'] = 'F';
  if (overallScore >= 95) grade = 'A+';
  else if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 75) grade = 'B';
  else if (overallScore >= 60) grade = 'C';
  else if (overallScore >= 45) grade = 'D';

  // Group by category
  const categoriesMap: Record<string, AuditCheck[]> = {};
  checks.forEach(check => {
    if (!categoriesMap[check.category]) {
      categoriesMap[check.category] = [];
    }
    categoriesMap[check.category].push(check);
  });

  const categories: AuditCategory[] = Object.keys(categoriesMap).map(catName => {
    const catChecks = categoriesMap[catName];
    const catPassed = catChecks.filter(c => c.status === 'PASS').length;
    const catScore = Math.round((catPassed / catChecks.length) * 100);
    return {
      name: catName,
      score: catScore,
      checks: catChecks,
    };
  });

  // Filter top critical recommendations
  const topRecommendations = checks
    .filter(c => c.status === 'FAIL' && (c.severity === 'CRITICAL' || c.severity === 'HIGH'))
    .map(c => `${c.name}: ${c.remediation || c.impact}`)
    .slice(0, 5);

  if (topRecommendations.length === 0) {
    topRecommendations.push('Maintain continuous security monitoring and periodically test third-party dependencies.');
  }

  const criticalCount = checks.filter(c => c.status === 'FAIL' && c.severity === 'CRITICAL').length;
  const highCount = checks.filter(c => c.status === 'FAIL' && c.severity === 'HIGH').length;
  const mediumCount = checks.filter(c => c.status === 'FAIL' && c.severity === 'MEDIUM').length;
  const lowCount = checks.filter(c => c.status === 'FAIL' && c.severity === 'LOW').length;

  const resultId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: resultId,
    url: targetUrl.toString(),
    scannedAt: new Date().toISOString(),
    overallScore,
    grade,
    summary: {
      total,
      passed,
      failed,
      warnings,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    },
    categories,
    topRecommendations,
  };
}
