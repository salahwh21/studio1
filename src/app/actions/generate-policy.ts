'use server';

import { generatePolicyDesign, type GeneratePolicyDesignOutput } from '@/ai/flows/generate-policy-design';
import { z } from 'zod';

const actionSchema = z.object({
  description: z.string().min(10, 'الرجاء تقديم وصف أكثر تفصيلاً.'),
  paperWidth: z.coerce.number(),
  paperHeight: z.coerce.number(),
});

type State = {
  data: GeneratePolicyDesignOutput | null;
  error: string | null;
  success: boolean;
};

export async function generatePolicyAction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = actionSchema.safeParse({
    description: formData.get('description'),
    paperWidth: formData.get('paperWidth'),
    paperHeight: formData.get('paperHeight'),
  });
  
  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.description?.join(', ') || 'البيانات المدخلة غير صالحة.',
      success: false,
    };
  }

  try {
    const result = await generatePolicyDesign(validatedFields.data);
    if (!result.elements || result.elements.length === 0) {
        throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء تصميم. حاول بوصف مختلف.");
    }
    return {
      data: result,
      error: null,
      success: true,
    };
  } catch (error: any) {
    console.error('Error in generatePolicyAction:', error);
    return {
      data: null,
      error: error.message || 'فشل إنشاء التصميم من الذكاء الاصطناعي.',
      success: false,
    };
  }
}
