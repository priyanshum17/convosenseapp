'use client';

import React, { useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConvoSense } from '@/hooks/use-global-talk';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles } from 'lucide-react';
import { MessageBubble } from './message-bubble';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import type { PublicUserProfile } from '@/lib/types';
import TranslationPreviewDialog from './translation-preview-dialog';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const FormSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type FormData = z.infer<typeof FormSchema>;

type ChatScreenProps = {
    chatPartner: PublicUserProfile;
}

export default function ChatScreen({ chatPartner }: ChatScreenProps) {
  const { messages, generatePreview, isSending } = useConvoSense();
  const { user: currentUser } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { message: '' },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await generatePreview(data.message, chatPartner);
    form.reset();
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-full bg-card">
      <header className="flex items-center gap-4 p-4 border-b">
        <Avatar>
            <AvatarImage src={chatPartner.photoURL || undefined} alt={chatPartner.name || 'User'} />
            <AvatarFallback>{chatPartner.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
            <h2 className="text-xl font-bold font-headline text-primary">{chatPartner.name}</h2>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length > 0 ? (
            messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
          ) : (
            <div className="text-center text-muted-foreground pt-16">
              <p>No messages yet. Send one to start the conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <footer className="p-4 border-t bg-background">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder={`Type your message to ${chatPartner.name?.split(' ')[0] || ''}...`}
                      {...field}
                      rows={1}
                      className="resize-none"
                      disabled={isSending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isSending}>
              {isSending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </Form>
      </footer>
      <TranslationPreviewDialog chatPartner={chatPartner}/>
    </div>
  );
}
