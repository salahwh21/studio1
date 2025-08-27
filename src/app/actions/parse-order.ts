
'use server';

import { parseOrderDetails, type ParseOrderDetailsOutput } from '@/ai/flows/parse-order-details';
import { z } from 'zod';

const actionSchema = z.object({
  request: z.string().min(1, 'Request cannot be empty.'),
});

type State = {
  data: ParseOrderDetailsOutput | null;
  error: string | null;
  message: string;
};

export async function parseOrderFromRequest(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = actionSchema.safeParse({
    request: formData.get('request'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.request?.join(', ') || 'Invalid input.',
      message: 'There was an error with your submission.',
    };
  }

  try {
    const result = await parseOrderDetails(validatedFields.data);
    if (!result.customerName && result.items.length === 0) {
        throw new Error("AI model could not extract any details. Please provide a more detailed request.");
    }
    return {
      data: result,
      error: null,
      message: 'Order parsed successfully.',
    };
  } catch (error: any) {
    console.error('Error in parseOrderFromRequest action:', error);
    return {
      data: null,
      error: error.message || 'Failed to parse order details from the AI model.',
      message: 'Something went wrong. Please try again.',
    };
  }
}

    