'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useCallback } from 'react';
import type { User, Message, Sentiment } from '@/lib/types';
import { analyzeMessageSentiment } from '@/ai/flows/analyze-message-sentiment';
import { translateMessage } from '@/ai/flows/translate-message';
import { useToast } from '@/hooks/use-toast';
import { getLanguageLabel } from '@/lib/languages';

export type GlobalTalkContextType = {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  chatStarted: boolean;
  startChat: () => void;
  isSending: boolean;
};

export const GlobalTalkContext = createContext<GlobalTalkContextType | undefined>(undefined);

export function GlobalTalkProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `user-${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
    if (!currentUser) {
      setCurrentUser(newUser);
    }
  }, [currentUser]);

  const startChat = useCallback(() => {
    if (users.length >= 2) {
      setChatStarted(true);
    }
  }, [users.length]);

  const sendMessage = async (text: string) => {
    if (!currentUser || text.trim() === '') return;

    setIsSending(true);
    try {
      const sentimentResult = await analyzeMessageSentiment({ message: text });
      
      const translations: Record<string, { text: string; source: string }> = {};

      const otherUsers = users.filter(u => u.id !== currentUser.id);

      for (const user of otherUsers) {
        if (user.language !== currentUser.language) {
          try {
            const translationResult = await translateMessage({
              text,
              sourceLanguage: getLanguageLabel(currentUser.language),
              targetLanguage: getLanguageLabel(user.language),
            });
            translations[user.language] = {
              text: translationResult.translatedText,
              source: translationResult.source,
            };
          } catch (e) {
             console.error(`Failed to translate for ${user.name}`, e);
          }
        }
      }

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: currentUser,
        originalText: text,
        timestamp: Date.now(),
        sentiment: sentimentResult.sentiment.toLowerCase() as Sentiment,
        translations,
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send message. AI service may be unavailable.",
      })
    } finally {
      setIsSending(false);
    }
  };

  return (
    <GlobalTalkContext.Provider
      value={{
        users,
        addUser,
        messages,
        sendMessage,
        currentUser,
        setCurrentUser,
        chatStarted,
        startChat,
        isSending,
      }}
    >
      {children}
    </GlobalTalkContext.Provider>
  );
}
