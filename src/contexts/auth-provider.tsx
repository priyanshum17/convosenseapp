'use client';

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (name: string, language: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'convosense-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Check for user in localStorage on initial load
    try {
      const storedUserJson = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson) as User;
        setUser(storedUser);
        // Ensure user is in firestore if they have info in localStorage
        const userDocRef = doc(firestore, 'users', storedUser.uid);
        setDoc(userDocRef, storedUser, { merge: true });
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Redirect logic based on user state
    if (!loading) {
      const isAuthPage = pathname === '/';
      if (user && isAuthPage) {
        router.replace('/chat');
      } else if (!user && pathname !== '/') {
        router.replace('/');
      }
    }
  }, [user, loading, pathname, router]);

  // Listen for tab/window close to remove user from active list
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
        if (user) {
            // This is not guaranteed to run, but it's a good effort for a prototype
            const userDocRef = doc(firestore, 'users', user.uid);
            try {
                await deleteDoc(userDocRef);
            } catch (error) {
                console.error("Could not delete user on unload", error);
            }
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const login = async (name: string, language: string) => {
    setLoading(true);
    try {
      const newUser: User = {
        uid: uuidv4(),
        name,
        language,
      };

      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, newUser);

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      router.push('/chat');
    } catch (error) {
      console.error("Error logging in: ", error);
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: 'Could not create your user profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await deleteDoc(userDocRef);
      } catch (error) {
        console.error("Error removing user from Firestore: ", error);
      }
    }
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push('/');
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
