import React from 'react';
import UserList from '@/components/global-talk/user-list';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <UserList />
      <main className="flex-1 flex flex-col min-w-0">
          {children}
      </main>
    </div>
  );
}
