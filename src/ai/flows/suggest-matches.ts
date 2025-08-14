'use server';
/**
 * @fileOverview An AI agent that suggests balanced badminton matches based on skill level.
 *
 * - suggestMatches - A function that suggests balanced matches for players.
 * - SuggestMatchesInput - The input type for the suggestMatches function.
 * - SuggestMatchesOutput - The return type for the suggestMatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMatchesInputSchema = z.object({
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
export type SuggestMatchesInput = z.infer<typeof SuggestMatchesInputSchema>;

const SuggestMatchesOutputSchema = z.object({
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
export type SuggestMatchesOutput = z.infer<typeof SuggestMatchesOutputSchema>;

export async function suggestMatches(input: SuggestMatchesInput): Promise<SuggestMatchesOutput> {
  return suggestMatchesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMatchesPrompt',
  input: {schema: SuggestMatchesInputSchema},
  output: {schema: SuggestMatchesOutputSchema},
  prompt: `You are an AI badminton match organizer. Given a player\'s skill level and a list of available players, suggest balanced matches.

Player Skill Level: {{{playerLevel}}}
Available Players: {{#each availablePlayers}}{{{nickname}}} (Level: {{{level}}}), {{/each}}
Game Type: {{{gameType}}}

Consider skill levels to create the most balanced and fun matches. Provide reasoning for your suggestions.

Output matches as an array of arrays, where each inner array represents a match and contains player objects.

For example:

{
  "suggestedMatches": [
    [
      {
        "userId": "user123",
        "nickname": "Alice",
        "level": 4
      },
      {
        "userId": "user456",
        "nickname": "Bob",
        "level": 4
      }
    ],
    [
      {
        "userId": "user789",
        "nickname": "Charlie",
        "level": 3
      },
      {
        "userId": "user012",
        "nickname": "David",
        "level": 3
      }
    ]
  ],
  "reasoning": "These matches are suggested because they pair players with similar skill levels, ensuring fair and competitive games."
}
`,
});

const suggestMatchesFlow = ai.defineFlow(
  {
    name: 'suggestMatchesFlow',
    inputSchema: SuggestMatchesInputSchema,
    outputSchema: SuggestMatchesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
