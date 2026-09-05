/* Progressive enhancement. Reading, navigation and native players work without JS. */
(() => {
  const media = [...document.querySelectorAll('audio, video')];
  const stopYouTube = () => document.querySelectorAll('.video-facade iframe').forEach(frame => {
    const button = frame.parentElement.querySelector('[data-youtube]');
    frame.remove(); if (button) button.hidden = false;
  });
  media.forEach(player => {
    player.addEventListener('play', () => {
      media.forEach(other => { if (other !== player) other.pause(); });
      stopYouTube();
      const status = player.closest('article')?.querySelector('.media-status');
      if (status) status.textContent = '';
    });
    const onError = () => {
      const status = player.closest('article')?.querySelector('.media-status');
      if (status) status.textContent = document.body.dataset.mediaError;
    };
    player.addEventListener('error', onError);
    player.querySelectorAll('source').forEach(source => source.addEventListener('error', onError));
  });
  document.querySelectorAll('[data-youtube]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const id = button.dataset.youtube;
      if (!/^[\w-]{11}$/.test(id)) return;
      media.forEach(player => player.pause());
      stopYouTube();
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      frame.title = button.getAttribute('aria-label');
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      button.hidden = true;
      button.parentElement.append(frame);
      frame.focus();
    });
  });
  const dialog = document.querySelector('.photo-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    let opener;
    document.querySelectorAll('[data-photo]').forEach(anchor => {
      anchor.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const url = new URL(anchor.dataset.photo, location.href);
        if (url.origin !== location.origin) return;
        event.preventDefault(); opener = anchor;
        const image = dialog.querySelector('img');
        image.src = url.href; image.alt = anchor.querySelector('img').alt;
        dialog.querySelector('.dialog-caption p').textContent = anchor.dataset.caption;
        dialog.querySelector('.dialog-caption a').href = url.href;
        dialog.showModal();
      });
    });
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => opener?.focus());
  }
  document.querySelector('[data-more-comments]')?.addEventListener('click', event => {
    [...document.querySelectorAll('[data-extra-comment][hidden]')].slice(0,5).forEach(comment => { comment.hidden = false; });
    if (!document.querySelector('[data-extra-comment][hidden]')) event.currentTarget.hidden = true;
  });
  // Native POST and validation; the hosting form handler owns the response.
  document.querySelectorAll('form[data-netlify]').forEach(form => {
    const button = form.querySelector('[type=submit]'), initial = button.innerHTML;
    form.addEventListener('submit', () => { button.textContent = button.dataset.sending; button.disabled = true; });
    window.addEventListener('pageshow', () => { button.innerHTML = initial; button.disabled = false; });
  });
})();
