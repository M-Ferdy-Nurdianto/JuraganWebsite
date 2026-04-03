const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const nextState = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(nextState));
    siteNav.classList.toggle('open', nextState);
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('open');
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const yearSlot = document.querySelector('#year');
if (yearSlot) {
  yearSlot.textContent = String(new Date().getFullYear());
}

const root = document.documentElement;
const langButtons = document.querySelectorAll('[data-lang-button]');
const i18nNodes = document.querySelectorAll('[data-i18n]');
const descriptionMeta = document.querySelector('meta[name="description"]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeToggleText = themeToggle ? themeToggle.querySelector('.theme-toggle-text') : null;

function initAosAnimations() {
  if (!window.AOS || !document.querySelector('[data-aos]')) {
    return;
  }

  const prefersReducedMotion =
    window.matchMedia &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.AOS.init({
    once: true,
    offset: 24,
    mirror: false,
    duration: 750,
    disable: prefersReducedMotion
  });
}

function updateThemeToggleLabel(theme) {
  if (!themeToggle || !themeToggleText) {
    return;
  }

  const lang = root.getAttribute('lang') === 'en' ? 'en' : 'id';
  const isDark = theme === 'dark';

  const label = isDark
    ? lang === 'en'
      ? themeToggle.dataset.labelLightEn
      : themeToggle.dataset.labelLightId
    : lang === 'en'
      ? themeToggle.dataset.labelDarkEn
      : themeToggle.dataset.labelDarkId;

  if (label) {
    themeToggleText.textContent = label;
  }

  themeToggle.classList.toggle('is-dark', isDark);
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

function applyTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  root.setAttribute('data-theme', nextTheme);
  updateThemeToggleLabel(nextTheme);

  try {
    window.localStorage.setItem('preferred-theme', nextTheme);
  } catch (_error) {
    // Ignore storage errors and keep theme toggle functional.
  }
}

function applyLanguage(language) {
  const nextLanguage = language === 'en' ? 'en' : 'id';
  const titleKey = nextLanguage === 'en' ? 'titleEn' : 'titleId';
  const descriptionKey = nextLanguage === 'en' ? 'descriptionEn' : 'descriptionId';

  root.setAttribute('lang', nextLanguage);

  i18nNodes.forEach((node) => {
    const text = node.dataset[nextLanguage];
    if (text) {
      node.textContent = text;
    }
  });

  const localizedTitle = root.dataset[titleKey];
  if (localizedTitle) {
    document.title = localizedTitle;
  }

  const localizedDescription = root.dataset[descriptionKey];
  if (descriptionMeta && localizedDescription) {
    descriptionMeta.setAttribute('content', localizedDescription);
  }

  langButtons.forEach((button) => {
    const isActive = button.dataset.langButton === nextLanguage;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  updateThemeToggleLabel(currentTheme);

  try {
    window.localStorage.setItem('preferred-language', nextLanguage);
  } catch (_error) {
    // Ignore storage errors to keep language switch functional.
  }
}

langButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyLanguage(button.dataset.langButton);
  });
});

let savedLanguage = 'id';
let savedTheme = 'light';

try {
  const storedLanguage = window.localStorage.getItem('preferred-language');
  if (storedLanguage === 'en' || storedLanguage === 'id') {
    savedLanguage = storedLanguage;
  }

  const storedTheme = window.localStorage.getItem('preferred-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    savedTheme = storedTheme;
  } else if (
    window.matchMedia &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    savedTheme = 'dark';
  }
} catch (_error) {
  // Keep default language and theme when storage is unavailable.
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

applyTheme(savedTheme);
applyLanguage(savedLanguage);
initAosAnimations();
