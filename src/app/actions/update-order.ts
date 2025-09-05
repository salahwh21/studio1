'use server';

import { ordersStore, type Order } from '@/store/orders-store';
import { z } from 'zod';

const updateSchema = z.object({
    orderId: z.string(),
    field: z.string(), // We'll cast this to keyof Order later
    value: z.any(),
});

type State = {
  success: boolean;
  error?: string;
};

export async function updateOrderAction(validatedData: z.infer<typeof updateSchema>): Promise<State> {
  try {
    const { orderId, field, value } = validatedData;
    
    // In a real app, you'd have more sophisticated validation and authorization here.
    ordersStore.getState().updateOrderField(orderId, field as keyof Order, value);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateOrderAction:', error);
    return {
      success: false,
      error: error.message || 'Failed to update order.',
    };
  }
}
