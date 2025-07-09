export type User = {
  id: string;
  name: string;
  language: string;
};

export type Sentiment = 'positive' | 'negative' | 'neutral' | 'unknown';

export type Explanation = {
  sourceLanguageText: string;
  targetLanguageText: string;
}

export type LearningNugget = {
  phrase: string;
  translation: string;
  explanation: Explanation;
};

export type TranslationDetail = {
  translatedText: string;
  source: string;
  contextExplanation: Explanation;
  toneExplanation: Explanation;
  formality: string;
  learningNugget: LearningNugget;
};

export type Message = {
  id: string;
  sender: User;
  originalText: string;
  timestamp: number;
  sentiment: Sentiment;
  translations: Record<string, TranslationDetail>;
};
