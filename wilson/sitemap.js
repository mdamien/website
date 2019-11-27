function buildSitemapRecord(url) {
  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    '    <changefreq>daily</changefreq>',
    '    <priority>0.7</priority>',
    '  </url>'
  ];
}

module.exports = function createSitemapFromPages(siteUrl, pathPrefix, pages) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">'
  ];

  pages.forEach(page => {
    const frUrl = siteUrl + pathPrefix + page.permalinks.fr;
    const enUrl = siteUrl + pathPrefix + page.permalinks.en;

    lines.push.apply(lines, buildSitemapRecord(frUrl));
    lines.push.apply(lines, buildSitemapRecord(enUrl));
  });

  lines.push('</urlset>');

  return lines.join('\n');
};
