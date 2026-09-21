const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://blog.yasama-dair.com';
const LANGUAGES = ['tr', 'en', 'de'];
const ROUTES = ['index', 'hikayem', 'felsefe', 'podcast', 'fotograflar', 'videolar', 'haberler', 'iletisim', 'tesekkurler'];
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const route = (name, lang = 'tr') => `${name}${lang === 'tr' ? '' : `.${lang}`}.html`;
function publicPath(value) {
  if (typeof value !== 'string' || !value || /[\\\u0000-\u001f]/.test(value) || value.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(value)) throw new Error(`Invalid local asset path: ${value}`);
  const full = path.resolve(ROOT, value);
  if (!full.startsWith(ROOT + path.sep)) throw new Error(`Asset outside project: ${value}`);
  return full;
}
function readContent(lang = 'tr') {
  const context = {window: {}};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, `content${lang === 'tr' ? '' : `.${lang}`}.js`), 'utf8'), context, {timeout: 1000});
  const data = JSON.parse(JSON.stringify(context.window.YASAMA_DAIR_CONTENT));
  const ids = new Set(), aliases = new Set();
  for (const episode of data.podcasts) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(episode.id || '') || ids.has(episode.id)) throw new Error(`Missing, invalid or duplicate podcast id: ${episode.id}`);
    ids.add(episode.id);
    if (episode.legacyAnchor) {
      if (!/^episode-audio-\d+$/.test(episode.legacyAnchor) || aliases.has(episode.legacyAnchor)) throw new Error(`Invalid or duplicate legacy podcast anchor: ${episode.legacyAnchor}`);
      aliases.add(episode.legacyAnchor);
    }
  }
  return data;
}
function paragraphs(item) {
  return (item.file ? fs.readFileSync(publicPath(item.file), 'utf8') : String(item.text || '')).trim().split(/\n\s*\n/).filter(Boolean);
}
module.exports = {ROOT, ORIGIN, LANGUAGES, ROUTES, escape, route, publicPath, readContent, paragraphs};
