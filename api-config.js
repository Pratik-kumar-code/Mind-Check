/*
 * Local development uses the Express server on port 5000. For Netlify,
 * replace the Render URL below with your deployed backend URL.
 */
(function () {
  const localApi = "http://localhost:5000";
  const productionApi = "https://mind-check-27vi.onrender.com";

  window.API_BASE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? localApi
      : productionApi;

  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, options) {
    if (typeof input === "string" && input.startsWith(localApi)) {
      input = window.API_BASE_URL + input.slice(localApi.length);
    }
    return originalFetch(input, options);
  };
})();
