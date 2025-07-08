'use client';

import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { languages } from '@/lib/languages';
import { useGlobalTalk } from '@/hooks/use-global-talk';
import { Users, Languages, Sparkles } from 'lucide-react';

const FormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  language: z.string().nonempty('Please select a language.'),
});

type FormData = z.infer<typeof FormSchema>;

export default function OnboardingScreen() {
  const { users, addUser, startChat } = useGlobalTalk();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', language: '' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    addUser(data);
    form.reset();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold font-headline text-primary mb-2">GlobalTalk</h1>
        <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span>Seamless conversations, powered by AI.</span>
          <Sparkles className="w-5 h-5 text-accent" />
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-6 h-6" /> Add Participants</CardTitle>
            <CardDescription>Add at least two people to start a conversation.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><Languages className="w-4 h-4"/>Preferred Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Add User</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Conversation Members</CardTitle>
            <CardDescription>Users ready to chat.</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <ul className="space-y-3">
                {users.map(user => (
                  <li key={user.id} className="flex items-center gap-3 bg-secondary p-2 rounded-md">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png`} alt={user.name} data-ai-hint="person portrait"/>
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{languages.find(l => l.value === user.language)?.label}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No users added yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={startChat} disabled={users.length < 2} className="w-full bg-primary hover:bg-primary/90">
              {users.length < 2 ? 'Need 2+ users to chat' : 'Start Chat'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
