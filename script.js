const body = document.body;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const accountBtn = document.querySelector(".account-btn");
const navLinks = [...document.querySelectorAll("[data-nav]")];
const views = [...document.querySelectorAll("[data-view]")];
const heroImages = [...document.querySelectorAll(".hero-img")];
const heroDots = [...document.querySelectorAll(".hero-dots button")];
const loginForm = document.querySelector(".login-card");
const logoutBtn = document.querySelector(".logout");
const searchPanel = document.querySelector(".search-panel");
const searchInput = document.querySelector("#siteSearch");
const searchClose = document.querySelector(".search-close");
const searchResults = document.querySelector(".search-results");
const newsFilterBar = document.querySelector("[data-news-filters]");
const newsCards = [...document.querySelectorAll(".wide-news-card")];
const artistCards = [...document.querySelectorAll(".catalog-card")];
const genreFilter = document.querySelector("#genreFilter");
const yearFilter = document.querySelector("#yearFilter");
const provinceFilter = document.querySelector("#provinceFilter");
const clearArtistFilters = document.querySelector("#clearArtistFilters");
let heroIndex = 0;
let heroTimer;
let loggedIn = false;

function showView(name) {
  views.forEach((view) => view.classList.toggle("is-active", view.dataset.view === name));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.nav === name || (name === "login" && link.dataset.nav === "home")));
  header.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setLoggedIn(value) {
  loggedIn = value;
  body.classList.toggle("is-logged", loggedIn);
  accountBtn.innerHTML = loggedIn ? "Mi agenda" : "Iniciar sesi&oacute;n";
  accountBtn.dataset.route = loggedIn ? "profile" : "login";
  accountBtn.setAttribute("href", loggedIn ? "#mi-agenda" : "#login");
  document.querySelectorAll("[data-agenda-action]").forEach((link) => {
    link.textContent = loggedIn ? "Ver" : "Acceder";
    link.dataset.route = loggedIn ? "profile" : "login";
    link.setAttribute("href", loggedIn ? "#mi-agenda" : "#login");
  });
  document.querySelectorAll(".agenda-item p").forEach((text) => {
    if (!text.dataset.original) text.dataset.original = text.innerHTML;
    text.innerHTML = loggedIn ? text.dataset.loggedText : text.dataset.original;
  });
}

function setHeroSlide(index) {
  heroIndex = index;
  heroImages.forEach((image, imageIndex) => image.classList.toggle("active", imageIndex === heroIndex));
  heroDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === heroIndex));
}

function startHeroSlider() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => setHeroSlide((heroIndex + 1) % heroImages.length), 3200);
}

function normalizeText(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getSearchItems() {
  const news = newsCards.map((card) => ({
    title: card.dataset.title,
    meta: card.querySelector("p").textContent,
    image: card.querySelector("img").getAttribute("src"),
    route: "news",
    href: "#noticias",
    text: card.dataset.search,
  }));
  const artists = artistCards.map((card) => ({
    title: card.dataset.title,
    meta: card.querySelector("p").textContent,
    image: card.querySelector("img").getAttribute("src"),
    route: "artists",
    href: "#artistas",
    text: card.dataset.search,
  }));
  return [...news, ...artists];
}

function renderSearchResults(query = "") {
  const cleanQuery = normalizeText(query.trim());
  const items = getSearchItems();
  const matches = cleanQuery
    ? items.filter((item) => normalizeText(`${item.title} ${item.meta} ${item.text}`).includes(cleanQuery))
    : items.slice(0, 5);

  searchResults.innerHTML = matches.length
    ? matches.slice(0, 8).map((item) => `
      <button class="search-result" type="button" data-route="${item.route}" data-href="${item.href}">
        <img src="${item.image}" alt="" />
        <span><b>${item.title}</b><span>${item.meta}</span></span>
      </button>
    `).join("")
    : '<p class="search-empty">No encontramos resultados para esa busqueda.</p>';
}

function openSearch() {
  searchPanel.classList.add("is-open");
  searchPanel.setAttribute("aria-hidden", "false");
  renderSearchResults(searchInput.value);
  searchInput.focus();
}

function closeSearch() {
  searchPanel.classList.remove("is-open");
  searchPanel.setAttribute("aria-hidden", "true");
}

function filterArtists() {
  const genre = genreFilter.value;
  const year = yearFilter.value;
  const province = provinceFilter.value;
  artistCards.forEach((card) => {
    const isVisible =
      (genre === "all" || card.dataset.genre === genre) &&
      (year === "all" || card.dataset.year === year) &&
      (province === "all" || card.dataset.province === province);
    card.classList.toggle("is-hidden", !isVisible);
  });
}

document.addEventListener("click", (event) => {
  const searchResult = event.target.closest(".search-result");
  if (searchResult) {
    closeSearch();
    showView(searchResult.dataset.route);
    history.replaceState(null, "", searchResult.dataset.href);
    return;
  }

  const routeLink = event.target.closest("[data-route]");
  if (!routeLink) return;
  event.preventDefault();
  const route = routeLink.dataset.route;
  showView(route);
  history.replaceState(null, "", routeLink.getAttribute("href"));
});

document.querySelectorAll(".search-btn").forEach((button) => {
  button.addEventListener("click", openSearch);
});

searchClose.addEventListener("click", closeSearch);

searchPanel.addEventListener("click", (event) => {
  if (event.target === searchPanel) closeSearch();
});

searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSearch();
});

newsFilterBar.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const filter = button.dataset.filter;
  newsFilterBar.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  newsCards.forEach((card) => card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter));
});

[genreFilter, yearFilter, provinceFilter].forEach((select) => {
  select.addEventListener("change", filterArtists);
});

clearArtistFilters.addEventListener("click", () => {
  genreFilter.value = "all";
  yearFilter.value = "all";
  provinceFilter.value = "all";
  filterArtists();
});

menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    setHeroSlide(index);
    startHeroSlider();
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setLoggedIn(true);
  showView("home");
});

logoutBtn.addEventListener("click", () => {
  setLoggedIn(false);
  showView("home");
});

setLoggedIn(false);
showView("home");
startHeroSlider();
