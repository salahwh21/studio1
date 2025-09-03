import { config } from 'dotenv';
config();

import '@/ai/flows/parse-order-details.ts';
import '@/ai/flows/optimize-route.ts';
import '@/ai/flows/suggest-field-mapping.ts';
import '@/ai/flows/generate-policy-design.ts';
