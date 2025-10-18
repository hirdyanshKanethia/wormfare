import { create } from "zustand";
import { supabase } from "../supabase";

export const useAuthStore = create((set) => ({
  // --- STATE ---
  session: null,
  user: null,
  loading: true, // Start in a loading state

  // --- ACTIONS ---
  /**
   * Initializes the session by checking Supabase auth state.
   */
  init: () => {
    // Listen for changes in the user's auth state (login, logout, etc.)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });
  },

  /**
   * Logs a user in with their email and password.
   */
  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  /**
   * Logs the current user out.
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
}));

// Initialize the store immediately when the app loads.
useAuthStore.getState().init();
