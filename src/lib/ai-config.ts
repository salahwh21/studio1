/**
 * AI Configuration Helper
 * Manages API keys for different AI providers
 */

export interface AIProviderConfig {
  apiKey: string;
  enabled: boolean;
  lastTested?: string;
  status?: 'active' | 'error' | 'untested';
}

export interface AIConfig {
  openai?: AIProviderConfig;
  anthropic?: AIProviderConfig;
  google?: AIProviderConfig;
  mistral?: AIProviderConfig;
  cohere?: AIProviderConfig;
  huggingface?: AIProviderConfig;
}

export type AIProviderName = keyof AIConfig;

const AI_CONFIG_KEY = 'ai_config';

/**
 * Get AI configuration from localStorage (client-side only)
 */
export function getAIConfig(): AIConfig {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const saved = localStorage.getItem(AI_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse AI config from localStorage', e);
  }

  return {};
}

/**
 * Save AI configuration to localStorage (client-side only)
 */
export function saveAIConfig(config: AIConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save AI config to localStorage', e);
  }
}

/**
 * Get API key for a specific provider from environment variables (server-side)
 */
export function getAPIKeyFromEnv(provider: AIProviderName): string | undefined {
  switch (provider) {
    case 'google':
      return process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    case 'openai':
      return process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    case 'anthropic':
      return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    case 'mistral':
      return process.env.NEXT_PUBLIC_MISTRAL_API_KEY || process.env.MISTRAL_API_KEY;
    case 'cohere':
      return process.env.NEXT_PUBLIC_COHERE_API_KEY || process.env.COHERE_API_KEY;
    case 'huggingface':
      return process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_TOKEN;
    default:
      return undefined;
  }
}

/**
 * Get API key for a specific provider (works on both client and server)
 */
export function getAPIKey(provider: AIProviderName): string | undefined {
  // Try localStorage first (client-side)
  if (typeof window !== 'undefined') {
    const config = getAIConfig();
    const providerConfig = config[provider];
    
    if (providerConfig?.apiKey && providerConfig.enabled) {
      return providerConfig.apiKey;
    }
  }

  // Fallback to environment variables
  return getAPIKeyFromEnv(provider);
}

/**
 * Check if a provider is configured and enabled
 */
export function isProviderEnabled(provider: AIProviderName): boolean {
  const apiKey = getAPIKey(provider);
  return !!apiKey;
}

/**
 * Get the first available AI provider
 */
export function getAvailableProvider(): AIProviderName | null {
  const providers: AIProviderName[] = ['google', 'openai', 'anthropic', 'mistral', 'cohere', 'huggingface'];
  
  for (const provider of providers) {
    if (isProviderEnabled(provider)) {
      return provider;
    }
  }

  return null;
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): AIProviderName[] {
  const providers: AIProviderName[] = ['google', 'openai', 'anthropic', 'mistral', 'cohere', 'huggingface'];
  return providers.filter(provider => isProviderEnabled(provider));
}
