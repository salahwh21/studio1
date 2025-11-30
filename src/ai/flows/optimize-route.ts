
'use server';

/**
 * @fileOverview AI flow to optimize a delivery route.
 *
 * - optimizeRoute - A function that handles the route optimization process.
 * - OptimizeRouteInput - The input type for the optimizeRoute function.
 * - OptimizeRouteOutput - The return type for the optimizeRoute function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OptimizeRouteInputSchema = z.object({
  startLocation: z.string().describe('The starting point for the delivery route.'),
  addresses: z.array(z.string()).describe('A list of delivery addresses that need to be visited.'),
});
export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;

const OptimizeRouteOutputSchema = z.object({
  optimizedRoute: z.array(z.string()).describe('The list of addresses in the most efficient order.'),
});
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;

export async function optimizeRoute(input: OptimizeRouteInput): Promise<OptimizeRouteOutput> {
  return optimizeRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeRoutePrompt',
  input: { schema: OptimizeRouteInputSchema },
  output: { schema: OptimizeRouteOutputSchema },
  prompt: `You are a logistics expert AI. Your task is to optimize a delivery route in a Jordanian city.

You will be given a starting location and a list of delivery addresses.
You must return the list of addresses sorted in the most efficient and logical order to minimize travel time and distance.
Do not include the starting location in the returned list. Only return the delivery addresses in the optimal order.

Starting Location: {{{startLocation}}}

Delivery Addresses:
{{#each addresses}}
- {{{this}}}
{{/each}}

Return the optimized list of addresses as a JSON object.`,
});

const optimizeRouteFlow = ai.defineFlow(
  {
    name: 'optimizeRouteFlow',
    inputSchema: OptimizeRouteInputSchema,
    outputSchema: OptimizeRouteOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (e) {
      throw e;
    }
  }
);
