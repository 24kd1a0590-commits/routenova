/**
 * ROUTENOVA API CLIENT
 * Connects to FastAPI backend (http://localhost:8000/api).
 * Returns { ok: true, data } or { ok: false, error } for safe offline fallback.
 */

const API_BASE_URL = 'http://localhost:8000/api';
const REQUEST_TIMEOUT_MS = 4000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const token = localStorage.getItem('routenova_token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      let friendlyError = 'Something went wrong. Please try again.';
      if (response.status === 401) {
        friendlyError = 'Authentication required. Please sign in.';
      } else if (response.status === 403) {
        friendlyError = "You don't have permission to perform this action.";
      } else if (response.status === 404) {
        friendlyError = 'The requested operational record was not found.';
      } else {
        try {
          const errData = await response.json();
          if (errData && errData.detail && typeof errData.detail === 'string') {
            friendlyError = errData.detail;
          }
        } catch (_) {}
      }
      return { ok: false, status: response.status, error: friendlyError };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (err) {
    clearTimeout(timeoutId);
    return { ok: false, error: 'Backend network unreachable (Operating in Offline Demo Mode)' };
  }
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  async getHealth() {
    return fetchWithTimeout('http://localhost:8000/health');
  },

  async get(endpoint) {
    return fetchWithTimeout(`${API_BASE_URL}${endpoint}`);
  },

  async post(endpoint, body) {
    return fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async put(endpoint, body) {
    return fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint) {
    return fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
  },
};
