
'use client';

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore, googleProvider } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUserLanguage: (language: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let appUser: User;
          if (userDoc.exists()) {
            appUser = userDoc.data() as User;
          } else {
            // New user, create a profile
            const newUserProfile: Omit<User, 'language'> = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            };
            await setDoc(userDocRef, newUserProfile, { merge: true });
            appUser = newUserProfile as User;
          }
          setUser(appUser);

          // Redirection logic
          if (pathname.startsWith('/login')) {
              if (appUser.language) {
                  router.replace('/chat');
              } else {
                  router.replace('/select-language');
              }
          }
        } catch (error) {
          console.error("Firestore error:", error);
          if (error instanceof FirebaseError && (error.code === 'unavailable' || error.message.includes('offline'))) {
              toast({
                  variant: 'destructive',
                  title: 'Firestore Database Not Found',
                  description: 'Could not connect to the database. Please go to your Firebase Console, click "Firestore Database" in the Build menu, and create a database to continue.',
                  duration: 9000,
              });
          } else {
                toast({
                  variant: 'destructive',
                  title: 'Authentication Error',
                  description: 'An error occurred while fetching your user profile.',
                });
          }
          await firebaseSignOut(auth);
        }
        
      } else {
        setUser(null);
        if (!pathname.startsWith('/login')) {
            router.replace('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/configuration-not-found') {
          toast({
            variant: 'destructive',
            title: 'Configuration Error',
            description: 'Please enable Google Sign-In in your Firebase console and authorize your domain.',
            duration: 9000,
          });
        } else if (error.code === 'auth/unauthorized-domain') {
          toast({
            variant: 'destructive',
            title: 'Unauthorized Domain',
            description: 'This domain is not authorized for sign-in. Please add it to your Firebase project settings.',
            duration: 9000,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Sign-In Error',
            description: error.message,
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign-In Error',
          description: 'An unexpected error occurred.',
        });
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const setUserLanguage = async (language: string) => {
    if (user) {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, { language }, { merge: true });
        setUser(prevUser => prevUser ? { ...prevUser, language } : null);
        router.push('/chat');
      } catch (error) {
        console.error("Error setting user language: ", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to save your language preference. Please check your connection and try again.'
        });
      }
    }
  };

  const value = { user, loading, signInWithGoogle, signOut, setUserLanguage };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
