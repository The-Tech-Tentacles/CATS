/**
 * Central API Handler for CATS Frontend
 * Provides a simple interface to communicate with the backend API
 */

// Central API fetch function
export async function apiFetch(endpoint, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("auth_token");
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const opts = {
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  // If body is FormData, remove Content-Type so browser sets it correctly
  if (opts.body instanceof FormData) {
    delete opts.headers["Content-Type"];
    delete opts.headers["content-type"];
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, opts);
    
    // Handle authentication errors
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/auth/login";
      throw new Error("Authentication required");
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

// Convenience methods for different HTTP verbs
export const api = {
  // GET request
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiFetch(url, { method: 'GET' });
  },

  // POST request
  post: (endpoint, data = {}) => {
    return apiFetch(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  // PUT request
  put: (endpoint, data = {}) => {
    return apiFetch(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  // DELETE request
  delete: (endpoint) => {
    return apiFetch(endpoint, { method: 'DELETE' });
  },

  // PATCH request
  patch: (endpoint, data = {}) => {
    return apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Authentication helpers
export const auth = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  },

  getProfile: () => api.get('/api/auth/profile'),

  isLoggedIn: () => !!localStorage.getItem('auth_token'),
};

// Complaint helpers
export const complaints = {
  getAll: (params = {}) => api.get('/api/complaints', params),
  getById: (id) => api.get(`/api/complaints/${id}`),
  create: (data) => api.post('/api/complaints', data),
  update: (id, data) => api.put(`/api/complaints/${id}`, data),
  delete: (id) => api.delete(`/api/complaints/${id}`),
  updateStatus: (id, status, comment) => api.put(`/api/complaints/${id}/status`, { status, comment }),
};

// Application helpers
export const applications = {
  getAll: (params = {}) => api.get('/api/applications', params),
  getById: (id) => api.get(`/api/applications/${id}`),
  create: (data) => api.post('/api/applications', data),
  update: (id, data) => api.put(`/api/applications/${id}`, data),
  delete: (id) => api.delete(`/api/applications/${id}`),
};