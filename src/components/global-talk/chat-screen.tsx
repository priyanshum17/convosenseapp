'use client';

import React, { useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGlobalTalk } from '@/hooks/use-global-talk';
import { languages } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Sparkles, User, Users } from 'lucide-react';
import { MessageBubble } from './message-bubble';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

const FormSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type FormData = z.infer<typeof FormSchema>;

export default function ChatScreen() {
  const { users, messages, generatePreview, currentUser, setCurrentUser, isSending } = useGlobalTalk();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { message: '' },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await generatePreview(data.message);
    form.reset();
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-4xl h-[90vh] bg-card border rounded-xl shadow-lg">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <MessageSquare/>
            GlobalTalk
        </h1>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <Select
            value={currentUser?.id}
            onValueChange={value => setCurrentUser(users.find(u => u.id === value) || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Switch User" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">({languages.find(l => l.value === user.language)?.label})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      
      <footer className="p-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder={`Type your message as ${currentUser?.name || ''}...`}
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
    </div>
  );
}
