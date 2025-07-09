'use client';

import { ConvoSenseProvider } from '@/contexts/global-talk-provider';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import React from 'react';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <ConvoSenseProvider>{children}</ConvoSenseProvider>;
}
