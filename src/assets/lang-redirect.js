(() => {
  try {
    const path = location.pathname;
    // Only redirect from the root (avoid loops on /en/ or /da/)
    if (path !== '/' && path !== '/index.html') return;

    // Respect an explicit override if you add one later
    if (localStorage.getItem('langOverride')) return;
    const qs = new URLSearchParams(location.search);
    if (qs.has('lang')) return;

    const langs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage].filter(Boolean);

    const wantsDa = (langs || []).some(l => String(l).toLowerCase().startsWith('da'));
    if (wantsDa) location.replace('/da/');
  } catch {}
})();