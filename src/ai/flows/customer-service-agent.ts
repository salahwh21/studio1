'use server';

/**
 * @fileOverview An AI flow to generate customer service responses about order status.
 *
 * - generateResponse - A function that handles generating a helpful response.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OrderDetailsSchema = z.object({
  orderId: z.string().describe("رقم الطلب"),
  customerName: z.string().describe("اسم العميل"),
  status: z.string().describe("حالة الطلب الحالية"),
  driverName: z.string().optional().describe("اسم السائق المعين للطلب"),
  expectedDeliveryDate: z.string().optional().describe("تاريخ التوصيل المتوقع"),
});

export const GenerateResponseInputSchema = z.object({
  orderDetails: OrderDetailsSchema,
  query: z.string().describe("استفسار العميل, مثال: 'وين طلبي؟' أو 'متى بوصل الطلب؟'"),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  response: z.string().describe("الرد المقترح الذي يمكن إرساله للعميل عبر واتساب أو SMS."),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return customerServiceAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerServiceAgentPrompt',
  input: { schema: GenerateResponseInputSchema },
  output: { schema: GenerateResponseOutputSchema },
  prompt: `You are a highly professional and friendly customer service agent for "Al-Wameedh", a delivery company in Jordan. Your task is to generate a concise, polite, and helpful response in ARABIC to a customer's query based on their order details.

**Your Personality:**
- **Polite and Professional:** Always start with a polite greeting (e.g., "مرحباً يا فندم", "أهلاً بك").
- **Helpful and Clear:** Provide the status information clearly and directly.
- **Reassuring:** Make the customer feel that their order is being handled properly.
- **Concise:** Keep the message short and to the point, suitable for WhatsApp or SMS.

**Analyze the order status and generate a response. Here are some guidelines based on the status:**
- **If status is "جاري التوصيل" (Out for Delivery):** Mention that the order is with the driver and is expected today. Mention the driver's name if available.
- **If status is "تم التوصيل" (Delivered):** Confirm the delivery and thank the customer.
- **If status is "مؤجل" (Postponed):** Inform the customer that the delivery has been postponed as requested and that they will be contacted for a new delivery time.
- **If status is "بالانتظار" (Pending):** Inform the customer that the order has been received and is being prepared for dispatch soon.
- **If status is "راجع" (Returned):** Inform the customer politely that the order has been returned and they can contact customer service for more details.

**Customer Query:**
"{{{query}}}"

**Order Details:**
- Order ID: {{{orderDetails.orderId}}}
- Customer Name: {{{orderDetails.customerName}}}
- Status: {{{orderDetails.status}}}
- Driver: {{{orderDetails.driverName}}}
- Expected Delivery: {{{orderDetails.expectedDeliveryDate}}}

Generate the most appropriate response in Arabic.
`,
});

const customerServiceAgentFlow = ai.defineFlow(
  {
    name: 'customerServiceAgentFlow',
    inputSchema: GenerateResponseInputSchema,
    outputSchema: GenerateResponseOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (e) {
      console.error('Error generating customer service response:', e);
      throw e;
    }
  }
);
