
'use client';

import React, { useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGlobalTalk } from '@/hooks/use-global-talk';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, MessageSquarePlus } from 'lucide-react';
import { MessageBubble } from './message-bubble';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import type { PublicUserProfile } from '@/lib/types';
import TranslationPreviewDialog from './translation-preview-dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getLanguageLabel } from '@/lib/languages';

const FormSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type FormData = z.infer<typeof FormSchema>;

type ChatScreenProps = {
    chatPartner: PublicUserProfile;
}

export default function ChatScreen({ chatPartner }: ChatScreenProps) {
  const { messages, generatePreview, sendMessage, isSending } = useGlobalTalk();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { message: '' },
  });

  const onPreview: SubmitHandler<FormData> = async (data) => {
    await generatePreview(data.message, chatPartner);
    form.reset();
  };

  const onQuickSend: SubmitHandler<FormData> = async (data) => {
    await sendMessage(data.message, chatPartner);
    form.reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (form.getValues('message').trim()) {
        form.handleSubmit(onQuickSend)();
      }
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-full bg-muted/30">
      <header className="flex items-center gap-4 p-4 border-b bg-background z-10">
        <Avatar className="h-10 w-10">
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
            <AvatarFallback>{chatPartner.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
            <h2 className="text-xl font-bold font-headline">{chatPartner.name}</h2>
            <p className="text-sm text-muted-foreground">Speaks {getLanguageLabel(chatPartner.language)}</p>
        </div>
      </header>

      <div className="flex-1 relative">
        <ScrollArea className="absolute inset-0" ref={scrollAreaRef}>
          <div className="p-6 space-y-8">
            {messages.length > 0 ? (
              messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
            ) : (
              <div className="text-center text-muted-foreground pt-16">
                <p>No messages yet. Send one to start the conversation!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <footer className="p-4 border-t bg-background">
        <Form {...form}>
          <form className="flex items-start gap-3">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder={`Type your message to ${chatPartner.name?.split(' ')[0] || ''}... (Shift + Enter for new line)`}
                      {...field}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      className="min-h-[48px] resize-none"
                      disabled={isSending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="button" size="icon" className="h-12 w-12" disabled={isSending || !form.watch('message')} onClick={form.handleSubmit(onQuickSend)}>
              {isSending ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="sr-only">Send</span>
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-12 w-12" disabled={isSending || !form.watch('message')} onClick={form.handleSubmit(onPreview)}>
              <MessageSquarePlus className="w-5 h-5" />
              <span className="sr-only">Review and Send</span>
            </Button>
          </form>
        </Form>
      </footer>
      <TranslationPreviewDialog chatPartner={chatPartner}/>
    </div>
  );
}
