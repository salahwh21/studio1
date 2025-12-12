import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Get available AI provider configuration
 * Checks environment variables for API keys and returns the first available provider
 */
function getAIConfig() {
  // Check Google Gemini
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    return {
      provider: 'google',
      apiKey: geminiKey,
      model: 'googleai/gemini-pro',
      plugin: googleAI({ apiKey: geminiKey })
    };
  }

  // Check OpenAI
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (openaiKey) {
    // Note: You'll need to install @genkit-ai/openai package
    console.log('✅ OpenAI API key found');
    return {
      provider: 'openai',
      apiKey: openaiKey,
      model: 'openai/gpt-4',
      plugin: null // Will be added when package is installed
    };
  }

  // Check Anthropic Claude
  const anthropicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    console.log('✅ Anthropic API key found');
    return {
      provider: 'anthropic',
      apiKey: anthropicKey,
      model: 'anthropic/claude-3',
      plugin: null // Will be added when package is installed
    };
  }

  // No API key found
  console.warn('⚠️ No AI API key found. Please set one of the following in .env.local:');
  console.warn('   - NEXT_PUBLIC_GEMINI_API_KEY (Google Gemini)');
  console.warn('   - NEXT_PUBLIC_OPENAI_API_KEY (OpenAI)');
  console.warn('   - NEXT_PUBLIC_ANTHROPIC_API_KEY (Anthropic Claude)');
  
  return null;
}

const config = getAIConfig();

if (!config) {
  throw new Error('No AI provider configured. Please add an API key to .env.local');
}

console.log(`🤖 Using AI Provider: ${config.provider.toUpperCase()}`);
console.log(`📦 Model: ${config.model}`);

export const ai = genkit({
  plugins: config.plugin ? [config.plugin] : [],
  model: config.model,
});

export const aiProvider = config.provider;
export const aiModel = config.model;
