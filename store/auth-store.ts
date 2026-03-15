import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { Profile } from '@/types/database';
import { supabase } from '@/services/supabase';
import { signOut as authSignOut } from '@/services/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      isLoading: false,
    });
    if (session?.user) {
      get().fetchProfile(session.user.id);
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) set({ profile: data as Profile });
  },

  signOut: async () => {
    await authSignOut();
    set({ user: null, session: null, profile: null, isAuthenticated: false });
  },

  reset: () =>
    set({ user: null, session: null, profile: null, isAuthenticated: false, isLoading: false }),
}));
