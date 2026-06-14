/**
 * AI Configuration Helper
 * Manages API keys for different AI providers — stored in DB via /api/auth/preferences
 */

import { api } from '@/lib/api';

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

export async function getAIConfig(): Promise<AIConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const prefs = await api.getPreferences();
    return (prefs?.aiConfig as AIConfig) ?? {};
  } catch {
    return {};
  }
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  if (typeof window === 'undefined') return;
  await api.savePreferences({ aiConfig: config });
}

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

export function getAPIKey(provider: AIProviderName): string | undefined {
  return getAPIKeyFromEnv(provider);
}

export function isProviderEnabled(provider: AIProviderName): boolean {
  return !!getAPIKey(provider);
}

export function getAvailableProvider(): AIProviderName | null {
  const providers: AIProviderName[] = ['google', 'openai', 'anthropic', 'mistral', 'cohere', 'huggingface'];
  for (const provider of providers) {
    if (isProviderEnabled(provider)) return provider;
  }
  return null;
}

export function getAvailableProviders(): AIProviderName[] {
  const providers: AIProviderName[] = ['google', 'openai', 'anthropic', 'mistral', 'cohere', 'huggingface'];
  return providers.filter(p => isProviderEnabled(p));
}
