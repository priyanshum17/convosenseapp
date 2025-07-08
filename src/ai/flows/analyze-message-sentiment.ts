'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing the sentiment of a message.
 *
 * It includes:
 * - analyzeMessageSentiment: A function that takes a message as input and returns its sentiment.
 * - AnalyzeMessageSentimentInput: The input type for the analyzeMessageSentiment function.
 * - AnalyzeMessageSentimentOutput: The return type for the analyzeMessageSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMessageSentimentInputSchema = z.object({
  message: z.string().describe('The message to analyze.'),
});
export type AnalyzeMessageSentimentInput = z.infer<typeof AnalyzeMessageSentimentInputSchema>;

const AnalyzeMessageSentimentOutputSchema = z.object({
  sentiment: z.string().describe('The sentiment of the message (e.g., positive, negative, neutral).'),
  confidence: z.number().describe('The confidence level of the sentiment analysis (0-1).'),
});
export type AnalyzeMessageSentimentOutput = z.infer<typeof AnalyzeMessageSentimentOutputSchema>;

export async function analyzeMessageSentiment(input: AnalyzeMessageSentimentInput): Promise<AnalyzeMessageSentimentOutput> {
  return analyzeMessageSentimentFlow(input);
}

const analyzeMessageSentimentPrompt = ai.definePrompt({
  name: 'analyzeMessageSentimentPrompt',
  input: {schema: AnalyzeMessageSentimentInputSchema},
  output: {schema: AnalyzeMessageSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following message:

Message: {{{message}}}

Provide the sentiment (positive, negative, or neutral) and a confidence level (0-1).`,
});

const analyzeMessageSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeMessageSentimentFlow',
    inputSchema: AnalyzeMessageSentimentInputSchema,
    outputSchema: AnalyzeMessageSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeMessageSentimentPrompt(input);
    return output!;
  }
);
