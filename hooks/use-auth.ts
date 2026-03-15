import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
  const {
    user,
    session,
    profile,
    isAuthenticated,
    isLoading,
    signOut,
    fetchProfile,
  } = useAuthStore();

  return {
    user,
    session,
    profile,
    isAuthenticated,
    isLoading,
    signOut,
    fetchProfile,
    displayName: profile?.display_name ?? user?.email?.split('@')[0] ?? 'Usuario',
  };
}
