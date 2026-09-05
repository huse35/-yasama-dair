# Yaşama Dair

Hüseyin Emil’in Türkçe, Almanca ve İngilizce yaşam günlüğü. Hikâyeler, düşünceler, podcast bölümleri, fotoğraflar ve videolar için statik bir web sitesi.

## Yerelde çalıştırma

Node.js 22 veya üzeri gerekir.

```sh
npm ci
npm run build
npm run check
```

`dist/` yayımlanacak dosyaları içerir. Ana klasördeki HTML sayfaları da güncellenir. JavaScript kapalıyken metinler, gezinme bağlantıları, yerel ses/video oynatıcıları ve iletişim formu kullanılabilir. Fotoğraf penceresi, mobil menü ve YouTube oynatıcısı JavaScript ile geliştirilir.

## İçerikleri düzenleme

- `content.js`: Türkçe yazılar, podcast bilgileri, fotoğraflar, haberler ve onaylanmış yorumlar.
- `content.en.js`, `content.de.js`: Aynı içeriklerin İngilizce ve Almanca sürümleri. Her bölüm kendi dilindeki ses dosyasını kullanabilir; `audioLabel` kayıt dilini ve varsa yapay seslendirmeyi belirtir. Bu alan yoksa Türkçe kayıt etiketi kullanılır.
- `writings/`: Uzun yazılar. Çevrilmiş yazılarda `.en.txt` ve `.de.txt` dosyalarını kullanın.
- `site-copy.js`: Menü, sayfa başlıkları, açıklamalar ve form metinleri.
- `scripts/build-pages.js`: Ortak HTML şablonları ve sayfa düzenleri.
- `style.css`: Renkler, yazı karakterleri ve masaüstü/mobil yerleşimleri.
- `Fotos.img/`, `ses/`, `video/`: Mevcut görsel, ses ve video dosyaları.

HTML sayfaları üretilir; kalıcı değişiklikleri şablonlara veya içerik dosyalarına yapın. Ardından `npm run build` çalıştırın. Mevcut `.html` adresleri korunur.

### Podcast eklemek

1. Ses dosyasını `ses/` klasörüne koyun. Mevcut oynatıcı ve RSS akışı MP3 kullanır.
2. Üç içerik dosyasındaki `podcasts` listelerine kaydı ekleyin; başlık, açıklama, kapak, ses dosyası ve tarihi belirtin.
3. `notes` düz metindir. HTML bağlantısı eklemeyin.
4. Derleme tüm dillerdeki farklı ses dosyalarının gerçek boyutlarını ve kayıt sürelerini hesaplar. Eksik ses dosyası veya geçersiz kayıt varsa derleme başarısız olur.

### Sesli çeviriler

“60 Yaş Üzerinde” bölümünün Almanca ve İngilizce sesli çevirileri ilgili dil sayfalarında oynatılır. Türkçe asıl kayıt ve Türkçe RSS akışı korunur. Diğer bölümün kaydı Türkçedir. Kaynak dökümü, çeviri metinleri, kullanılan sesler ve yeniden üretim bilgileri `podcast-scripts/README.md` içindedir.

### Yazı veya fotoğraf eklemek

`philosophy` ya da `photos` listesine yeni kayıt ekleyin. Uzun yazılarda `file`, kısa yazılarda `text` kullanın. Dil sürümlerini aynı sırada tutun. Fotoğraf yolları gerçek dosyalarla eşleşmelidir. Sonrasında yeniden derleyin.

### Yorumları yönetmek

Formlar Netlify Forms ile çalışır. Netlify tarafında form algılamanın açık olması ve yeni dağıtımda formların algılanması gerekir. Form adları korunur: `yorumlar`, `comments`, `comments-de`. Sayfa, dil ve yayımlama onayı gönderime eklenir. İstenmeyen gönderimler için gizli honeypot alanı bulunur.

Gönderiler otomatik yayımlanmaz. Netlify’de inceleyip yalnızca onayladığınız ad, tarih ve yorum metnini ilgili `content*.js` dosyasındaki `comments` listesine ekleyin. **E-posta adreslerini içerik dosyalarına koymayın.** Var olan okur yorumu korunmuştur. Kullanılmayan ve moderasyonsuz gönderi yayımlayabilen eski örnek senkronizasyon betiği kaldırılmıştır.

Bir statik dosya sunucusu form gönderilerini işlemez. Yerel kontrol yalnızca form yapısını doğrular; gerçek teslimatı yayımdan sonra Netlify panelinde doğrulayın.

## Yayınlama

Mevcut Netlify yapılandırması kullanılır:

- Derleme: `npm run build`
- Yayın klasörü: `dist`
- Node.js: `22`

Yalnızca ziyaretçilere gerekli dosyalar `dist/` içine alınır; derleme betikleri, bağımlılıklar ve proje ayarları yayımlanmaz. RSS, sitemap, robots dosyası ve 404 sayfası dahildir. Kalıcı site adresi `scripts/site-lib.js` içinde tanımlanmıştır: `https://blog.yasama-dair.com`.

YouTube videoları ziyaretçi oynatmayı seçene kadar yüklenmez. Yazı tipleri sistemdeki yazı tipleridir; harici font veya analiz izleyicisi çağrısı yapılmaz. Podcast kapak görseli ve önceden mevcut sosyal önizleme görseli korunmuştur.

## Kontroller

`npm run check`, üretilen 27 dil sayfasını ve 404 sayfasını, iç bağlantıları, dosyaları, bölüm bağlantılarını, form alanlarını, dil geçişlerini, metin kontrastlarını, podcast dosya boyutlarını ve yayın klasörünü denetler.

Bu kontroller tarayıcıda görsel test veya gerçek Netlify form teslimatı testi yerine geçmez. Değişiklikleri yayınlamadan önce bilgisayar ve telefonda kontrol etmek, ayrıca deneme formunun Netlify’ye ulaştığını doğrulamak uygundur.
