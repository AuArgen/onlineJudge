let installed = false;

// The app stores the JWT in localStorage and attaches it to every request by
// hand; nothing ever clears it when it expires. That leaves pages stuck in a
// broken half-authenticated state (spinners that never resolve, empty lists,
// silently failing submits) once the token goes stale. Patch fetch once at
// the root so any 401 from an authenticated request forces a clean re-login
// instead of leaving each page to fail differently.
export function installAuthInterceptor() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (async (...args: Parameters<typeof fetch>) => {
    const response = await originalFetch(...args);

    if (response.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/auth/login')) {
        localStorage.setItem('returnTo', window.location.pathname + window.location.search);
        window.location.href = '/auth/login?expired=1';
      }
    }

    return response;
  }) as typeof fetch;
}
