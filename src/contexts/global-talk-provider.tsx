'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useCallback } from 'react';
import type { User, Message, Sentiment, TranslationDetail } from '@/lib/types';
import { analyzeMessageSentiment } from '@/ai/flows/analyze-message-sentiment';
import { translateMessage } from '@/ai/flows/translate-message';
import { useToast } from '@/hooks/use-toast';
import { getLanguageLabel } from '@/lib/languages';

export type GlobalTalkContextType = {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  messages: Message[];
  generatePreview: (text: string) => Promise<void>;
  confirmSendMessage: () => void;
  cancelPreview: () => void;
  previewMessage: Message | null;
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
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
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

  const generatePreview = async (text: string) => {
    if (!currentUser || text.trim() === '') return;

    setIsSending(true);
    try {
      const sentimentResult = await analyzeMessageSentiment({ message: text });
      
      const translations: Record<string, TranslationDetail> = {};

      const otherUserLanguages = [...new Set(users.filter(u => u.id !== currentUser.id).map(u => u.language))];

      for (const lang of otherUserLanguages) {
        if (lang !== currentUser.language) {
          try {
            const translationResult = await translateMessage({
              text,
              sourceLanguage: getLanguageLabel(currentUser.language),
              targetLanguage: getLanguageLabel(lang),
            });
            translations[lang] = translationResult;
          } catch (e) {
             console.error(`Failed to translate for language ${lang}`, e);
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

      setPreviewMessage(newMessage);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate translation preview. AI service may be unavailable.",
      })
    } finally {
      setIsSending(false);
    }
  };

  const confirmSendMessage = () => {
    if (previewMessage) {
      setMessages(prev => [...prev, previewMessage]);
      setPreviewMessage(null);
    }
  };

  const cancelPreview = () => {
    setPreviewMessage(null);
  };


  return (
    <GlobalTalkContext.Provider
      value={{
        users,
        addUser,
        messages,
        generatePreview,
        confirmSendMessage,
        cancelPreview,
        previewMessage,
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
