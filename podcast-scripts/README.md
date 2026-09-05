# 60 Yaş Üzerinde — sesli çeviriler

Kaynak kayıt: `ses/60-yas-uzerinde.mp3` (yaklaşık 7 dakika 4 saniye).

- `60-yas-uzerinde.source.json`: Yerel faster-whisper small modeliyle çıkarılan zamanlı otomatik döküm. Otomatik tanıma hataları içerebilir.
- `60-yas-uzerinde.tr.txt`: Aynı otomatik dökümün düz metni.
- `60-yas-uzerinde.de.txt`, `60-yas-uzerinde.en.txt`: Kaynağın kapsamı ve anlamı korunarak hazırlanmış Almanca ve İngilizce konuşma metinleri. Duraksamalar ve bazı söz tekrarları akıcılık için düzenlenmiştir.

**Kaynak kaydı son cümlenin ortasında kesilmektedir.** Son 26 saniye ayrıca çözümlenerek bu kesinti doğrulanmıştır. Çeviriler mevcut kaydı kapsar; eksik devam yazılmamıştır. Asıl kaydın daha uzun sürümü sağlanırsa son bölüm güncellenmelidir.

Her dilde sohbet metni tek bir yapay anlatıcı sesiyle okunur. Asıl konuşmacıların sesleri klonlanmamıştır. Web sayfasında yapay seslendirme belirtilir. Çeviriler birer yeni MP3 dosyasıdır; Türkçe asıl dosya değiştirilmez.

## Kullanılan sesler

- Almanca: Piper `de_DE-thorsten-high`. [Model bilgisi](https://huggingface.co/rhasspy/piper-voices/blob/main/de/de_DE/thorsten/high/MODEL_CARD). Thorsten-Voice veri kümesi CC0 olarak belirtilir.
- İngilizce: Piper `en_US-ljspeech-high`. [Model bilgisi](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/high/MODEL_CARD). LJ Speech veri kümesi kamu malı olarak belirtilir.
- Model deposu: [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices), MIT. Model dosyaları bu projeye dahil edilmez.
- Üretim motoru: [Piper](https://github.com/OHF-Voice/piper1-gpl), GPL-3.0. Motor kodu ve bağımlılıkları bu projeye dahil edilmez.

## Yeniden seslendirme

Linux ve libseccomp, Python 3.12, `piper-tts==1.8.0`, `onnxruntime==1.29.0` ve FFmpeg kullanılmıştır. Ses modelleri ile eşleşen `.onnx.json` yapılandırmalarının önceden yerel bir klasörde bulunması gerekir. Bu betik model indirmez. Ses motoru yüklenmeden önce işlem düzeyinde ağ erişimi libseccomp ile engellenir ve engel doğrulanır; doğrulama başarısızsa ses üretimi başlamaz. ONNX Runtime telemetrisi ayrıca desteklenen API üzerinden kapatılır. Fal hesabı veya başka bir ücretli servis gerekli değildir.

```sh
python scripts/render-podcast.py --language de --voices-dir /path/to/voices --work-dir /path/to/audio-work
python scripts/render-podcast.py --language en --voices-dir /path/to/voices --work-dir /path/to/audio-work
npm run build
npm run check
```

Sesler tek kanallı, 22.050 Hz, 64 kbit/s MP3 olarak kaydedilir. Konuşma temposu ve paragraf durakları ayarlanır; ses yüksekliği iki geçişli ölçümle yaklaşık -19 LUFS hedeflenerek dengelenir. Ses üretimi normal Netlify derlemesinin parçası değildir. Kaynak metinler ve üretim betikleri ziyaretçilere sunulan `dist/` klasörüne kopyalanmaz.
