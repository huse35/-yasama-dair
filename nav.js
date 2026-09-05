(() => {
  document.documentElement.classList.add('js');
  const toggle = document.querySelector('.menu-toggle');
  const shell = document.querySelector('.navigation-shell');
  if (!toggle || !shell) return;
  const setOpen = open => {
    shell.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false); toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!shell.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', () => setOpen(false));
})();
