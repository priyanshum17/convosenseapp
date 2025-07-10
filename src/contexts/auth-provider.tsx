'use client';

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (name: string, language: string) => Promise<boolean>;
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
    try {
      const storedUserJson = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson) as User;
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (user) {
      // If user is logged in, ensure they are in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      setDoc(userDocRef, user, { merge: true }).catch(error => {
          console.error("Error ensuring user in Firestore:", error);
      });

      // Redirect to chat if on the landing page
      if (pathname === '/') {
        router.replace('/chat');
      }
    } else {
      // Redirect to landing page if not logged in and not already there
      if (pathname !== '/') {
        router.replace('/');
      }
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const handleUnload = async () => {
        const storedUserJson = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUserJson) {
            const storedUser = JSON.parse(storedUserJson) as User;
            const userDocRef = doc(firestore, 'users', storedUser.uid);
            try {
                await deleteDoc(userDocRef);
            } catch (error) {
                console.error("Could not delete user on unload", error);
            }
        }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const login = async (name: string, language: string): Promise<boolean> => {
    setLoading(true);
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('name', '==', name));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Username Taken',
          description: `The name "${name}" is already in use. Please choose another.`,
        });
        return false;
      }

      const newUser: User = {
        uid: uuidv4(),
        name,
        language,
      };

      await setDoc(doc(firestore, 'users', newUser.uid), newUser);
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error: any) {
      console.error("Error logging in: ", error);
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: 'Could not create your user profile. Please try again.',
      });
      return false;
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
        toast({
          variant: 'destructive',
          title: 'Logout Error',
          description: 'Could not remove user session. Please try again.',
        });
      }
    }
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
