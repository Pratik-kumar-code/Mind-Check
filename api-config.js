/* One API origin for both local development and the deployed Netlify site. */
(function () {
  const configScript = document.currentScript;
  const addResponsiveStyles = function () {
    const responsiveStyles = document.createElement("link");
    responsiveStyles.rel = "stylesheet";
    responsiveStyles.href = new URL("responsive.css", configScript.src).href;
    document.head.appendChild(responsiveStyles);
  };
  // Append after page-specific styles so the narrow-screen rules consistently win.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addResponsiveStyles, { once: true });
  } else {
    addResponsiveStyles();
  }
  const localApi = "http://localhost:5000";
  const productionApi = "https://mind-check-27vi.onrender.com";
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const originalFetch = window.fetch.bind(window);

  window.API_BASE_URL = isLocal ? localApi : productionApi;
  window.apiUrl = function (path) {
    return window.API_BASE_URL + (path.startsWith("/") ? path : "/" + path);
  };
  window.apiFetch = async function (path, options, timeoutMs) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs || 45000);
    try {
      return await originalFetch(window.apiUrl(path), { ...(options || {}), signal: controller.signal });
    } finally {
      window.clearTimeout(timeout);
    }
  };

  // Keeps older pages working while all new requests use apiUrl() explicitly.
  window.fetch = function (input, options) {
    if (typeof input === "string" && input.startsWith(localApi)) {
      input = window.API_BASE_URL + input.slice(localApi.length);
    }
    return originalFetch(input, options);
  };
})();
