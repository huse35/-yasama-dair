(() => {
  const content = window.YASAMA_DAIR_CONTENT;
  if (!content) return;

  let visibleCommentsCount = 5;
  const loadMoreContainer = document.getElementById("loadMoreContainer");
  
  // Get current language from HTML tag
  const currentLang = document.documentElement.lang || "tr";
  
  const i18n = {
    tr: {
      news: "Haber", podcast: "Bölüm", photo: "Fotoğraf", philosophy: "Felsefe",
      loading: "Yazı yükleniyor…", error: "Yazı yüklenemedi.", admin: "Hoca'nın Yanıtı:",
      visitor: "Ziyaretçi", browserAudio: "Tarayıcınız ses dosyasını desteklemiyor."
    },
    en: {
      news: "News", podcast: "Episode", photo: "Photo", philosophy: "Philosophy",
      loading: "Loading…", error: "Could not load writing.", admin: "Teacher's Reply:",
      visitor: "Visitor", browserAudio: "Your browser does not support audio."
    },
    de: {
      news: "Neuigkeiten", podcast: "Folge", photo: "Foto", philosophy: "Philosophie",
      loading: "Wird geladen...", error: "Fehler beim Laden.", admin: "Antwort vom Lehrer:",
      visitor: "Besucher", browserAudio: "Ihr Browser unterstützt dieses Audioformat nicht."
    }
  }[currentLang];

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return String(isoDate);
    let locale = "tr-TR";
    if (currentLang === "en") locale = "en-US";
    else if (currentLang === "de") locale = "de-DE";
    
    return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
  };

  const renderPodcasts = () => {
    const grid = document.getElementById("podcastGrid");
    if (!grid) return;

    const audioMimeTypeFor = (path) => {
      const lower = String(path || "").toLowerCase();
      if (lower.endsWith(".mp3")) return "audio/mpeg";
      if (lower.endsWith(".m4a")) return "audio/mp4";
      if (lower.endsWith(".mp4")) return "audio/mp4";
      if (lower.endsWith(".ogg")) return "audio/ogg";
      if (lower.endsWith(".wav")) return "audio/wav";
      return "audio/mpeg";
    };

    const podcasts = Array.isArray(content.podcasts) ? content.podcasts : [];
    grid.innerHTML = podcasts
      .map((p) => {
        const featuredClass = p.featured ? " featured-podcast" : "";
        const coverStyle = p.cover
          ? ` style="background-image: url('${escapeHtml(p.cover)}');"`
          : "";
        const dateLine = p.date
          ? `<div class="meta-line">${escapeHtml(formatDate(p.date))}</div>`
          : "";
        const audioBlock = p.audio
          ? `
            <audio controls class="audio-player" preload="none">
              <source src="${escapeHtml(p.audio)}" type="${escapeHtml(
                audioMimeTypeFor(p.audio)
              )}">
              ${i18n.browserAudio}
            </audio>
          `
          : "";

        return `
          <div class="premium-card${featuredClass}">
            <div class="card-img"${coverStyle}>
              <div class="card-img-overlay">
                <div class="mic-icon">🎙️</div>
              </div>
            </div>
            <div class="card-body">
              <span class="tag">${escapeHtml(p.tag || i18n.podcast)}</span>
              <h3 class="podcast-title">${escapeHtml(p.title || "")}</h3>
              ${dateLine}
              <p class="card-desc">${escapeHtml(p.description || "")}</p>
              ${audioBlock}
            </div>
          </div>
        `;
      })
      .join("");
  };

  const renderNews = () => {
    const grid = document.getElementById("newsGrid");
    if (!grid) return;

    const items = Array.isArray(content.news) ? content.news : [];
    grid.innerHTML = items
      .map((n) => {
        const coverStyle = n.image
          ? ` style="background-image: url('${escapeHtml(n.image)}');"`
          : "";
        const dateLine = n.date
          ? `<div class="meta-line">${escapeHtml(formatDate(n.date))}</div>`
          : "";
        const link =
          n.link && typeof n.link === "string"
            ? `<a class="card-link" href="${escapeHtml(
                n.link
              )}" target="_blank" rel="noopener noreferrer">Devamı →</a>`
            : "";

        return `
          <div class="premium-card">
            <div class="card-img"${coverStyle}></div>
            <div class="card-body">
              <span class="tag">${i18n.news}</span>
              <h3 class="podcast-title">${escapeHtml(n.title || "")}</h3>
              ${dateLine}
              <p class="card-desc">${escapeHtml(n.text || "")}</p>
              ${link}
            </div>
          </div>
        `;
      })
      .join("");
  };

  const renderPhotos = () => {
    const grid = document.getElementById("photosGrid");
    if (!grid) return;

    const items = Array.isArray(content.photos) ? content.photos : [];
    grid.innerHTML = items
      .map((p) => {
        const coverStyle = p.image
          ? ` style="background-image: url('${escapeHtml(p.image)}');"`
          : "";
        const dateLine = p.date
          ? `<div class="meta-line">${escapeHtml(formatDate(p.date))}</div>`
          : "";
        const caption = p.caption ? `<p class="card-desc">${escapeHtml(p.caption)}</p>` : "";

        const href = p.image ? escapeHtml(p.image) : "#";
        const rel = p.image ? ' rel="noopener noreferrer"' : "";

        return `
          <a class="premium-card photo-card" href="${href}" target="_blank"${rel}>
            <div class="card-img photo-img"${coverStyle}></div>
            <div class="card-body">
              <span class="tag">${i18n.photo}</span>
              <h3 class="podcast-title">${escapeHtml(p.title || "")}</h3>
              ${dateLine}
              ${caption}
            </div>
          </a>
        `;
      })
      .join("");
  };

  const renderPhilosophy = () => {
    const grid = document.getElementById("philosophyGrid");
    if (!grid) return;

    const items = Array.isArray(content.philosophy) ? content.philosophy : [];
    grid.innerHTML = items
      .map((p, index) => {
        const coverStyle = p.image
          ? ` style="background-image: url('${escapeHtml(p.image)}');"`
          : "";
        const dateLine = p.date
          ? `<div class="meta-line">${escapeHtml(formatDate(p.date))}</div>`
          : "";

        const imageBlock = p.image
          ? `<div class="card-img philosophy-img"${coverStyle}></div>`
          : "";

        const isFile = !!p.file && typeof p.file === "string";
        const fileBlock = isFile
          ? `
              <div class="philosophy-file" data-file-index="${escapeHtml(
                String(index)
              )}">
                <div class="philosophy-loading">${i18n.loading}</div>
              </div>
            `
          : "";

        return `
          <article class="premium-card philosophy-card">
            ${imageBlock}
            <div class="card-body">
              <span class="tag">${i18n.philosophy}</span>
              <h3 class="podcast-title">${escapeHtml(p.title || "")}</h3>
              ${dateLine}
              ${fileBlock}
              ${
                !isFile
                  ? `<p class="card-desc philosophy-text">${escapeHtml(
                      p.text || ""
                    )}</p>`
                  : ""
              }
            </div>
          </article>
        `;
      })
      .join("");

    items.forEach((p, index) => {
      if (!p || typeof p.file !== "string") return;
      const container = grid.querySelector(`[data-file-index="${index}"]`);
      if (!container) return;

      fetch(p.file, { cache: "no-cache" }) // Her zaman en güncel içeriği kontrol etmesini sağlar
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        })
        .then((text) => {
          const paragraphs = String(text)
            .split(/\r?\n\s*\r?\n/g)
            .map((s) => s.trim())
            .filter(Boolean);
          container.innerHTML = paragraphs
            .map((para) => `<p class="card-desc philosophy-text">${escapeHtml(para)}</p>`)
            .filter(html => html !== "") // Boş paragrafları temizle
            .join("");
        })
        .catch((err) => {
          console.error("Dosya yükleme hatası:", err);
          container.innerHTML =
            `<div class="philosophy-loading">${i18n.error}</div>`;
        });
    });
  };

  const renderComments = () => {
    const list = document.getElementById("commentDisplayList");
    if (!list) return;

    // Statik yorumlar (content.js)
    const staticItems = Array.isArray(content.comments) ? content.comments : [];
    
    // Dinamik yorumlar (dynamic-comments.js - eğer yüklendiyse)
    const dynamicItems = (window.YASAMA_DAIR_DYNAMIC_COMMENTS && window.YASAMA_DAIR_DYNAMIC_COMMENTS[currentLang]) 
      ? window.YASAMA_DAIR_DYNAMIC_COMMENTS[currentLang] 
      : [];

    // Tüm yorumları birleştir ve tarihe göre (en yeni en üstte) kesin sırala
    const allItems = [...dynamicItems, ...staticItems].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    const visibleItems = allItems.slice(0, visibleCommentsCount);

    list.innerHTML = visibleItems
      .map((c) => {
        const replyBlock = c.reply
          ? `
            <div class="admin-reply" role="note">
              <b>${i18n.admin}</b>
              <p class="comment-text">${escapeHtml(c.reply)}</p>
            </div>
          `
          : "";

        return `
          <div class="comment-item">
            <div class="comment-header">
              <span class="comment-user">${escapeHtml(c.name || i18n.visitor)}</span>
              <span class="comment-date">${escapeHtml(formatDate(c.date))}</span>
            </div>
            <p class="comment-text">${escapeHtml(c.message || "")}</p>
            ${replyBlock}
          </div>
        `;
      })
      .join("");

    if (loadMoreContainer) {
      loadMoreContainer.style.display = allItems.length > visibleCommentsCount ? "block" : "none";
    }
  };

  const btnLoadMore = document.getElementById("btnLoadMore");
  if (btnLoadMore) {
    btnLoadMore.addEventListener("click", () => {
      visibleCommentsCount += 5; // Her tıklamada 5 yorum daha ekle
      renderComments();
    });
  }

  renderPodcasts();
  renderPhotos();
  renderPhilosophy();
  renderNews();
  renderComments();
})();
