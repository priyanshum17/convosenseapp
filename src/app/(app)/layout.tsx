import React from 'react';
import UserList from '@/components/global-talk/user-list';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <UserList />
        <main className="flex-1 flex flex-col h-screen relative">
            <div className="absolute top-4 left-4 z-20">
               <SidebarTrigger />
            </div>
            {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
