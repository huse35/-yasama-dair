const fs = require('fs');
const path = require('path');
const mm = require('music-metadata'); // music-metadata kütüphanesini dahil ediyoruz
const vm = require('vm'); // content.js'i güvenli bir şekilde çalıştırmak için

/**
 * Yaşama Dair - RSS Feed Otomatik Güncelleyici
 * Bu script content.js dosyasındaki podcast listesini okur ve feed.xml dosyasını üretir.
 */

const CONTENT_PATH = path.join(__dirname, 'content.js');
const FEED_PATH = path.join(__dirname, 'feed.xml');

async function generateRSS() { // Fonksiyonu async yapıyoruz
    try {
        const fileContent = fs.readFileSync(CONTENT_PATH, 'utf8');
        
        // content.js dosyasını güvenli bir şekilde çalıştırıp YASAMA_DAIR_CONTENT objesini alalım
        const sandbox = { window: {} };
        vm.createContext(sandbox); // Yeni bir sanal ortam oluştur
        vm.runInContext(fileContent, sandbox); // content.js'i sanal ortamda çalıştır
        
        const contentData = sandbox.window.YASAMA_DAIR_CONTENT;
        if (!contentData || !contentData.podcasts) {
            throw new Error("content.js içinde 'window.YASAMA_DAIR_CONTENT.podcasts' bulunamadı.");
        }

        const podcasts = contentData.podcasts;

        // Eğer podcasts dizisi yoksa veya boşsa hata fırlat
        if (!Array.isArray(podcasts) || podcasts.length === 0) {
            console.warn("⚠️ content.js içinde hiç podcast bulunamadı. feed.xml boş oluşturulacak.");
            // Devam edip boş bir RSS oluşturabiliriz veya hata fırlatabiliriz. Şimdilik devam edelim.
        }

        // Bölümleri tarihe göre sıralayalım (En yeni en üstte - RSS standartı)
        podcasts.sort((a, b) => new Date(b.date) - new Date(a.date));

        const itemsXmlPromises = podcasts.map(async (p, index) => { // Her bölüm için duration hesaplaması async olacak
            const episodeNum = podcasts.length - index;
            const d = new Date(p.date);
            
            let duration = '00:00:00'; // Varsayılan süre
            const audioFilePath = path.join(__dirname, p.audio);

            try {
                const metadata = await mm.parseFile(audioFilePath, { duration: true });
                if (metadata.format && metadata.format.duration) {
                    const totalSeconds = Math.round(metadata.format.duration);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;

                    const pad = (num) => String(num).padStart(2, '0');
                    duration = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                }
            } catch (err) {
                console.warn(`⚠️ Ses dosyası süresi okunamadı: ${p.audio} - Hata: ${err.message}`);
                // Hata durumunda varsayılan süreyi kullanmaya devam ederiz.
            }

            
            // RSS standart tarih formatı (RFC 822)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const pubDate = `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()} 10:00:00 +0300`;

            return `    <item>
      <title>${p.title}</title>
      <itunes:author>Hüseyin Emil</itunes:author>
      <itunes:summary>${p.description}</itunes:summary>
      <itunes:image href="https://blog.yasama-dair.com/${p.cover}" />
      <enclosure url="https://blog.yasama-dair.com/${p.audio}" length="0" type="audio/mpeg" />
      <guid isPermaLink="false">https://blog.yasama-dair.com/${p.audio}</guid>
      <pubDate>${pubDate}</pubDate>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:episode>${episodeNum}</itunes:episode>
      <itunes:season>1</itunes:season>
      <itunes:episodeType>full</itunes:episodeType>
    </item>`;
        });

        const itemsXml = (await Promise.all(itemsXmlPromises)).join('\n');
        const rssTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Yaşama Dair | Hocanın Yaşam Günlüğü</title>
    <link>https://blog.yasama-dair.com</link>
    <language>tr</language>
    <copyright>© 2026 Hüseyin Emil</copyright>
    <itunes:author>Hüseyin Emil</itunes:author>
    <itunes:summary>64 yıllık bir yolculuğun tortusu, hayatın içinden süzülen sesler ve vizörden yansıyan kareler.</itunes:summary>
    <itunes:owner>
      <itunes:name>Hüseyin Emil</itunes:name>
      <itunes:email>iletisim@yasama-dair.com</itunes:email>
    </itunes:owner>
    <itunes:image href="https://blog.yasama-dair.com/Fotos.img/yasama-dair.jpg" />
    <itunes:category text="Society &amp; Culture" />
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>no</itunes:explicit>
${itemsXml}
  </channel>
</rss>`;

        fs.writeFileSync(FEED_PATH, rssTemplate, 'utf8');
        console.log('✅ feed.xml başarıyla güncellendi!');
    } catch (error) {
        console.error('❌ Hata oluştu:', error.message);
    }
}

generateRSS();