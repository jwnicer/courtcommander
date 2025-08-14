'use server';
/**
 * @fileOverview An AI agent that suggests balanced badminton matches based on skill level.
 *
 * - suggestBalancedMatches - A function that suggests balanced matches for players.
 * - SuggestBalancedMatchesInput - The input type for the suggestBalancedMatches function.
 * - SuggestBalancedMatchesOutput - The return type for the suggestBalancedMatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBalancedMatchesInputSchema = z.object({
  playerLevel: z
    .number()
    .describe('The skill level of the player (e.g., 1-7).'),
  availablePlayers: z.array(
    z.object({
      userId: z.string(),
      nickname: z.string(),
      level: z.number(),
    })
  ).describe('An array of available players with their user ID, nickname, and level.'),
  gameType: z.enum(['singles', 'doubles']).describe('The type of game (singles or doubles).'),
});
export type SuggestBalancedMatchesInput = z.infer<typeof SuggestBalancedMatchesInputSchema>;

const SuggestBalancedMatchesOutputSchema = z.object({
  suggestedMatches: z.array(
    z.array(
      z.object({
        userId: z.string(),
        nickname: z.string(),
        level: z.number(),
      })
    )
  ).describe('An array of suggested matches, where each match is an array of players.'),
  reasoning: z.string().describe('The AI reasoning behind the suggested matches.'),
});
export type SuggestBalancedMatchesOutput = z.infer<typeof SuggestBalancedMatchesOutputSchema>;

export async function suggestBalancedMatches(input: SuggestBalancedMatchesInput): Promise<SuggestBalancedMatchesOutput> {
  return suggestBalancedMatchesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBalancedMatchesPrompt',
  input: {schema: SuggestBalancedMatchesInputSchema},
  output: {schema: SuggestBalancedMatchesOutputSchema},
  prompt: `You are an AI badminton match organizer. Given a player\'s skill level and a list of available players, suggest balanced matches.\n\nPlayer Skill Level: {{{playerLevel}}}\nAvailable Players: {{#each availablePlayers}}{{{nickname}}} (Level: {{{level}}}), {{/each}}\nGame Type: {{{gameType}}}\n\nConsider skill levels to create the most balanced and fun matches. Provide reasoning for your suggestions.\n\nOutput matches as an array of arrays, where each inner array represents a match and contains player objects.\n\nFor example:\n\n{\n  "suggestedMatches": [\n    [\n      {\n        "userId": "user123",\n        "nickname": "Alice",\n        "level": 4\n      },\n      {\n        "userId": "user456",\n        "nickname": "Bob",\n        "level": 4\n      }\n    ],\n    [\n      {\n        "userId": "user789",\n        "nickname": "Charlie",\n        "level": 3\n      },\n      {\n        "userId": "user012",\n        "nickname": "David",\n        "level": 3\n      }\n    ]\n  ],\n  "reasoning": "These matches are suggested because they pair players with similar skill levels, ensuring fair and competitive games."\n}\n`,
});

const suggestBalancedMatchesFlow = ai.defineFlow(
  {
    name: 'suggestBalancedMatchesFlow',
    inputSchema: SuggestBalancedMatchesInputSchema,
    outputSchema: SuggestBalancedMatchesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
