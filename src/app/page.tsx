'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { languages } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquare,Languages } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function Home() {
  const { login, loading } = useAuth();
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !language) return;
    setIsSubmitting(true);
    const success = await login(name, language);
    if (!success) {
      setError(`The name "${name}" is already taken. Please choose another.`);
      setIsSubmitting(false);
    }
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
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full mb-4 w-fit">
            <Languages className="w-8 h-8" />
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
                    className="py-6 text-base"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                 <Select onValueChange={setLanguage} value={language} required>
                    <SelectTrigger id="language" className="w-full py-6 text-base">
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
           
            {error && <p className="text-sm text-center font-medium text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={!name || !language || isSubmitting}
              className="w-full text-lg py-7"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Join Chat'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
