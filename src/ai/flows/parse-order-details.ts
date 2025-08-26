'use server';

/**
 * @fileOverview AI flow to parse order details from an image or text.
 *
 * - parseOrderDetails - A function that handles the order details parsing process.
 * - ParseOrderDetailsInput - The input type for the parseOrderDetails function.
 * - ParseOrderDetailsOutput - The return type for the parseOrderDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseOrderDetailsInputSchema = z.object({
  request: z.string().describe('The order request as text or a data URI of an image containing the request.'),
});
export type ParseOrderDetailsInput = z.infer<typeof ParseOrderDetailsInputSchema>;

const ParseOrderDetailsOutputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  address: z.string().describe('The delivery address.'),
  items: z.array(z.string()).describe('A list of items in the order.'),
  quantity: z.array(z.number()).describe('The quantity of each item in the order.'),
});
export type ParseOrderDetailsOutput = z.infer<typeof ParseOrderDetailsOutputSchema>;

export async function parseOrderDetails(input: ParseOrderDetailsInput): Promise<ParseOrderDetailsOutput> {
  return parseOrderDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseOrderDetailsPrompt',
  input: {schema: ParseOrderDetailsInputSchema},
  output: {schema: ParseOrderDetailsOutputSchema},
  prompt: `You are an AI assistant that extracts order details from a delivery request. The request can be in the form of text or an image. Extract the customer name, address, items, and quantity from the request.

Request: {{{request}}}

Output the data in JSON format. If the request is an image, use OCR to extract the text from the image before extracting the order details.`,
});

const parseOrderDetailsFlow = ai.defineFlow(
  {
    name: 'parseOrderDetailsFlow',
    inputSchema: ParseOrderDetailsInputSchema,
    outputSchema: ParseOrderDetailsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e) {
      console.error('Error parsing order details:', e);
      throw e;
    }
  }
);
