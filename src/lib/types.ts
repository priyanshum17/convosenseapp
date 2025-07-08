export type User = {
  id: string;
  name: string;
  language: string;
};

export type Sentiment = 'positive' | 'negative' | 'neutral' | 'unknown';

export type Message = {
  id: string;
  sender: User;
  originalText: string;
  timestamp: number;
  sentiment: Sentiment;
  translations: Record<string, { text: string; source: string }>;
};
