/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = (val: string): boolean => {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return (
    lower === '' ||
    lower.includes('placeholder') ||
    lower.includes('your-') ||
    lower.includes('your_') ||
    lower.includes('insert-') ||
    lower.includes('insert_') ||
    lower.includes('supabase.co') && (lower.includes('your-project') || lower.includes('project-id') || lower.includes('yourproject')) ||
    lower.includes('key_here') ||
    lower.includes('your_anon_key')
  );
};

const isValidUrl = (val: string): boolean => {
  return typeof val === 'string' && val.trim().startsWith('https://');
};

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  isValidUrl(supabaseUrl) && 
  !isPlaceholder(supabaseUrl) && 
  !isPlaceholder(supabaseAnonKey)
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to handle errors uniformly in Supabase operations.
 */
export function handleSupabaseError(error: any, operation: string) {
  console.error(`[Supabase Error] During ${operation}:`, error);
  throw new Error(`Erro Supabase (${operation}): ${error.message || JSON.stringify(error)}`);
}
