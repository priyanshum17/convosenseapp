'use client';

import type { Message } from '@/lib/types';
import { useGlobalTalk } from '@/hooks/use-global-talk';
import { cn } from '@/lib/utils';
import { getLanguageLabel } from '@/lib/languages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export function MessageBubble({ message }: MessageBubbleProps) {
  const { currentUser } = useGlobalTalk();

  if (!currentUser) return null;

  const isSender = message.sender.id === currentUser.id;
  const viewerLang = currentUser.language;
  const senderLang = message.sender.language;
  const hasTranslations = Object.keys(message.translations).length > 0;

  // By default, show original text. If a translation for the viewer's language exists, show that instead.
  let textToShow = message.originalText;
  let isTranslatedForViewer = false;

  if (viewerLang !== senderLang && message.translations[viewerLang]) {
    textToShow = message.translations[viewerLang].translatedText;
    isTranslatedForViewer = true;
  }

  return (
    <div className={cn('flex items-end gap-2', isSender ? 'justify-end' : 'justify-start')}>
      {!isSender && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={`https://placehold.co/32x32.png`} alt={message.sender.name} data-ai-hint="person portrait" />
          <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('max-w-md w-fit rounded-lg p-3 shadow-sm', isSender ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none')}>
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
        
        {hasTranslations && (
          <Accordion type="single" collapsible className="w-full mt-2 border-t border-current/20 pt-2">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="text-xs py-1 hover:no-underline">
                <div className="flex items-center gap-1.5">
                  <Languages className="w-3 h-3" />
                  View translations & details
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 p-1 text-sm">
                 <div>
                    <h4 className="font-semibold mb-1">Original ({getLanguageLabel(senderLang)})</h4>
                    <p className="p-2 bg-black/10 rounded-md text-xs">{message.originalText}</p>
                 </div>
                 {Object.entries(message.translations).map(([lang, translation]) => (
                    <div key={lang}>
                      <h4 className="font-semibold mb-1">Translation ({getLanguageLabel(lang)})</h4>
                      <div className="space-y-3 p-2 bg-black/10 rounded-md text-xs">
                        <p className="font-medium italic">"{translation.translatedText}"</p>
                        <div className="space-y-2">
                            <p><strong className="flex items-center gap-1"><Info className="w-3 h-3"/>Context:</strong> {translation.contextExplanation}</p>
                            <p><strong className="flex items-center gap-1"><MessageSquareQuote className="w-3 h-3"/>Tone:</strong> {translation.toneExplanation}</p>
                            <p><strong className="flex items-center gap-1"><Gauge className="w-3 h-3"/>Formality:</strong> <Badge variant={isSender ? "secondary" : "default"} className="text-xs">{translation.formality}</Badge></p>
                            <div className="pt-1 mt-1 border-t border-current/20">
                                <strong className="flex items-center gap-1"><Lightbulb className="w-3 h-3"/>Learning Nugget:</strong>
                                <div className="pl-2">
                                    <p><em>{translation.learningNugget.phrase} &rarr; {translation.learningNugget.translation}</em></p>
                                    <p className="text-xs opacity-80">{translation.learningNugget.explanation}</p>
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

        <div className="flex items-center gap-2 mt-1.5 text-xs opacity-70">
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
          <span className="flex-grow text-right">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>
      {isSender && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={`https://placehold.co/32x32.png`} alt={message.sender.name} data-ai-hint="person portrait"/>
          <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
