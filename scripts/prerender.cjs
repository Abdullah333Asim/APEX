/**
 * APEX — Build-time prerender script
 * Run automatically as "postbuild" after `vite build`.
 *
 * Reads dist/index.html as a template and generates:
 *  - dist/car/{id}/index.html          (one per car)    — title, meta, og, canonical, JSON-LD Product
 *  - dist/bracket/result/{id}/index.html (one per car)  — shareable champion pages
 *  - dist/catalog/index.html
 *  - dist/bracket/index.html
 *  - dist/garage/index.html            (noindex)
 *  - dist/sitemap.xml
 *
 * TODO: Replace SITE_URL with your real production domain before deploying.
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const SITE_URL  = 'https://apex-brackets.vercel.app';
const SITE_NAME = 'APEX — Automotive Bracket';
const DIST_DIR  = path.resolve(__dirname, '../dist');
const CARS_FILE = path.resolve(__dirname, '../src/data/cars.json');

// ── Load data ─────────────────────────────────────────────────────────────────
const cars = JSON.parse(fs.readFileSync(CARS_FILE, 'utf8'));
const template = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

// ── Helpers ───────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Swap common meta placeholders in the template.
 * Rather than a full HTML parser, we do simple string-replacements on the
 * known static patterns that vite will have left in the built template.
 */
function buildHtml({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  canonical,
  noindex = false,
  ldJson = null,
}) {
  let html = template;

  // ── Title ──────────────────────────────────────────────────────────────────
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escHtml(title)}</title>`
  );

  // ── Meta description ────────────────────────────────────────────────────────
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escAttr(description)}" />`
  );

  // ── Canonical ───────────────────────────────────────────────────────────────
  html = html.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${escAttr(canonical)}" />`
  );

  // ── OG tags ─────────────────────────────────────────────────────────────────
  html = html.replace(
    /(<meta property="og:url"\s+content=")[^"]*(")/,
    `$1${escAttr(ogUrl)}$2`
  );
  html = html.replace(
    /(<meta property="og:title"\s+content=")[^"]*(")/,
    `$1${escAttr(ogTitle || title)}$2`
  );
  html = html.replace(
    /(<meta property="og:description"\s+content=")[^"]*(")/,
    `$1${escAttr(ogDescription || description)}$2`
  );
  html = html.replace(
    /(<meta property="og:image"\s+content=")[^"]*(")/,
    `$1${escAttr(ogImage)}$2`
  );

  // ── Twitter tags ─────────────────────────────────────────────────────────────
  html = html.replace(
    /(<meta name="twitter:title"\s+content=")[^"]*(")/,
    `$1${escAttr(ogTitle || title)}$2`
  );
  html = html.replace(
    /(<meta name="twitter:description"\s+content=")[^"]*(")/,
    `$1${escAttr(ogDescription || description)}$2`
  );
  html = html.replace(
    /(<meta name="twitter:image"\s+content=")[^"]*(")/,
    `$1${escAttr(ogImage)}$2`
  );

  // ── noindex ──────────────────────────────────────────────────────────────────
  if (noindex) {
    html = html.replace(
      '</head>',
      '  <meta name="robots" content="noindex" />\n</head>'
    );
  }

  // ── JSON-LD ──────────────────────────────────────────────────────────────────
  if (ldJson) {
    const tag = `  <script type="application/ld+json">\n${JSON.stringify(ldJson, null, 2)}\n  </script>\n</head>`;
    html = html.replace('</head>', tag);
  }

  return html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

// Resolve a car's local image to an absolute URL for OG tags.
// If the image path starts with /cars/ it lives in public/, else use social card.
function ogImageUrl(car) {
  if (car.image && car.image.startsWith('/cars/')) {
    return `${SITE_URL}${car.image}`;
  }
  return `${SITE_URL}/social-card.png`;
}

let written = 0;

// ── 1. Per-car spec pages ─────────────────────────────────────────────────────
for (const car of cars) {
  const title       = `${car.year} ${car.brand} ${car.model} — ${SITE_NAME}`;
  const description = `${car.horsepower} hp, ${car.topSpeedMph} mph top speed, $${Number(car.priceUsd).toLocaleString()} MSRP — see the full spec sheet on APEX.`;
  const url         = `${SITE_URL}/car/${car.id}`;
  const image       = ogImageUrl(car);

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${car.year} ${car.brand} ${car.model}`,
    brand: { '@type': 'Brand', name: car.brand },
    image: image,
    description: car.blurb || description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: car.priceUsd,
      availability: 'https://schema.org/InStock',
    },
  };

  const html = buildHtml({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    canonical: url,
    ldJson,
  });

  const outDir = path.join(DIST_DIR, 'car', car.id);
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  written++;
}
console.log(`✓ Wrote ${written} car spec pages`);

// ── 2. Per-car bracket result (shareable champion) pages ──────────────────────
written = 0;
for (const car of cars) {
  const title       = `${car.year} ${car.brand} ${car.model} — APEX Bracket Champion`;
  const description = `Someone crowned the ${car.year} ${car.brand} ${car.model} champion of an APEX bracket. Think you'd pick differently?`;
  const url         = `${SITE_URL}/bracket/result/${car.id}`;
  const image       = ogImageUrl(car);

  const html = buildHtml({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    canonical: url,
  });

  const outDir = path.join(DIST_DIR, 'bracket', 'result', car.id);
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  written++;
}
console.log(`✓ Wrote ${written} bracket result pages`);

// ── 3. /catalog ───────────────────────────────────────────────────────────────
{
  const url  = `${SITE_URL}/catalog`;
  const html = buildHtml({
    title:       `Full Car Catalog — ${SITE_NAME}`,
    description: `Browse and filter ${cars.length} sports cars, supercars, and hypercars by horsepower, price, top speed, and more.`,
    ogImage:     `${SITE_URL}/social-card.png`,
    ogUrl:       url,
    canonical:   url,
  });
  ensureDir(path.join(DIST_DIR, 'catalog'));
  fs.writeFileSync(path.join(DIST_DIR, 'catalog', 'index.html'), html);
  console.log('✓ Wrote /catalog');
}

// ── 4. /bracket ───────────────────────────────────────────────────────────────
{
  const url  = `${SITE_URL}/bracket`;
  const html = buildHtml({
    title:       `Start a Bracket — ${SITE_NAME}`,
    description: 'Choose a division and pit 16 machines head-to-head in an elimination bracket to reveal your exact automotive taste profile.',
    ogImage:     `${SITE_URL}/social-card.png`,
    ogUrl:       url,
    canonical:   url,
  });
  ensureDir(path.join(DIST_DIR, 'bracket'));
  fs.writeFileSync(path.join(DIST_DIR, 'bracket', 'index.html'), html);
  console.log('✓ Wrote /bracket');
}

// ── 5. /garage (noindex) ──────────────────────────────────────────────────────
{
  const url  = `${SITE_URL}/garage`;
  const html = buildHtml({
    title:       `My Garage — ${SITE_NAME}`,
    description: 'Your personally saved cars from the APEX catalog.',
    ogImage:     `${SITE_URL}/social-card.png`,
    ogUrl:       url,
    canonical:   url,
    noindex:     true,
  });
  ensureDir(path.join(DIST_DIR, 'garage'));
  fs.writeFileSync(path.join(DIST_DIR, 'garage', 'index.html'), html);
  console.log('✓ Wrote /garage (noindex)');
}

// ── 6. Homepage JSON-LD (WebSite schema) ──────────────────────────────────────
{
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Put the world\'s best sports cars, supercars, and hypercars head-to-head in elimination brackets to discover your exact taste profile.',
  };
  const homeHtml = buildHtml({
    title:       `${SITE_NAME} — Find Your Ultimate Machine`,
    description: 'Put the world\'s best sports cars, supercars, and hypercars head-to-head in elimination brackets to discover your exact taste profile.',
    ogImage:     `${SITE_URL}/social-card.png`,
    ogUrl:       SITE_URL + '/',
    canonical:   SITE_URL + '/',
    ldJson:      websiteLd,
  });
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml);
  console.log('✓ Rewrote root /index.html with WebSite JSON-LD');
}

// ── 7. sitemap.xml ────────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];

const carUrls = cars.map(
  (c) => `  <url>\n    <loc>${SITE_URL}/car/${c.id}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
).join('\n');

const resultUrls = cars.map(
  (c) => `  <url>\n    <loc>${SITE_URL}/bracket/result/${c.id}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/catalog</loc>
    <lastmod>${today}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/bracket</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>
${carUrls}
${resultUrls}
</urlset>
`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
console.log(`✓ Wrote sitemap.xml (${2 + cars.length * 2} URLs)`);

console.log('\n🏁 Prerender complete.');
