import type { PolicyLanguage } from '@/lib/policy-languages';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { zh } from './zh';
import type { PolicySet } from './types';

export const POLICY_TEXT: Record<PolicyLanguage, PolicySet> = { en, es, fr, zh };
