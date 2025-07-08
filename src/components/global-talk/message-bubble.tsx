'use client';

import type { Message } from '@/lib/types';
import { useGlobalTalk } from '@/hooks/use-global-talk';
import { cn } from '@/lib/utils';
import { getLanguageLabel } from '@/lib/languages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Smile, Frown, Meh, Languages, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  const lang = currentUser.language;
  const senderLang = message.sender.language;

  let textToShow = message.originalText;
  let translationMeta = null;

  if (lang !== senderLang && message.translations[lang]) {
    textToShow = message.translations[lang].text;
    translationMeta = {
      source: message.translations[lang].source,
      originalLanguage: getLanguageLabel(senderLang),
    };
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
        
        {translationMeta && (
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 mt-2 text-xs opacity-80 cursor-help border-t border-white/20 pt-1">
                  <Languages className="w-3 h-3" />
                  <span>Translated from {translationMeta.originalLanguage} by {translationMeta.source}</span>
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
