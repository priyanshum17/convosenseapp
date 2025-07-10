'use client';

import type { Message, Explanation } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { getLanguageLabel } from '@/lib/languages';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Smile, Frown, Meh, Languages, Lightbulb, MessageSquareQuote, Gauge, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type MessageBubbleProps = {
  message: Message;
};

const sentimentIcons = {
  positive: <Smile className="w-4 h-4 text-green-500" />,
  negative: <Frown className="w-4 h-4 text-red-500" />,
  neutral: <Meh className="w-4 h-4 text-gray-500" />,
  unknown: <Meh className="w-4 h-4 text-gray-400" />,
};

const getMessageDate = (timestamp: any): Date => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp && typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000);
    }
    if (timestamp && !isNaN(new Date(timestamp).getTime())) {
      return new Date(timestamp);
    }
    return new Date();
  };


export function MessageBubble({ message }: MessageBubbleProps) {
  const { user: currentUser } = useAuth();

  if (!currentUser || !currentUser.language) return null;

  const getExplanationText = (explanation: Explanation, targetLang: string) => {
    if (!currentUser || !currentUser.language) return '';
    if (currentUser.language === targetLang) {
      return explanation.targetLanguageText;
    }
    return explanation.sourceLanguageText;
  };

  const isSender = message.sender.uid === currentUser.uid;
  const viewerLang = currentUser.language;
  const senderLang = message.senderLanguage;
  const hasTranslations = Object.keys(message.translations).length > 0;

  let textToShow = message.originalText;
  let isTranslatedForViewer = false;

  if (viewerLang !== senderLang && message.translations[viewerLang]) {
    textToShow = message.translations[viewerLang].translatedText;
    isTranslatedForViewer = true;
  }
  
  const messageDate = getMessageDate(message.timestamp);

  return (
    <div className={cn('flex items-end gap-3', isSender ? 'justify-end' : 'justify-start')}>
      {!isSender && (
        <Avatar className="w-9 h-9">
            <AvatarFallback>{message.sender.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex w-fit max-w-lg flex-col gap-1', isSender ? 'items-end' : 'items-start')}>
        <div className={cn(
            'rounded-2xl p-3 px-4 shadow-sm', 
            isSender ? 'bg-primary text-primary-foreground rounded-br-lg' : 'bg-secondary text-secondary-foreground rounded-bl-lg'
        )}>
          {!isSender && <p className="text-xs font-bold mb-1 text-primary">{message.sender.name}</p>}
          
          <p className="text-base whitespace-pre-wrap">{textToShow}</p>
          
          {isTranslatedForViewer && (
           <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 mt-2 text-xs opacity-70 cursor-help border-t border-current/20 pt-1.5">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Translated from {getLanguageLabel(senderLang)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-semibold">Original Message:</p>
                <p>{message.originalText}</p>
              </TooltipContent>
            </Tooltip>
           </TooltipProvider>
        )}

        </div>
        <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                {sentimentIcons[message.sentiment] || sentimentIcons.unknown}
              </TooltipTrigger>
              <TooltipContent>
                <p>Sentiment: {message.sentiment}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>
            {formatDistanceToNow(messageDate, { addSuffix: true })}
          </span>
        </div>
        
        {hasTranslations && (
          <Accordion type="single" collapsible className="w-full max-w-lg">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="flex-none justify-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:no-underline focus-visible:ring-1 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4">
                  <span>Translation Details</span>
                </AccordionTrigger>
              <AccordionContent className="mt-1.5 w-full space-y-4 rounded-xl border bg-secondary/50 p-4 text-sm">
                 <div>
                    <h4 className="font-semibold mb-1 text-xs uppercase tracking-wider">Original ({getLanguageLabel(senderLang)})</h4>
                    <p className="p-2 bg-background rounded-md text-sm">{message.originalText}</p>
                 </div>
                 {Object.entries(message.translations).map(([lang, translation]) => (
                    <div key={lang} className="pt-3 border-t first:pt-0 first:border-none">
                      <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider">Translation ({getLanguageLabel(lang)})</h4>
                      <div className="space-y-3">
                        <p className="font-medium italic p-2 bg-background rounded-md text-sm">"{translation.translatedText}"</p>
                        <div className="space-y-2 text-xs">
                            <p><strong className="flex items-center gap-1.5 font-semibold text-foreground"><Info className="w-3.5 h-3.5 text-primary"/>Context:</strong> {getExplanationText(translation.contextExplanation, lang)}</p>
                            <p><strong className="flex items-center gap-1.5 font-semibold text-foreground"><MessageSquareQuote className="w-3.5 h-3.5 text-primary"/>Tone:</strong> {getExplanationText(translation.toneExplanation, lang)}</p>
                            <p><strong className="flex items-center gap-1.5 font-semibold text-foreground"><Gauge className="w-3.5 h-3.5 text-primary"/>Formality:</strong> <Badge variant="outline" className="text-xs">{translation.formality}</Badge></p>
                            <div className="pt-2 mt-2 border-t">
                                <strong className="flex items-center gap-1.5 font-semibold text-foreground"><Lightbulb className="w-3.5 h-3.5 text-primary"/>Learning Nugget:</strong>
                                <div className="pl-2 mt-1">
                                    <p><em>{translation.learningNugget.phrase} &rarr; {translation.learningNugget.translation}</em></p>
                                    <p className="text-muted-foreground">{getExplanationText(translation.learningNugget.explanation, lang)}</p>
                                </div>
                            </div>
                        </div>
                      </div>
                    </div>
                 ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
      {isSender && (
        <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary text-primary-foreground">{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
