'use server';

/**
 * @fileOverview An AI flow to generate a shipping policy design from a text description.
 * 
 * - generatePolicyDesign - A function that handles the design generation process.
 * - GeneratePolicyDesignInput - The input type for the generatePolicyDesign function.
 * - GeneratePolicyDesignOutput - The return type for the generatePolicyDesign function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PolicyElementSchema = z.object({
    type: z.enum(['text', 'barcode', 'image', 'shape']).describe('The type of the element.'),
    x: z.number().describe('The x-coordinate of the element in pixels.'),
    y: z.number().describe('The y-coordinate of the element in pixels.'),
    width: z.number().describe('The width of the element in pixels.'),
    height: z.number().describe('The height of the element in pixels.'),
    content: z.string().describe("The content of the element. For text, it's the text itself (can include placeholders like {{recipient}}). For barcodes, it's the data placeholder (e.g., {{orderId}}). For images, it's a placeholder like '{{company_logo}}'.")
});

const GeneratePolicyDesignInputSchema = z.object({
  description: z.string().describe('A natural language description of the desired policy design.'),
  paperWidth: z.number().describe('The width of the paper in mm.'),
  paperHeight: z.number().describe('The height of the paper in mm.'),
});
export type GeneratePolicyDesignInput = z.infer<typeof GeneratePolicyDesignInputSchema>;

const GeneratePolicyDesignOutputSchema = z.object({
  elements: z.array(PolicyElementSchema).describe('An array of design elements that make up the policy.'),
});
export type GeneratePolicyDesignOutput = z.infer<typeof GeneratePolicyDesignOutputSchema>;

export async function generatePolicyDesign(input: GeneratePolicyDesignInput): Promise<GeneratePolicyDesignOutput> {
  return generatePolicyDesignFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generatePolicyDesignPrompt',
    input: { schema: GeneratePolicyDesignInputSchema },
    output: { schema: GeneratePolicyDesignOutputSchema },
    prompt: `You are an expert shipping label designer. Your task is to generate a layout of elements for a shipping policy based on a user's description.

The user will provide a description of what they want and the dimensions of the paper. You must return an array of JSON objects, where each object represents a design element.

**Paper Dimensions:**
- Width: {{paperWidth}} mm
- Height: {{paperHeight}} mm

**Available Placeholders for Content:**
{{recipient}}, {{phone}}, {{address}}, {{city}}, {{region}}, {{cod}}, {{merchant}}, {{date}}, {{orderId}}, {{referenceNumber}}, {{driver}}, {{source}}, {{notes}}, {{items}}, {{company_logo}}

**Instructions:**
1.  Read the user's description carefully.
2.  Create a layout by defining elements (text, barcode, image, shape).
3.  Calculate appropriate x, y, width, and height values in PIXELS for each element. (1mm = 3.78px).
4.  For text elements, use logical placeholders (e.g., a field for the recipient's name should have content '{{recipient}}').
5.  For barcode elements, the content MUST be '{{orderId}}'.
6.  For image elements (like a logo), the content MUST be '{{company_logo}}'.
7.  Arrange the elements logically on the canvas. Avoid overlapping. Leave some margin around the edges.
8.  Return a valid JSON object matching the output schema.

**User's Design Description:**
"{{description}}"`,
});

const generatePolicyDesignFlow = ai.defineFlow(
  {
    name: 'generatePolicyDesignFlow',
    inputSchema: GeneratePolicyDesignInputSchema,
    outputSchema: GeneratePolicyDesignOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (e) {
      console.error('Error generating policy design:', e);
      throw e;
    }
  }
);
