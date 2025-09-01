
'use server';

/**
 * @fileOverview An AI flow to suggest mappings between a source JSON payload and target fields.
 *
 * - suggestFieldMapping - A function that handles the mapping suggestion process.
 * - SuggestFieldMappingInput - The input type for the suggestFieldMapping function.
 * - SuggestFieldMappingOutput - The return type for the suggestFieldMapping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TargetFieldSchema = z.object({
  key: z.string().describe('The system key for the target field (e.g., "recipient").'),
  label: z.string().describe('The human-readable label for the target field (e.g., "المستلم").'),
});

const SuggestFieldMappingInputSchema = z.object({
  sourcePayload: z.string().describe('A stringified JSON object representing a sample payload from the source system.'),
  targetFields: z.array(TargetFieldSchema).describe('An array of available fields in our system that the source can map to.'),
});
export type SuggestFieldMappingInput = z.infer<typeof SuggestFieldMappingInputSchema>;


const MappingSuggestionSchema = z.object({
    source: z.string().describe("The key from the source payload JSON. Use dot notation for nested objects (e.g., 'customer.name')."),
    destination: z.string().describe("The 'key' of the best matching target field from the provided list."),
});

const SuggestFieldMappingOutputSchema = z.object({
  suggestedMappings: z.array(MappingSuggestionSchema).describe('An array of suggested mappings between source and destination fields.'),
});
export type SuggestFieldMappingOutput = z.infer<typeof SuggestFieldMappingOutputSchema>;


export async function suggestFieldMapping(input: SuggestFieldMappingInput): Promise<SuggestFieldMappingOutput> {
  return suggestFieldMappingFlow(input);
}


const prompt = ai.definePrompt({
  name: 'suggestFieldMappingPrompt',
  input: { schema: SuggestFieldMappingInputSchema },
  output: { schema: SuggestFieldMappingOutputSchema },
  prompt: `You are an expert data mapper AI. Your task is to analyze a sample JSON payload and suggest the best possible mappings to a given set of target fields.

You need to be smart about matching. Field names might not be identical but can be semantically similar. For example, 'customer_name', 'name', 'recipient', or 'custName' in the source payload should all map to the 'recipient' destination field. Similarly, 'phone', 'contact_number', 'tel' should map to 'phone'. 'cod_amount' or 'total' should map to 'cod'. Use dot notation for nested source fields (e.g., 'customer.details.address').

Analyze the keys and the values in the source payload to make the most logical connections. Only suggest mappings for fields that you are reasonably confident about. Do not suggest mappings for every single field in the source if there is no logical equivalent in the target.

**Target Fields Available:**
{{#each targetFields}}
- Key: \`{{{key}}}\`, Label: "{{{label}}}"
{{/each}}


**Source JSON Payload:**
\`\`\`json
{{{sourcePayload}}}
\`\`\`

Based on your analysis, provide a list of suggested mappings.
`,
});

const suggestFieldMappingFlow = ai.defineFlow(
  {
    name: 'suggestFieldMappingFlow',
    inputSchema: SuggestFieldMappingInputSchema,
    outputSchema: SuggestFieldMappingOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (e) {
      console.error('Error suggesting field mapping:', e);
      throw e;
    }
  }
);
