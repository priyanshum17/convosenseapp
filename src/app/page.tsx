'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { languages } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquare } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function Home() {
  const { login, loading } = useAuth();
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !language) return;
    setIsSubmitting(true);
    const success = await login(name, language);
    if (!success) {
      setIsSubmitting(false);
    }
    // On success, the AuthProvider's useEffect will handle the redirect.
  };

  if (loading && !isSubmitting) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading ConvoSense...</p>
          </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full mb-4 w-fit">
            <MessageSquare className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to ConvoSense</CardTitle>
          <CardDescription>Enter your name and preferred language to start chatting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                 <Select onValueChange={setLanguage} value={language} required>
                    <SelectTrigger id="language" className="w-full">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
           
            <Button
              type="submit"
              disabled={!name || !language || isSubmitting}
              className="w-full text-lg py-6"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Join Chat'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
