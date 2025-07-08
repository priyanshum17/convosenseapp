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

const TranslateMessageOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
  source: z.string().describe('The translation source.  Indicate that it was translated by GlobalTalk.'),
});
export type TranslateMessageOutput = z.infer<typeof TranslateMessageOutputSchema>;

export async function translateMessage(input: TranslateMessageInput): Promise<TranslateMessageOutput> {
  return translateMessageFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateMessageInputSchema},
  output: {schema: TranslateMessageOutputSchema},
  prompt: `You are a translation expert.  You will be given text in a source language, and you will translate it to a target language.  Respond only with the translated text.

Source Language: {{{sourceLanguage}}}
Target Language: {{{targetLanguage}}}
Text to translate: {{{text}}}`,
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
      translatedText: output!.translatedText,
      source: 'GlobalTalk',
    };
  }
);
