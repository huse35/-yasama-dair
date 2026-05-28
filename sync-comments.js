const fs = require('fs');
const axios = require('axios'); // 'npm install axios' yapmanız gerekebilir

/**
 * Netlify Forms üzerinden onaylanmış yorumları çeker 
 * ve content.js formatına uygun bir dosyaya yazar.
 */

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
// Not: Eğer alan adı çalışmazsa Netlify panelindeki 'API ID'yi (UUID formatında) buraya yazın.
const SITE_ID = 'blog.yasama-dair.com'; 

async function syncComments() {
    try {
        console.log('Netlify üzerinden onaylanmış yorumlar çekiliyor...');
        
        // Sitenizdeki tüm form gönderimlerini çekiyoruz
        const response = await axios.get(
            `https://api.netlify.com/api/v1/sites/${SITE_ID}/submissions`,
            { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
        );

        const submissions = response.data;

        // Yorumları dillerine göre gruplayalım
        const dynamicContent = {
            tr: [],
            en: [],
            de: []
        };

        submissions.forEach(sub => {
            // Formdaki gizli "page" alanına bakarak dili tespit ediyoruz
            const page = String(sub.data.page || '').toLowerCase();
            const lang = page.includes('en') ? 'en' : (page.includes('de') ? 'de' : 'tr');

            const comment = {
                name: sub.data.name || (lang === 'tr' ? 'Ziyaretçi' : (lang === 'de' ? 'Besucher' : 'Visitor')),
                date: sub.created_at.split('T')[0],
                message: sub.data.message,
                reply: null // Netlify panelinden manuel yanıt verdiyseniz buraya işlenebilir
            };

            dynamicContent[lang].push(comment);
        });

        // Dosya içeriğini oluştur (window objesine ekler)
        const fileContent = `window.YASAMA_DAIR_DYNAMIC_COMMENTS = ${JSON.stringify(dynamicContent, null, 2)};`;
        
        fs.writeFileSync('./dynamic-comments.js', fileContent);
        console.log('✅ Dinamik yorumlar başarıyla senkronize edildi!');
        
    } catch (error) {
        console.error('❌ Yorum senkronizasyon hatası:', error.response ? error.response.data : error.message);
    }
}

syncComments();