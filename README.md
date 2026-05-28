# Yaşama Dair

Bu proje tek sayfalık (statik) bir web sayfasıdır: `index.html`.

## Podcast nasıl eklerim?

1. Yeni ses dosyanızı `ses/` klasörüne kopyalayın (mp3 önerilir; `m4a` da olur).
2. (İsteğe bağlı) Bölüm kapağı için bir görseli `Fotos.img/` klasörüne kopyalayın.
3. `content.js` içindeki `podcasts` listesine yeni bir obje ekleyin.

Örnek:

```js
{
  featured: false,
  tag: "Bölüm 02",
  title: "Yeni Bölüm Başlığı",
  description: "Kısa açıklama…",
  cover: "Fotos.img/yeni-kapak.jpg",
  audio: "ses/yeni-bolum.mp3",
  date: "2026-03-05"
}
```

## Haber nasıl eklerim?

1. Haber görselinizi `Fotos.img/` klasörüne kopyalayın (isterseniz boş bırakabilirsiniz).
2. `content.js` içindeki `news` listesine yeni bir obje ekleyin.

Örnek:

```js
{
  date: "2026-03-05",
  title: "Yeni Haber",
  text: "Haber metni…",
  image: "Fotos.img/haber-1.jpg",
  link: null
}
```

## Felsefe yazısı nasıl eklerim?

1. (İsteğe bağlı) Görseli `Fotos.img/` klasörüne kopyalayın.
2. `content.js` içindeki `philosophy` listesine yeni bir obje ekleyin.

Örnek:

```js
{
  date: "2026-03-05",
  title: "Kısa Başlık",
  text: "2-6 cümlelik kısa düşünce…",
  image: "Fotos.img/felsefe-1.jpg" // yoksa null
}
```

Uzun bir yazınız varsa `text` yerine dosyadan yükleyebilirsiniz:

1. Yazıyı `writings/` klasörüne `.txt` olarak koyun.
2. `content.js` içindeki `philosophy` kaydına `file: "writings/....txt"` ekleyin.

## Resim nasıl yüklerim?

- Profil/kapak gibi resimler için: resmi `Fotos.img/` içine koyun ve `content.js` veya `index.html` içindeki yolunu güncelleyin.
- Dosya adı Türkçe karakter içerirse bazen sunucuda sorun çıkarabilir; sorunsuz olması için `a-z`, `0-9`, `-` kullanmak daha güvenlidir.

## Fotoğraf galerisine nasıl eklerim?

1. Fotoğrafı `Fotos.img/` klasörüne kopyalayın.
2. `content.js` içindeki `photos` listesine yeni bir kayıt ekleyin.

Örnek:

```js
{
  date: "2026-03-06",
  title: "Kısa Başlık",
  caption: "1 cümle açıklama…",
  image: "Fotos.img/yeni-foto.jpg"
}
```

## Videoyu siteye nasıl eklerim?

İki yol var:

1) **YouTube’a yükleyip eklemek (önerilir):** `videolar.html` içindeki YouTube `embed/...` linkini değiştiririz.
2) **Video dosyasını siteye koymak:** MP4 dosyasını `video/` klasörüne kopyalayın ve `videolar.html` içindeki
`video/turkiye-politik-korku.mp4` yolunu kendi dosyanızla değiştirin.

## Yorumlar nasıl çalışır?

Sayfaların altında bir “Yorum Bırak” formu var. Bu form **Netlify Forms** ile çalışır:

- Site Netlify’de yayınlanıyorsa, gelen yorumlar Netlify panelinde **Forms** bölümüne düşer.
- Yorumlar sitede otomatik yayınlanmaz; önce siz görürsünüz (moderasyon).
- Netlify’de değilse form çalışmayabilir; o durumda yorumlar için farklı bir çözüm kurarız.
