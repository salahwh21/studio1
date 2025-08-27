
'use server';

import { optimizeRoute, type OptimizeRouteOutput } from '@/ai/flows/optimize-route';
import { z } from 'zod';

const formSchema = z.object({
  driverId: z.string(), // We don't use this yet, but it's good for future use
  startLocation: z.string(),
  addresses: z.array(z.object({ value: z.string() })),
});

type State = {
  data: OptimizeRouteOutput | null;
  error: string | null;
  success: boolean;
};

export async function optimizeRouteAction(validatedData: z.infer<typeof formSchema>): Promise<State> {
  
  const addresses = validatedData.addresses.map(a => a.value);

  try {
    const result = await optimizeRoute({ startLocation: validatedData.startLocation, addresses });
    if (!result.optimizedRoute || result.optimizedRoute.length === 0) {
        throw new Error("AI model could not generate an optimized route.");
    }
    return {
      data: result,
      error: null,
      success: true,
    };
  } catch (error: any) {
    console.error('Error in optimizeRouteAction action:', error);
    return {
      data: null,
      error: error.message || 'Failed to optimize route from the AI model.',
      success: false,
    };
  }
}
