import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("kurus.token") || null,
  user:  JSON.parse(localStorage.getItem("kurus.user") || "null"),

  login(token, user) {
    localStorage.setItem("kurus.token", token);
    localStorage.setItem("kurus.user", JSON.stringify(user));
    set({ token, user });
  },

  logout() {
    localStorage.removeItem("kurus.token");
    localStorage.removeItem("kurus.user");
    set({ token: null, user: null });
  },
}));

export const useToastStore = create((set, get) => ({
  toasts: [],

  add(message, type = "info") {
    const id = Date.now();
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 4000);
  },

  remove(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
