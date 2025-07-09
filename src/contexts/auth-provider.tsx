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
        const userDocRef = doc(firestore, 'users', storedUser.uid);
        setDoc(userDocRef, storedUser, { merge: true }).catch(error => {
            console.error("Error ensuring user in Firestore:", error);
        });
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (pathname === '/') {
          router.replace('/chat');
        }
      } else if (pathname !== '/') {
        router.replace('/');
      }
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const handleBeforeUnload = () => {
        if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            try {
                deleteDoc(userDocRef);
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

  const login = async (name: string, language: string): Promise<boolean> => {
    try {
      // Check if username is already taken
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

      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, newUser);

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error: any) {
      console.error("Error logging in: ", error);
      const description = error.code === 'permission-denied'
        ? 'Could not create user. Please check your Firestore security rules.'
        : 'Could not create your user profile. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description,
      });
      return false;
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
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
