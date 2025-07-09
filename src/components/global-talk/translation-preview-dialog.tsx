'use client';

import { useConvoSense } from '@/hooks/use-global-talk';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getLanguageLabel } from '@/lib/languages';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageSquareQuote, Gauge, Info, Send } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export default function TranslationPreviewDialog() {
  const { previewMessage, confirmSendMessage, cancelPreview, isSending, users, currentUser } = useConvoSense();

  if (!previewMessage || !currentUser) return null;

  const targetLanguages = users.filter(u => u.id !== currentUser.id && u.language !== currentUser.language).map(u => u.language).filter((lang, index, self) => self.indexOf(lang) === index);

  return (
    <Dialog open={!!previewMessage} onOpenChange={(open) => !open && cancelPreview()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Translation Preview</DialogTitle>
          <DialogDescription>Review translations before sending your message. Confirm to send to everyone.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Your Original Message</h3>
              <p className="p-3 bg-muted rounded-md">{previewMessage.originalText}</p>
            </div>

            {targetLanguages.length > 0 ? (
              <Accordion type="single" collapsible className="w-full" defaultValue={`item-${targetLanguages[0]}`}>
                {targetLanguages.map(lang => {
                  const translation = previewMessage.translations[lang];
                  if (!translation) return null;
                  
                  return (
                    <AccordionItem value={`item-${lang}`} key={lang}>
                      <AccordionTrigger>
                        Translation to {getLanguageLabel(lang)}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 p-1">
                        <p className="p-3 bg-secondary rounded-md text-secondary-foreground">{translation.translatedText}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2 p-3 rounded-lg border">
                                <h4 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Context</h4>
                                <p className="text-muted-foreground">{translation.contextExplanation}</p>
                            </div>
                            <div className="space-y-2 p-3 rounded-lg border">
                                <h4 className="font-semibold flex items-center gap-2"><MessageSquareQuote className="w-4 h-4 text-primary" /> Tone</h4>
                                <p className="text-muted-foreground">{translation.toneExplanation}</p>
                            </div>
                            <div className="space-y-2 p-3 rounded-lg border">
                                <h4 className="font-semibold flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" /> Formality</h4>
                                <Badge variant="outline">{translation.formality}</Badge>
                            </div>
                            <div className="space-y-2 p-3 rounded-lg border bg-amber-50/50">
                                <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-accent" /> Learning Nugget</h4>
                                <p className="text-muted-foreground italic">
                                    <strong>{translation.learningNugget.phrase}</strong> &rarr; <strong>{translation.learningNugget.translation}</strong>
                                </p>
                                <p className="text-muted-foreground text-xs">{translation.learningNugget.explanation}</p>
                            </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
                <p className="text-sm text-center text-muted-foreground py-4">No translations needed for this conversation.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={cancelPreview} disabled={isSending}>Cancel</Button>
          <Button onClick={confirmSendMessage} disabled={isSending}>
            {isSending ? 'Sending...' : 'Confirm & Send'}
            <Send/>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
