'use server';

/**
 * @fileOverview Implements the message translation flow.
 *
 * - translateMessage - A function that translates a message from one language to another.
 * - TranslateMessageInput - The input type for the translateMessage function.
 * - TranslateMessageOutput - The return type for the translateMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateMessageInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  sourceLanguage: z.string().describe('The language of the text to translate.'),
  targetLanguage: z.string().describe('The language to translate the text to.'),
});
export type TranslateMessageInput = z.infer<typeof TranslateMessageInputSchema>;

const ExplanationSchema = z.object({
  sourceLanguageText: z.string().describe('The explanation written in the source language.'),
  targetLanguageText: z.string().describe('The explanation written in the target language.'),
});

const LearningNuggetSchema = z.object({
    phrase: z.string().describe('A key phrase from the original text.'),
    translation: z.string().describe('The translation of the key phrase into the target language.'),
    explanation: ExplanationSchema.describe('A brief explanation of the grammar or vocabulary of the key phrase, with versions in both source and target languages.'),
});

const TranslateMessageOutputSchema = z.object({
  translatedText: z.string().describe('The translated text in the target language.'),
  source: z.string().describe('The translation source. Indicate that it was translated by ConvoSense.'),
  contextExplanation: ExplanationSchema.describe("An explanation of the translation's context, with versions in both source and target languages."),
  toneExplanation: ExplanationSchema.describe("An explanation of the translation's tone, with versions in both source and target languages."),
  formality: z.string().describe('The formality level of the translated message, as a single word in the target language.'),
  learningNugget: LearningNuggetSchema.describe('A small piece of information to help the user learn the target language.'),
});
export type TranslateMessageOutput = z.infer<typeof TranslateMessageOutputSchema>;

export async function translateMessage(input: TranslateMessageInput): Promise<TranslateMessageOutput> {
  return translateMessageFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateMessageInputSchema},
  output: {schema: TranslateMessageOutputSchema},
  prompt: `You are a language and culture expert. You will be given text in a source language, and your task is to translate it to a target language while providing detailed explanations to ensure accurate and culturally appropriate communication.

Source Language: {{{sourceLanguage}}}
Target Language: {{{targetLanguage}}}
Text to translate: {{{text}}}

Important: When generating text in {{{targetLanguage}}}, you MUST use its native script (e.g., Devanagari for Hindi, Cyrillic for Russian, Japanese characters for Japanese, etc.).

Please provide the following in your response, ensuring your entire output conforms to the JSON schema:
1.  A direct translation of the text into the target language.
2.  A context explanation: Explain any nuances, idioms, or cultural references in the original text and how they were handled in the translation. If there are no special nuances, state that the translation is direct. Provide this explanation in two versions: one in {{{sourceLanguage}}} (for the sender, in the sourceLanguageText field) and one in {{{targetLanguage}}} (for the recipient, in the targetLanguageText field).
3.  A tone explanation: Describe the tone of the translated message (e.g., friendly, formal, direct, polite) and how it aligns with cultural norms. Provide this explanation in two versions: one in {{{sourceLanguage}}} (sourceLanguageText) and one in {{{targetLanguage}}} (targetLanguageText).
4.  Formality: Indicate the formality level (informal, neutral, formal). This term MUST be in {{{targetLanguage}}}.
5.  A learning nugget: Pick one key phrase or grammatical structure from the message. Provide its translation and a short, simple explanation to help the user learn the language. Provide this explanation in two versions: one in {{{sourceLanguage}}} (sourceLanguageText) and one in {{{targetLanguage}}} (targetLanguageText).`,
});

const translateMessageFlow = ai.defineFlow(
  {
    name: 'translateMessageFlow',
    inputSchema: TranslateMessageInputSchema,
    outputSchema: TranslateMessageOutputSchema,
  },
  async input => {
    const {output} = await translatePrompt(input);
    return {
      ...output!,
      source: 'ConvoSense',
    };
  }
);
