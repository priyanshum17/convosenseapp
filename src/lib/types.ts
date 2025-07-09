export type User = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  language?: string; // Is optional until user sets it
};

// A slimmed-down version for embedding in messages or listing users
export type PublicUserProfile = {
  uid: string;
  name: string | null;
  photoURL: string | null;
  language: string;
};

export type Sentiment = 'positive' | 'negative' | 'neutral' | 'unknown';

export type Explanation = {
  sourceLanguageText: string;
  targetLanguageText: string;
};

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
  sender: Omit<PublicUserProfile, 'language'>;
  senderLanguage: string;
  originalText: string;
  timestamp: any; // Firestore timestamp
  sentiment: Sentiment;
  translations: Record<string, TranslationDetail>;
};
