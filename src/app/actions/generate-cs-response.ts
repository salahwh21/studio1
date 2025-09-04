'use server';

import { generateResponse, GenerateResponseInputSchema, type GenerateResponseOutput } from '@/ai/flows/customer-service-agent';
import { z } from 'zod';

type State = {
  data: GenerateResponseOutput | null;
  error: string | null;
  success: boolean;
};

export async function generateCsResponseAction(validatedData: z.infer<typeof GenerateResponseInputSchema>): Promise<State> {
  try {
    const result = await generateResponse(validatedData);
    if (!result.response) {
      throw new Error("AI model could not generate a response.");
    }
    return {
      data: result,
      error: null,
      success: true,
    };
  } catch (error: any) {
    console.error('Error in generateCsResponseAction:', error);
    return {
      data: null,
      error: error.message || 'Failed to get a response from the AI model.',
      success: false,
    };
  }
}
