'use client';

import { useAuth } from '@/hooks/use-auth';
import { firestore } from '@/lib/firebase';
import type { PublicUserProfile } from '@/lib/types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { LogOut, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator, SidebarTrigger } from '../ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserList() {
  const { user: currentUser, signOut } = useAuth();
  const [users, setUsers] = useState<PublicUserProfile[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(collection(firestore, 'users'), where('uid', '!=', currentUser.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const usersData = snapshot.docs.map(doc => doc.data() as PublicUserProfile).filter(u => u.language); // Only show users who have selected a language
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const getChatId = (uid: string) => uid;

  if (!currentUser) return null;

  return (
    <Sidebar className="border-r">
        <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
                    ConvoSense
                </h1>
                <SidebarTrigger/>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <div className="px-4 mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5"/> Users</h2>
            </div>
            <SidebarMenu>
                {users.map(user => (
                    <SidebarMenuItem key={user.uid}>
                       <Link href={`/chat/${getChatId(user.uid)}`} className="w-full">
                         <SidebarMenuButton 
                            isActive={pathname.includes(`/chat/${getChatId(user.uid)}`)}
                            className="w-full justify-start"
                         >
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User'} />
                                <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                         </SidebarMenuButton>
                       </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator/>
        <SidebarFooter className="p-4">
            <div className="flex items-center gap-3">
                 <Avatar>
                    <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.name || 'User'}/>
                    <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                 </Avatar>
                 <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{currentUser.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out">
                    <LogOut className="w-5 h-5"/>
                 </Button>
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
