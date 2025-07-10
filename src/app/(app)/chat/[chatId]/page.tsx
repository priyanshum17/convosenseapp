'use client';

import ChatScreen from '@/components/global-talk/chat-screen';
import { firestore } from '@/lib/firebase';
import type { PublicUserProfile } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const [partner, setPartner] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPartner() {
      setLoading(true);
      setError(null);
      if (params.chatId) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', params.chatId));
          if (userDoc.exists()) {
            setPartner(userDoc.data() as PublicUserProfile);
          } else {
            setError('Could not find the user you want to chat with.');
          }
        } catch (err) {
            setError('Failed to load user data.');
            console.error(err);
        }
      }
      setLoading(false);
    }
    fetchPartner();
  }, [params.chatId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
     return <div className="flex h-full items-center justify-center text-destructive">{error}</div>;
  }

  if (!partner) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">User not found.</div>;
  }

  return (
    <div className="h-full">
        <ChatScreen chatPartner={partner} />
    </div>
  );
}
