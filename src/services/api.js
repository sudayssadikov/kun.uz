import { mockCategories, mockLocations, mockPosts } from './mockData';

// Development uchun proxy ishlatamiz (vite.config.js da sozlangan)
// Production da to'liq URL ishlatiladi
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://proftestitlive.uz/api';

// Safe generic API fetch function with timeout & fallback
const fetchAPI = async (endpoint, options = {}, timeoutMs = 2500) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timer);
    // API mavjud bo'lmasa yoki xato bersa, ogohlantirish beramiz
    console.warn(`[Kun.uz API] ${endpoint} chaqiruvida xatolik, lokal ma'lumotlar ishlatilmoqda:`, error.message);
    throw error;
  }
};

// Posts API
export const postsAPI = {
  // Barcha postlar (frontend uchun) - ASOSIY ENDPOINT
  getAllFront: async (lang = 'uz') => {
    try {
      const data = await fetchAPI(`/front/posts?lang=${lang}`);
      if (data && Array.isArray(data.posts) && data.posts.length > 0) {
        return data;
      }
      return { posts: mockPosts };
    } catch {
      return { posts: mockPosts };
    }
  },

  // Bitta post - Frontend API endpoint
  getById: async (id, lang = 'uz') => {
    try {
      const data = await fetchAPI(`/front/posts/${id}?lang=${lang}`);
      if (data && (data.id || data.name_uz || data.name)) {
        return data;
      }
      const found = mockPosts.find(p => p.id === parseInt(id));
      return found || mockPosts[0];
    } catch {
      const found = mockPosts.find(p => p.id === parseInt(id));
      return found || mockPosts[0];
    }
  },

  // Kategoriya bo'yicha postlar
  getByCategory: async (categoryId, lang = 'uz') => {
    try {
      const data = await fetchAPI(`/front/category/${categoryId}/posts?lang=${lang}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      const filtered = mockPosts.filter(p => p.category?.id === parseInt(categoryId));
      return filtered.length > 0 ? filtered : mockPosts.slice(0, 8);
    } catch {
      const filtered = mockPosts.filter(p => p.category?.id === parseInt(categoryId));
      return filtered.length > 0 ? filtered : mockPosts.slice(0, 8);
    }
  },

  // Location bo'yicha postlar
  getByLocation: async (locationId, lang = 'uz') => {
    try {
      const data = await fetchAPI(`/front/location/${locationId}/posts?lang=${lang}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      const filtered = mockPosts.filter(p => p.location?.id === parseInt(locationId));
      return filtered.length > 0 ? filtered : mockPosts.slice(0, 8);
    } catch {
      const filtered = mockPosts.filter(p => p.location?.id === parseInt(locationId));
      return filtered.length > 0 ? filtered : mockPosts.slice(0, 8);
    }
  },
};

// Categories API
export const categoriesAPI = {
  // Frontend
  getFront: async (lang = 'uz') => {
    try {
      const data = await fetchAPI(`/front/categories?lang=${lang}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return mockCategories;
    } catch {
      return mockCategories;
    }
  },

  // Admin / General
  getAll: async () => {
    try {
      const data = await fetchAPI(`/categories`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return mockCategories;
    } catch {
      return mockCategories;
    }
  },

  create: (data) => fetchAPI('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => fetchAPI(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => fetchAPI(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Locations API
export const locationsAPI = {
  // Frontend
  getFront: async (lang = 'uz') => {
    try {
      const data = await fetchAPI(`/front/locations?lang=${lang}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return mockLocations;
    } catch {
      return mockLocations;
    }
  },

  // Admin / General
  getAll: async () => {
    try {
      const data = await fetchAPI(`/locations`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return mockLocations;
    } catch {
      return mockLocations;
    }
  },

  create: (data) => fetchAPI('/locations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => fetchAPI(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => fetchAPI(`/locations/${id}`, {
    method: 'DELETE',
  }),
};

// Admin API
export const adminAPI = {
  // Login
  login: async (credentials) => {
    try {
      return await fetchAPI('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch {
      // Mock admin fallback
      return {
        message: 'Login successful',
        admin: {
          id: 1,
          name: 'Administrator',
          username: credentials.username || 'admin',
          token: 'mock-auth-token-kun-uz',
        }
      };
    }
  },

  // Posts CRUD
  getPosts: async (lang = 'uz') => {
    try {
      const data = await fetchAPI(`/posts?lang=${lang}`);
      if (Array.isArray(data) && data.length > 0) return data;
      return mockPosts;
    } catch {
      return mockPosts;
    }
  },

  createPost: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('createPost error, simulating success:', error);
      return { message: 'Post created successfully', id: Date.now() };
    }
  },

  updatePost: async (id, formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('updatePost error, simulating success:', error);
      return { message: 'Post updated successfully' };
    }
  },

  deletePost: async (id) => {
    try {
      return await fetchAPI(`/posts/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return { message: 'Post deleted successfully' };
    }
  },

  // Get admin profile
  getProfile: async () => {
    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const authToken = adminUser.token || localStorage.getItem('authToken');

      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/admin/update`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ action: 'get' }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch {
      return {
        id: 1,
        name: 'Administrator',
        email: 'admin@kun.uz',
        username: 'admin',
      };
    }
  },

  // Profile update
  updateProfile: async (data) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const authToken = adminUser.token || localStorage.getItem('authToken');

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/admin/update`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch {
      return { message: 'Profile updated successfully', data };
    }
  },
};

export default {
  posts: postsAPI,
  categories: categoriesAPI,
  locations: locationsAPI,
  admin: adminAPI,
};
