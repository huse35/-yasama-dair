const fs = require('node:fs');
const path = require('node:path');
const { ROOT, ORIGIN, LANGUAGES, ROUTES, escape: e, route, publicPath, readContent } = require('./scripts/site-lib');

async function generateRSS() {
  const { parseFile } = await import('music-metadata');
  const podcasts = [...readContent('tr').podcasts].sort((a, b) => b.date.localeCompare(a.date));
  const items = await Promise.all(podcasts.map(async (p, index) => {
    const audioPath = publicPath(p.audio);
    const metadata = await parseFile(audioPath, { duration: true });
    const duration = Math.round(metadata.format.duration || 0);
    if (!duration) throw new Error(`Missing audio duration: ${p.audio}`);
    const audioURL = new URL(p.audio, ORIGIN + '/').href;
    const pubDate = new Date(p.date + 'T10:00:00+03:00').toUTCString();
    return `    <item>
      <title>${e(p.title)}</title>
      <description>${e(p.description)}</description>
      <link>${ORIGIN}/podcast.html#episode-audio-${index}</link>
      <itunes:author>Hüseyin Emil</itunes:author>
      <itunes:summary>${e(p.description)}</itunes:summary>
      <itunes:image href="${e(new URL(p.cover, ORIGIN + '/').href)}" />
      <enclosure url="${e(audioURL)}" length="${fs.statSync(audioPath).size}" type="audio/mpeg" />
      <guid isPermaLink="false">${e(audioURL)}</guid>
      <pubDate>${pubDate}</pubDate>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:episode>${podcasts.length - index}</itunes:episode>
      <itunes:season>1</itunes:season>
      <itunes:episodeType>full</itunes:episodeType>
    </item>`;
  }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Yaşama Dair | Hocanın Yaşam Günlüğü</title>
    <link>${ORIGIN}</link>
    <description>Hüseyin Emil’den hayata dair hikâyeler, düşünceler ve sesli notlar.</description>
    <language>tr</language>
    <copyright>© 2026 Hüseyin Emil</copyright>
    <atom:link href="${ORIGIN}/feed.xml" rel="self" type="application/rss+xml" />
    <itunes:author>Hüseyin Emil</itunes:author>
    <itunes:summary>Bir ömrün içinden hikâyeler, düşünceler ve sesli notlar.</itunes:summary>
    <itunes:owner><itunes:name>Hüseyin Emil</itunes:name><itunes:email>iletisim@yasama-dair.com</itunes:email></itunes:owner>
    <itunes:image href="${ORIGIN}/Fotos.img/yasama-dair.jpg" />
    <itunes:category text="Society &amp; Culture" />
    <itunes:type>episodic</itunes:type><itunes:explicit>no</itunes:explicit>
${items.join('\n')}
  </channel>
</rss>\n`;
  fs.writeFileSync(path.join(ROOT, 'feed.xml'), xml);
  const sitemap = ROUTES.filter(page => page !== 'tesekkurler').flatMap(page => LANGUAGES.map(lang => {
    const absolute = l => `${ORIGIN}/${page === 'index' && l === 'tr' ? '' : route(page, l)}`;
    return `<url><loc>${absolute(lang)}</loc>${LANGUAGES.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${absolute(l)}" />`).join('')}</url>`;
  }));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemap.join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  console.log(`RSS: ${items.length} episodes with verified lengths and durations. Sitemap: ${sitemap.length} routes.`);
}
generateRSS().catch(error => { console.error(error.message); process.exitCode = 1; });
