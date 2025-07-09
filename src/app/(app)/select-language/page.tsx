'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { languages } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function SelectLanguagePage() {
  const { user, setUserLanguage } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedLanguage) return;
    setIsSubmitting(true);
    await setUserLanguage(selectedLanguage);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">One last step, {user?.name?.split(' ')[0] || 'User'}!</CardTitle>
          <CardDescription>Please select your preferred language to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedLanguage} value={selectedLanguage}>
            <SelectTrigger className="w-full text-base py-6">
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
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedLanguage || isSubmitting}
            className="w-full text-lg py-6"
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
