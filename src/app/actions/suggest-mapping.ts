
'use server';

import { suggestFieldMapping, type SuggestFieldMappingOutput } from '@/ai/flows/suggest-field-mapping';
import { z } from 'zod';

const actionSchema = z.object({
  payload: z.string().min(2, 'Payload must be a valid JSON object string.'),
});

type State = {
  data: SuggestFieldMappingOutput | null;
  error: string | null;
  success: boolean;
};

// This is our system's target fields.
const ourOrderFields = [
    { key: 'recipient', label: 'اسم المستلم' },
    { key: 'phone', label: 'رقم الهاتف' },
    { key: 'address', label: 'العنوان' },
    { key: 'cod', label: 'المبلغ المطلوب' },
    { key: 'notes', label: 'ملاحظات' },
    { key: 'referenceNumber', label: 'الرقم المرجعي' },
];

export async function suggestMappingAction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = actionSchema.safeParse({
    payload: formData.get('payload'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.payload?.join(', ') || 'Invalid input.',
      success: false,
    };
  }

  // Validate if the payload is valid JSON
  try {
      JSON.parse(validatedFields.data.payload);
  } catch (e) {
      return { data: null, error: "The provided text is not a valid JSON object.", success: false };
  }

  try {
    const result = await suggestFieldMapping({
        sourcePayload: validatedFields.data.payload,
        targetFields: ourOrderFields
    });
    
    if (!result.suggestedMappings || result.suggestedMappings.length === 0) {
        throw new Error("AI model could not suggest any mappings.");
    }
    return {
      data: result,
      error: null,
      success: true,
    };
  } catch (error: any) {
    console.error('Error in suggestMappingAction:', error);
    return {
      data: null,
      error: error.message || 'Failed to get suggestions from the AI model.',
      success: false,
    };
  }
}
