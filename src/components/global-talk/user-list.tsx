
'use client';

import { useAuth } from '@/hooks/use-auth';
import { firestore } from '@/lib/firebase';
import type { PublicUserProfile } from '@/lib/types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { LogOut, Users, Languages } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getLanguageLabel } from '@/lib/languages';

const OnlineIndicator = () => (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
)

export default function UserList() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<PublicUserProfile[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(collection(firestore, 'users'), where('uid', '!=', currentUser.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const usersData = snapshot.docs.map(doc => doc.data() as PublicUserProfile);
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const getChatId = (uid: string) => uid;

  if (!currentUser) return null;

  return (
    <aside className="hidden md:flex flex-col w-72 border-r bg-card">
      <header className="p-4 border-b">
          <div className="flex items-center gap-2">
              <Languages className="w-7 h-7 text-primary"/>
              <h1 className="text-2xl font-bold font-headline text-primary">
                  GlobalTalk
              </h1>
          </div>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-muted-foreground"><Users className="w-5 h-5"/> Users</h2>
            <nav className="flex flex-col gap-1">
                {users.map(user => {
                    const isActive = pathname.includes(`/chat/${getChatId(user.uid)}`);
                    return (
                        <Link href={`/chat/${getChatId(user.uid)}`} key={user.uid}>
                            <div className={cn(
                                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                isActive ? "bg-primary/10 text-primary-foreground" : "hover:bg-muted"
                            )}>
                                <div className="relative">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className={cn(isActive && "bg-primary text-primary-foreground")}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <OnlineIndicator/>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{user.name}</p>
                                    <p className={cn("text-xs truncate", isActive ? "text-primary/80" : "text-muted-foreground")}>{getLanguageLabel(user.language)}</p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </nav>
        </div>
      </div>
      
      <footer className="p-4 border-t">
          <div className="flex items-center gap-3">
               <div className="relative">
                    <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <OnlineIndicator/>
                </div>
               <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{getLanguageLabel(currentUser.language)}</p>
               </div>
               <Button variant="ghost" size="icon" onClick={logout} title="Sign Out">
                  <LogOut className="w-5 h-5"/>
               </Button>
          </div>
      </footer>
    </aside>
  );
}

