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
  customerName: z.string().describe('اسم العميل'),
  address: z.string().describe('عنوان التوصيل الكامل (المدينة، المنطقة، الشارع).'),
  items: z.array(z.string()).describe('قائمة بالمنتجات في الطلب.'),
  quantity: z.array(z.number()).describe('كمية كل منتج في الطلب.'),
});
export type ParseOrderDetailsOutput = z.infer<typeof ParseOrderDetailsOutputSchema>;

export async function parseOrderDetails(input: ParseOrderDetailsInput): Promise<ParseOrderDetailsOutput> {
  return parseOrderDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseOrderDetailsPrompt',
  input: {schema: ParseOrderDetailsInputSchema},
  output: {schema: ParseOrderDetailsOutputSchema},
  prompt: `أنت مساعد ذكاء اصطناعي متخصص في استخراج تفاصيل الطلبات من نصوص باللغة العربية. يمكن أن يكون الطلب على شكل نص عادي أو صورة. قم باستخراج اسم العميل، العنوان، المنتجات، والكمية من الطلب التالي.

الطلب: {{{request}}}

أخرج البيانات بصيغة JSON. إذا كان الطلب صورة، استخدم تقنية OCR لاستخراج النص قبل تحليل تفاصيل الطلب. ركز على تحديد الكميات بشكل صحيح لكل منتج.`,
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
