'use client';
import { z } from 'zod';

export const SlipOrderSchema = z.object({
  id: z.string(),
  recipient: z.string(),
  phone: z.string(),
  city: z.string(),
  address: z.string(),
  previousStatus: z.string(),
  itemPrice: z.number(),
});

export const SlipDataSchema = z.object({
  id: z.string(),
  partyName: z.string(),
  partyLabel: z.string(),
  date: z.string(),
  branch: z.string(),
  orders: z.array(SlipOrderSchema),
  total: z.number(),
});

export const PdfActionInputSchema = z.object({
  slipData: SlipDataSchema,
  reportsLogo: z.string().nullable(),
  isDriver: z.boolean(),
});
