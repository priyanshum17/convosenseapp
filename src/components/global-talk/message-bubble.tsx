'use client';

import type { Message, Explanation } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { getLanguageLabel } from '@/lib/languages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Smile, Frown, Meh, Languages, Lightbulb, MessageSquareQuote, Gauge, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toDate } from 'firebase/firestore';

type MessageBubbleProps = {
  message: Message;
};

const sentimentIcons = {
  positive: <Smile className="w-4 h-4 text-green-500" />,
  negative: <Frown className="w-4 h-4 text-red-500" />,
  neutral: <Meh className="w-4 h-4 text-gray-500" />,
  unknown: <Meh className="w-4 h-4 text-gray-400" />,
};

// Helper function to convert Firestore Timestamp to Date if necessary
const getMessageDate = (timestamp: any): Date => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp && timestamp.seconds) {
        return toDate(timestamp);
    }
    if (!isNaN(new Date(timestamp).getTime())) {
      return new Date(timestamp);
    }
    return new Date();
  };


export function MessageBubble({ message }: MessageBubbleProps) {
  const { user: currentUser } = useAuth();

  if (!currentUser || !currentUser.language) return null;

  const getExplanationText = (explanation: Explanation, targetLang: string) => {
    if (!currentUser || !currentUser.language) return '';
    // If the viewer's language is the target language of this translation, show the explanation in the target language.
    if (currentUser.language === targetLang) {
      return explanation.targetLanguageText;
    }
    // Otherwise (e.g., for the original sender, or a 3rd party), show it in the source language.
    return explanation.sourceLanguageText;
  };

  const isSender = message.sender.uid === currentUser.uid;
  const viewerLang = currentUser.language;
  const senderLang = message.senderLanguage;
  const hasTranslations = Object.keys(message.translations).length > 0;

  // By default, show original text. If a translation for the viewer's language exists, show that instead.
  let textToShow = message.originalText;
  let isTranslatedForViewer = false;

  if (viewerLang !== senderLang && message.translations[viewerLang]) {
    textToShow = message.translations[viewerLang].translatedText;
    isTranslatedForViewer = true;
  }
  
  const messageDate = getMessageDate(message.timestamp);

  return (
    <div className={cn('flex items-end gap-2', isSender ? 'justify-end' : 'justify-start')}>
      {!isSender && (
        <Avatar className="w-8 h-8">
            <AvatarImage src={message.sender.photoURL || undefined} alt={message.sender.name || 'User'} />
            <AvatarFallback>{message.sender.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex w-fit flex-col gap-1', isSender ? 'items-end' : 'items-start')}>
        <div className={cn('max-w-md w-fit rounded-xl p-3 shadow-md', isSender ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none border')}>
          {!isSender && <p className="text-xs font-bold mb-1">{message.sender.name}</p>}
          
          <p className="text-sm whitespace-pre-wrap">{textToShow}</p>
          
          {isTranslatedForViewer && (
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 mt-2 text-xs opacity-80 cursor-help border-t border-current/20 pt-1">
                  <Languages className="w-3 h-3" />
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

        <div className="flex items-center gap-2 mt-1.5 text-xs opacity-70">
          <span className="flex-grow text-right">
            {formatDistanceToNow(messageDate, { addSuffix: true })}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {sentimentIcons[message.sentiment] || sentimentIcons.unknown}
              </TooltipTrigger>
              <TooltipContent>
                <p>Sentiment: {message.sentiment}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        </div>
        
        {hasTranslations && (
          <Accordion type="single" collapsible className="w-full max-w-md">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="flex-none justify-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:no-underline focus-visible:ring-1 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4">
                  <span>Details</span>
                </AccordionTrigger>
              <AccordionContent className={cn("mt-1.5 w-full space-y-4 rounded-xl p-3 text-sm", isSender ? "bg-primary/95 text-primary-foreground" : "bg-muted/80 text-foreground")}>
                 <div>
                    <h4 className="font-semibold mb-1 text-xs uppercase tracking-wider">Original ({getLanguageLabel(senderLang)})</h4>
                    <p className="p-2 bg-black/10 rounded-md text-xs">{message.originalText}</p>
                 </div>
                 {Object.entries(message.translations).map(([lang, translation]) => (
                    <div key={lang} className="pt-2 border-t border-current/10 first:pt-0 first:border-none">
                      <h4 className="font-semibold mb-1 text-xs uppercase tracking-wider">Translation ({getLanguageLabel(lang)})</h4>
                      <div className="space-y-3 p-2 bg-black/10 rounded-md text-xs">
                        <p className="font-medium italic">"{translation.translatedText}"</p>
                        <div className="space-y-2">
                            <p><strong className="flex items-center gap-1"><Info className="w-3 h-3"/>Context:</strong> {getExplanationText(translation.contextExplanation, lang)}</p>
                            <p><strong className="flex items-center gap-1"><MessageSquareQuote className="w-3 h-3"/>Tone:</strong> {getExplanationText(translation.toneExplanation, lang)}</p>
                            <p><strong className="flex items-center gap-1"><Gauge className="w-3 h-3"/>Formality:</strong> <Badge variant={isSender ? "secondary" : "default"} className="text-xs">{translation.formality}</Badge></p>
                            <div className="pt-1 mt-1 border-t border-current/20">
                                <strong className="flex items-center gap-1"><Lightbulb className="w-3 h-3"/>Learning Nugget:</strong>
                                <div className="pl-2">
                                    <p><em>{translation.learningNugget.phrase} &rarr; {translation.learningNugget.translation}</em></p>
                                    <p className="text-xs opacity-80">{getExplanationText(translation.learningNugget.explanation, lang)}</p>
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
        <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.name || 'User'} />
            <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
