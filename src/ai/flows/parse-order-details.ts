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
  phone: z.string().describe('رقم هاتف العميل'),
  city: z.string().describe("اسم المدينة (مثال: عمان، الزرقاء)."),
  region: z.string().describe("اسم المنطقة أو الحي ضمن المدينة (مثال: تلاع العلي، حي معصوم)."),
  addressDetails: z.string().describe("باقي تفاصيل العنوان مثل اسم الشارع، رقم البناية، أو أي علامة مميزة."),
  cod: z.number().describe('المبلغ الإجمالي المطلوب تحصيله من العميل (cash on delivery).'),
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
  prompt: `You are an expert AI assistant for a logistics company in Jordan. Your task is to accurately extract order details from Arabic text, which could be a formal message or a casual WhatsApp conversation.

You must extract the following information:
- Customer's name.
- Customer's phone number.
- The total Cash on Delivery (COD) amount.
- A list of items and their quantities.
- The address, which you must break down into three parts:
    1.  **city**: The main city (e.g., 'عمان', 'الزرقاء', 'إربد').
    2.  **region**: The specific neighborhood or area within the city (e.g., 'تلاع العلي', 'حي معصوم').
    3.  **addressDetails**: Any remaining address details like street name, building number, or landmarks.

**Important Instructions:**
- If the text mentions a price "شامل التوصيل" (including delivery), that is the COD amount.
- Be smart about identifying the region. A customer might write "ماركا الشمالية" or just "ماركا". Your output for 'region' should be "ماركا". "الدوار السابع" should be "الدوار السابع".
- If you cannot find a specific piece of information, return an empty string for text fields, an empty array for lists, or 0 for the COD.

**Example:**
- **Input Request:** "مرحبا بدي اوردر باسم احمد علي، تلفون 0791234567، العنوان ماركا الشمالية، شارع 5، والسعر الكلي 15 دينار شامل توصيل. المنتج هو قميص عدد 1."
- **Expected Output:**
  - customerName: "احمد علي"
  - phone: "0791234567"
  - city: "عمان"
  - region: "ماركا"
  - addressDetails: "الشمالية، شارع 5"
  - cod: 15
  - items: ["قميص"]
  - quantity: [1]

**Order to process:**
{{{request}}}
`,
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
