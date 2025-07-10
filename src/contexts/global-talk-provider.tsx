'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Message, Sentiment, TranslationDetail, PublicUserProfile } from '@/lib/types';
import { analyzeMessageSentiment } from '@/ai/flows/analyze-message-sentiment';
import { translateMessage } from '@/ai/flows/translate-message';
import { useToast } from '@/hooks/use-toast';
import { getLanguageLabel } from '@/lib/languages';
import { useAuth } from '@/hooks/use-auth';
import { firestore } from '@/lib/firebase';
import { usePathname } from 'next/navigation';

export type GlobalTalkContextType = {
  messages: Message[];
  generatePreview: (text: string, chatPartner: PublicUserProfile) => Promise<void>;
  sendMessage: (text: string, chatPartner: PublicUserProfile) => Promise<void>;
  confirmSendMessage: () => void;
  cancelPreview: () => void;
  previewMessage: Message | null;
  isSending: boolean;
  chatId: string | null;
};

export const GlobalTalkContext = createContext<GlobalTalkContextType | undefined>(undefined);

export function GlobalTalkProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const pathSegments = pathname.split('/');
    const chatPartnerUid = pathSegments[pathSegments.length - 1];

    if (!pathname.startsWith('/chat/') || pathSegments.length < 3 || !chatPartnerUid) {
      setMessages([]);
      setChatId(null);
      return;
    }

    const newChatId = [currentUser.uid, chatPartnerUid].sort().join('_');
    setChatId(newChatId);

    const messagesQuery = query(
      collection(firestore, 'chats', newChatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, snapshot => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [pathname, currentUser]);


  const createMessagePayload = async (text: string, chatPartner: PublicUserProfile) => {
    if (!currentUser || !currentUser.language || !chatPartner.language || text.trim() === '') return null;
    
    const sentimentResult = await analyzeMessageSentiment({ message: text });
    
    const translations: Record<string, TranslationDetail> = {};
    const targetLang = chatPartner.language;

    if (targetLang !== currentUser.language) {
      try {
        const translationResult = await translateMessage({
          text,
          sourceLanguage: getLanguageLabel(currentUser.language) || currentUser.language,
          targetLanguage: getLanguageLabel(targetLang) || targetLang,
        });
        translations[targetLang] = translationResult;
      } catch (e) {
          console.error(`Failed to translate for language ${targetLang}`, e);
          toast({
            variant: "destructive",
            title: "Translation Failed",
            description: "The AI could not process the translation. The message will be sent in its original language."
          });
      }
    }

    const newMessage: Omit<Message, 'id' | 'timestamp'> & { timestamp: null } = {
      sender: {
          uid: currentUser.uid,
          name: currentUser.name,
      },
      senderLanguage: currentUser.language,
      originalText: text,
      timestamp: null, 
      sentiment: sentimentResult.sentiment.toLowerCase() as Sentiment,
      translations,
    };
    return newMessage;
  }

  const generatePreview = async (text: string, chatPartner: PublicUserProfile) => {
    setIsSending(true);
    try {
      const payload = await createMessagePayload(text, chatPartner);
      if (payload) {
        setPreviewMessage(payload as Message);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate message preview. AI service may be unavailable.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async (text: string, chatPartner: PublicUserProfile) => {
    if (!chatId) return;
    setIsSending(true);
    try {
        const payload = await createMessagePayload(text, chatPartner);
        if (payload) {
            await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
                ...payload,
                timestamp: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error sending message: ', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to send message.'
        });
    } finally {
        setIsSending(false);
    }
  };

  const confirmSendMessage = async () => {
    if (previewMessage && chatId) {
        setIsSending(true);
        try {
            await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
                ...previewMessage,
                timestamp: serverTimestamp(),
            });
            setPreviewMessage(null);
        } catch (error) {
            console.error('Error sending message: ', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to send message.'
            });
        } finally {
            setIsSending(false);
        }
    }
  };

  const cancelPreview = () => {
    setPreviewMessage(null);
  };

  return (
    <GlobalTalkContext.Provider
      value={{
        messages,
        generatePreview,
        sendMessage,
        confirmSendMessage,
        cancelPreview,
        previewMessage,
        isSending,
        chatId,
      }}
    >
      {children}
    </GlobalTalkContext.Provider>
  );
}
