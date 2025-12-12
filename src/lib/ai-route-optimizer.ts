/**
 * Simple AI Route Optimizer
 * Uses Google Gemini API directly without Genkit
 */

export interface RouteOptimizationInput {
  startLocation: string;
  addresses: string[];
}

export interface RouteOptimizationOutput {
  optimizedRoute: string[];
  estimatedDistance?: number;
  estimatedTime?: number;
}

/**
 * Optimize delivery route using Google Gemini API
 */
export async function optimizeRouteWithAI(
  input: RouteOptimizationInput
): Promise<RouteOptimizationOutput> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Google Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local');
  }

  const prompt = `أنت خبير في تحسين مسارات التوصيل في الأردن.

لديك نقطة بداية وقائمة من عناوين التوصيل.
مهمتك هي ترتيب العناوين بالطريقة الأكثر كفاءة لتقليل الوقت والمسافة.

نقطة البداية: ${input.startLocation}

عناوين التوصيل:
${input.addresses.map((addr, i) => `${i + 1}. ${addr}`).join('\n')}

قم بإرجاع العناوين مرتبة بالترتيب الأمثل فقط، بدون نقطة البداية.
أرجع النتيجة كـ JSON بهذا الشكل:
{
  "optimizedRoute": ["العنوان الأول", "العنوان الثاني", ...]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const text = data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        optimizedRoute: result.optimizedRoute || input.addresses,
        estimatedDistance: input.addresses.length * 3.5, // Rough estimate
        estimatedTime: input.addresses.length * 15, // Rough estimate
      };
    }

    // Fallback: return original order if parsing fails
    console.warn('Could not parse AI response, returning original order');
    return {
      optimizedRoute: input.addresses,
      estimatedDistance: input.addresses.length * 3.5,
      estimatedTime: input.addresses.length * 15,
    };
  } catch (error) {
    console.error('Error optimizing route:', error);
    throw error;
  }
}

/**
 * Simple fallback optimizer (no AI)
 * Just returns addresses in original order
 */
export function optimizeRouteSimple(
  input: RouteOptimizationInput
): RouteOptimizationOutput {
  return {
    optimizedRoute: input.addresses,
    estimatedDistance: input.addresses.length * 3.5,
    estimatedTime: input.addresses.length * 15,
  };
}
