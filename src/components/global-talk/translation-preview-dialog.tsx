'use client';

import { useConvoSense } from '@/hooks/use-global-talk';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getLanguageLabel } from '@/lib/languages';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageSquareQuote, Gauge, Info, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import type { PublicUserProfile } from '@/lib/types';

type TranslationPreviewDialogProps = {
    chatPartner: PublicUserProfile;
}

export default function TranslationPreviewDialog({ chatPartner }: TranslationPreviewDialogProps) {
  const { previewMessage, confirmSendMessage, cancelPreview, isSending } = useConvoSense();
  const { user: currentUser } = useAuth();

  if (!previewMessage || !currentUser) return null;

  const hasTranslation = Object.keys(previewMessage.translations).length > 0;
  const targetLanguage = hasTranslation ? Object.keys(previewMessage.translations)[0] : null;

  return (
    <Dialog open={!!previewMessage} onOpenChange={(open) => !open && cancelPreview()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Translation Preview</DialogTitle>
          <DialogDescription>Review translation before sending your message to {chatPartner.name}.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Your Original Message</h3>
              <p className="p-3 bg-muted rounded-md">{previewMessage.originalText}</p>
            </div>

            {hasTranslation && targetLanguage && previewMessage.translations[targetLanguage] ? (
              <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>
                        Translation to {getLanguageLabel(targetLanguage)}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 p-1">
                        <p className="p-3 bg-secondary rounded-md text-secondary-foreground">{previewMessage.translations[targetLanguage].translatedText}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2 p-3 rounded-lg border">
                                <h4 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Context</h4>
                                <p className="text-muted-foreground">{previewMessage.translations[targetLanguage].contextExplanation.sourceLanguageText}</p>
                            </div>
                            <div className="space-y-2 p-3 rounded-lg border">
                                <h4 className="font-semibold flex items-center gap-2"><MessageSquareQuote className="w-4 h-4 text-primary" /> Tone</h4>
                                <p className="text-muted-foreground">{previewMessage.translations[targetLanguage].toneExplanation.sourceLanguageText}</p>
                            </div>
                            <div className="space-y-2 p-3 rounded-lg border">
                                <h4 className="font-semibold flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" /> Formality</h4>
                                <Badge variant="outline">{previewMessage.translations[targetLanguage].formality}</Badge>
                            </div>
                            <div className="space-y-2 p-3 rounded-lg border bg-amber-50/50">
                                <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent" /> Learning Nugget</h4>
                                <p className="text-muted-foreground italic">
                                    <strong>{previewMessage.translations[targetLanguage].learningNugget.phrase}</strong> &rarr; <strong>{previewMessage.translations[targetLanguage].learningNugget.translation}</strong>
                                </p>
                                <p className="text-muted-foreground text-xs">{previewMessage.translations[targetLanguage].learningNugget.explanation.sourceLanguageText}</p>
                            </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
              </Accordion>
            ) : (
                <p className="text-sm text-center text-muted-foreground py-4">No translation needed. Both of you speak {getLanguageLabel(currentUser.language || '')}.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={cancelPreview} disabled={isSending}>Cancel</Button>
          <Button onClick={confirmSendMessage} disabled={isSending}>
            {isSending ? <Loader2 className="animate-spin" /> : <Send/>}
            {isSending ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
