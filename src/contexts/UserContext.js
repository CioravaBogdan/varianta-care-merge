import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { translations } from '../translations';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLanguage, setUserLanguage] = useState(() => {
    const saved = localStorage.getItem('userLanguage');
    return saved || navigator.language.split('-')[0] || 'en';
  });

  const [userCountry, setUserCountry] = useState(() => {
    const saved = localStorage.getItem('userCountry');
    return saved || 'GB';
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('userLanguage', userLanguage);
  }, [userLanguage]);

  useEffect(() => {
    localStorage.setItem('userCountry', userCountry);
  }, [userCountry]);

  useEffect(() => {
    // Check current auth session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const t = (key) => {
    return translations[userLanguage]?.[key] || translations.en[key] || key;
  };

  const value = {
    user,
    loading,
    userLanguage,
    setUserLanguage,
    userCountry,
    setUserCountry,
    t
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export { UserContext };