import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface ImpersonatedUser {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAdminOrModerator: boolean;
  profile: Profile | null;
  impersonatedUser: ImpersonatedUser | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  startImpersonation: (user: ImpersonatedUser) => void;
  stopImpersonation: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminOrModerator, setIsAdminOrModerator] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Error in checkAdminRole:', err);
      return false;
    }
  };

  const checkAdminOrModeratorRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();

      if (error) {
        console.error('Error checking admin/moderator role:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Error in checkAdminOrModeratorRole:', err);
      return false;
    }
  };

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile | null;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id).then(setIsAdmin);
            checkAdminOrModeratorRole(session.user.id).then(setIsAdminOrModerator);
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsAdminOrModerator(false);
          setProfile(null);
          setImpersonatedUser(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id).then(setIsAdmin);
        checkAdminOrModeratorRole(session.user.id).then(setIsAdminOrModerator);
        fetchProfile(session.user.id).then(setProfile);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsAdminOrModerator(false);
    setProfile(null);
    setImpersonatedUser(null);
  };

  const startImpersonation = (targetUser: ImpersonatedUser) => {
    if (isAdmin) {
      setImpersonatedUser(targetUser);
    }
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      isAdmin, 
      isAdminOrModerator,
      profile,
      impersonatedUser,
      signIn, 
      signUp, 
      signOut,
      startImpersonation,
      stopImpersonation,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
