// Adapter: Vercel artifact env injects window.storage; fall back to localStorage everywhere else.
export const storage = (typeof window !== 'undefined' && window.storage) ? window.storage : {
  get: async (key) => { const v = localStorage.getItem(key); return v ? { value: v } : null; },
  set: async (key, val) => { localStorage.setItem(key, val); },
  delete: async (key) => { localStorage.removeItem(key); },
};
