import { useEffect, useState } from 'react';
import { getStoredUser } from './storage';

export function useAuth() {
  const [user, setUser] = useState(getStoredUser());
  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener('sweetpress-auth', handler);
    return () => window.removeEventListener('sweetpress-auth', handler);
  }, []);
  return { user, isLoggedIn: !!user };
}
