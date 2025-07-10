
'use client';

import type { Explanation, Message } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { getLanguageLabel } from '@/lib/languages';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Smile, Frown, Meh, Languages, Lightbulb, MessageSquareQuote, Gauge, Info, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import React from 'react';

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
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

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
    <div className={cn('group/message flex w-full items-start gap-3', isSender ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="w-9 h-9">
          <AvatarFallback className={cn(isSender && 'bg-primary text-primary-foreground')}>{message.sender.name?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className={cn('flex w-fit max-w-2xl flex-col gap-1', isSender ? 'items-end' : 'items-start')}>
        <div className="flex flex-col">
            <div className={cn(
                'rounded-lg p-3 px-4 shadow-sm', 
                isSender ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground border rounded-bl-none'
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

            <div className={cn("flex items-center gap-3 px-2 pt-1 text-xs text-muted-foreground", isSender ? 'justify-end' : 'justify-start')}>
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
                <time dateTime={messageDate.toISOString()}>
                  {formatDistanceToNow(messageDate, { addSuffix: true })}
                </time>
                {hasTranslations && (
                    <button onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <span>Details</span>
                        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isDetailsOpen && "rotate-180")} />
                    </button>
                )}
            </div>
        </div>
        
        {hasTranslations && isDetailsOpen && (
           <div className="w-full max-w-2xl space-y-4 rounded-lg border bg-secondary/50 p-4 text-sm animate-accordion-down">
                <div>
                   <h4 className="font-semibold mb-1 text-xs uppercase tracking-wider text-muted-foreground">Original ({getLanguageLabel(senderLang)})</h4>
                   <p className="p-2 bg-background rounded-md text-sm">{message.originalText}</p>
                </div>
                {Object.entries(message.translations).map(([lang, translation]) => (
                   <div key={lang} className="pt-3 border-t">
                     <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Translation ({getLanguageLabel(lang)})</h4>
                     <div className="space-y-3">
                       <p className="font-medium italic p-2 bg-background rounded-md text-sm">"{translation.translatedText}"</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                           <div className="p-2 rounded-md bg-background/50"><strong className="flex items-center gap-1.5 font-semibold text-foreground mb-1"><Info className="w-3.5 h-3.5 text-primary"/>Context:</strong> <span className="text-muted-foreground">{getExplanationText(translation.contextExplanation, lang)}</span></div>
                           <div className="p-2 rounded-md bg-background/50"><strong className="flex items-center gap-1.5 font-semibold text-foreground mb-1"><MessageSquareQuote className="w-3.5 h-3.5 text-primary"/>Tone:</strong> <span className="text-muted-foreground">{getExplanationText(translation.toneExplanation, lang)}</span></div>
                           <div className="p-2 rounded-md bg-background/50"><strong className="flex items-center gap-1.5 font-semibold text-foreground mb-1"><Gauge className="w-3.5 h-3.5 text-primary"/>Formality:</strong> <Badge variant="outline" className="text-xs">{translation.formality}</Badge></div>
                           <div className="p-2 rounded-md bg-background/50 md:col-span-2"><strong className="flex items-center gap-1.5 font-semibold text-foreground mb-1"><Lightbulb className="w-3.5 h-3.5 text-amber-500"/>Learning Nugget:</strong>
                               <div className="pl-2 mt-1">
                                   <p className="text-muted-foreground"><em>{translation.learningNugget.phrase} &rarr; {translation.learningNugget.translation}</em></p>
                                   <p className="text-muted-foreground text-xs mt-0.5">{getExplanationText(translation.learningNugget.explanation, lang)}</p>
                               </div>
                           </div>
                       </div>
                     </div>
                   </div>
                ))}
           </div>
        )}
      </div>
    </div>
  );
}
