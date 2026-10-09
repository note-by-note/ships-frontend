// Client-side mirror of `api/src/util/formValidation.ts`.
//
// This exists for the feedback loop, not for safety: it decides which questions
// are on screen and catches obvious mistakes before a round trip. The server
// runs the same rules again on every submit and its answer is the one that
// counts — nothing here is load-bearing for correctness.

import type { AnswerValue, FormQuestion, FormSection } from './types';

export type AnswerMap = Record<string, AnswerValue>;

export function isBlank(value: AnswerValue): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'boolean') return value === false;
  return false;
}

export function isVisible(question: FormQuestion, answers: AnswerMap): boolean {
  const rule = question.visibleWhen;
  if (!rule?.questionKey) return true;

  const target = answers[rule.questionKey];
  if (!rule.equals.length) return !isBlank(target ?? null);
  if (Array.isArray(target)) return target.some((entry) => rule.equals.includes(entry));
  return rule.equals.includes(String(target ?? ''));
}

export function visibleQuestions(section: FormSection, answers: AnswerMap): FormQuestion[] {
  return section.questions.filter((question) => isVisible(question, answers));
}

/** One question's error, or null. Message wording matches the server's. */
export function validateQuestion(question: FormQuestion, value: AnswerValue): string | null {
  if (question.type === 'statement') return null;

  if (question.type === 'checkbox') {
    return question.required && value !== true ? `${question.label} must be checked` : null;
  }

  if (isBlank(value)) {
    return question.required ? `${question.label} is required` : null;
  }

  switch (question.type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
        ? null
        : `${question.label} must be a valid email address`;

    case 'url':
      return /^https?:\/\/\S+$/i.test(String(value))
        ? null
        : `${question.label} must start with http:// or https://`;

    case 'phone':
      return String(value).replace(/\D/g, '').length >= 7
        ? null
        : `${question.label} must be a valid phone number`;

    case 'number':
    case 'scale': {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return `${question.label} must be a number`;
      if (question.min !== null && parsed < question.min) return `${question.label} must be at least ${question.min}`;
      if (question.max !== null && parsed > question.max) return `${question.label} must be at most ${question.max}`;
      return null;
    }

    case 'multi_select': {
      const list = Array.isArray(value) ? value : [];
      if (question.maxSelections && list.length > question.maxSelections) {
        return `${question.label} allows at most ${question.maxSelections} choices`;
      }
      return null;
    }

    case 'short_text':
    case 'long_text': {
      const text = String(value).trim();
      const max = question.maxLength ?? (question.type === 'long_text' ? 5000 : 500);
      if (question.minLength && text.length < question.minLength) {
        return `${question.label} must be at least ${question.minLength} characters`;
      }
      if (text.length > max) return `${question.label} must be at most ${max} characters`;
      return null;
    }

    default:
      return null;
  }
}

/** Errors for one section, keyed by question. Hidden questions are skipped. */
export function validateSection(section: FormSection, answers: AnswerMap): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of visibleQuestions(section, answers)) {
    const error = validateQuestion(question, answers[question.key] ?? null);
    if (error) errors[question.key] = error;
  }

  return errors;
}

/** How complete a section looks, for the progress rail. */
export function sectionProgress(section: FormSection, answers: AnswerMap) {
  const questions = visibleQuestions(section, answers).filter((q) => q.type !== 'statement');
  const required = questions.filter((question) => question.required);
  const answered = required.filter((question) => !isBlank(answers[question.key] ?? null));

  return {
    total: questions.length,
    requiredTotal: required.length,
    requiredAnswered: answered.length,
    complete: required.length > 0 && answered.length === required.length,
    touched: questions.some((question) => !isBlank(answers[question.key] ?? null)),
  };
}

/** Wire format: the flat list the API stores. Hidden questions are dropped. */
export function toAnswerList(sections: FormSection[], answers: AnswerMap) {
  const list: { sectionKey: string; questionKey: string; value: AnswerValue }[] = [];

  for (const section of sections) {
    for (const question of visibleQuestions(section, answers)) {
      if (question.type === 'statement') continue;
      const value = answers[question.key];
      if (value === undefined || isBlank(value)) continue;
      list.push({ sectionKey: section.key, questionKey: question.key, value });
    }
  }

  return list;
}

export function fromAnswerList(list: { questionKey: string; value: AnswerValue }[]): AnswerMap {
  return Object.fromEntries(list.map((answer) => [answer.questionKey, answer.value]));
}
