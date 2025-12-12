
'use server';

import { optimizeRouteWithAI, type RouteOptimizationOutput } from '@/lib/ai-route-optimizer';
import { z } from 'zod';

const formSchema = z.object({
  driverId: z.string(),
  startLocation: z.string(),
  addresses: z.array(z.object({ value: z.string(), lat: z.number().optional(), lng: z.number().optional() })),
});

export type OptimizeRouteActionInput = z.infer<typeof formSchema>;

type State = {
  data: RouteOptimizationOutput & { originalAddresses: OptimizeRouteActionInput['addresses'] } | null;
  error: string | null;
  success: boolean;
};

export async function optimizeRouteAction(validatedData: z.infer<typeof formSchema>): Promise<State> {
  const addresses = validatedData.addresses.map(a => a.value);

  try {
    const result = await optimizeRouteWithAI({ 
      startLocation: validatedData.startLocation, 
      addresses 
    });
    
    if (!result.optimizedRoute || result.optimizedRoute.length === 0) {
      throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء مسار محسّن.");
    }
    
    return {
      data: { ...result, originalAddresses: validatedData.addresses },
      error: null,
      success: true,
    };
  } catch (error: any) {
    console.error('Route optimization error:', error);
    return {
      data: null,
      error: error.message || 'فشل تحسين المسار. تحقق من إعدادات API.',
      success: false,
    };
  }
}
