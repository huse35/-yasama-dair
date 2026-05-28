(() => {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const isPage = document.body.classList.contains("page");
  if (isPage) nav.classList.add("scrolled");

  window.addEventListener("scroll", () => {
    if (isPage) {
      nav.classList.add("scrolled");
      return;
    }
    if (window.scrollY > 100) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });
})();

