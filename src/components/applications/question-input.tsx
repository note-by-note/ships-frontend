'use client';

// Renders one admin-defined question as the right control.
//
// This switch is the single place where a question type becomes UI. Adding a
// type means adding a case here, a case in the server validator, and an entry
// in the editor's type list — nowhere else.

import type { AnswerValue, FormQuestion } from '@/lib/types';
import { ChoiceGroup, ChoiceRow, Field, Select, TextArea, TextInput } from './ui/fields';

interface Props {
  question: FormQuestion;
  value: AnswerValue;
  error?: string;
  onChange: (value: AnswerValue) => void;
}

export function QuestionInput({ question, value, error, onChange }: Props) {
  const help = question.help || undefined;

  switch (question.type) {
    case 'statement':
      return (
        <div className="rounded-lg border border-line bg-paper px-4 py-3">
          <p className="text-sm font-medium text-ink">{question.label}</p>
          {help ? <p className="mt-1 text-sm text-ink-soft">{help}</p> : null}
        </div>
      );

    case 'long_text': {
      const text = typeof value === 'string' ? value : '';
      const max = question.maxLength ?? 5000;
      return (
        <Field label={question.label} help={help} error={error} required={question.required}>
          {({ id, describedBy }) => (
            <>
              <TextArea
                id={id}
                aria-describedby={describedBy}
                aria-invalid={error ? true : undefined}
                invalid={Boolean(error)}
                value={text}
                maxLength={max}
                placeholder={question.placeholder || undefined}
                onChange={(event) => onChange(event.target.value)}
              />
              {/* A minimum length is a demand; showing the count makes it answerable. */}
              <p className="text-right text-xs text-ink-faint">
                {question.minLength && text.trim().length < question.minLength
                  ? `${question.minLength - text.trim().length} more characters needed`
                  : `${text.length} / ${max}`}
              </p>
            </>
          )}
        </Field>
      );
    }

    case 'checkbox':
      return (
        <div className="space-y-1.5">
          <ChoiceRow
            type="checkbox"
            checked={value === true}
            onChange={onChange}
            label={question.label}
          />
          {help ? <p className="pl-1 text-sm text-ink-soft">{help}</p> : null}
          {error ? <p className="pl-1 text-sm font-medium text-danger">{error}</p> : null}
        </div>
      );

    case 'radio':
      return (
        <ChoiceGroup label={question.label} help={help} error={error} required={question.required}>
          {question.options.map((option) => (
            <ChoiceRow
              key={option.value}
              type="radio"
              name={question.key}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              label={option.label}
            />
          ))}
        </ChoiceGroup>
      );

    case 'multi_select': {
      const selected = Array.isArray(value) ? value : [];
      const atLimit = question.maxSelections !== null && selected.length >= question.maxSelections;

      return (
        <ChoiceGroup
          label={question.label}
          help={
            question.maxSelections
              ? [help, `Choose up to ${question.maxSelections}.`].filter(Boolean).join(' ')
              : help
          }
          error={error}
          required={question.required}
        >
          <div className="grid gap-1.5 sm:grid-cols-2">
            {question.options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <ChoiceRow
                  key={option.value}
                  type="checkbox"
                  checked={checked}
                  // Silently ignoring a click at the limit reads as a broken
                  // checkbox, so the row is left enabled and the count below
                  // explains why nothing happened.
                  onChange={(next) => {
                    if (next && atLimit && !checked) return;
                    onChange(next ? [...selected, option.value] : selected.filter((entry) => entry !== option.value));
                  }}
                  label={option.label}
                />
              );
            })}
          </div>
          {question.maxSelections ? (
            <p className="text-xs text-ink-faint">
              {selected.length} of {question.maxSelections} selected
            </p>
          ) : null}
        </ChoiceGroup>
      );
    }

    case 'select':
      return (
        <Field label={question.label} help={help} error={error} required={question.required}>
          {({ id, describedBy }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              invalid={Boolean(error)}
              value={typeof value === 'string' ? value : ''}
              onChange={(event) => onChange(event.target.value)}
            >
              <option value="">Choose one…</option>
              {question.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      );

    case 'scale': {
      const min = question.min ?? 0;
      const max = question.max ?? 10;
      const current = typeof value === 'number' ? value : Number(value);

      return (
        <Field label={question.label} help={help} error={error} required={question.required}>
          {({ id, describedBy }) => (
            <div className="flex items-center gap-4">
              <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={1}
                aria-describedby={describedBy}
                value={Number.isFinite(current) ? current : min}
                onChange={(event) => onChange(Number(event.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-[var(--color-accent)]"
              />
              <output
                htmlFor={id}
                className="w-14 shrink-0 rounded-lg border border-line-strong bg-surface py-1 text-center text-sm font-medium tabular-nums"
              >
                {Number.isFinite(current) ? current : '?'}
              </output>
            </div>
          )}
        </Field>
      );
    }

    case 'number':
    case 'date':
    case 'email':
    case 'phone':
    case 'url':
    case 'short_text':
    default: {
      const inputType =
        question.type === 'number'
          ? 'number'
          : question.type === 'date'
            ? 'date'
            : question.type === 'email'
              ? 'email'
              : question.type === 'phone'
                ? 'tel'
                : question.type === 'url'
                  ? 'url'
                  : 'text';

      return (
        <Field label={question.label} help={help} error={error} required={question.required}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              type={inputType}
              inputMode={question.type === 'number' ? 'numeric' : undefined}
              min={question.min ?? undefined}
              max={question.max ?? undefined}
              maxLength={question.type === 'short_text' ? (question.maxLength ?? 500) : undefined}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              invalid={Boolean(error)}
              placeholder={question.placeholder || undefined}
              value={value === null || value === undefined ? '' : String(value)}
              onChange={(event) =>
                onChange(question.type === 'number' ? event.target.value.replace(/[^\d.-]/g, '') : event.target.value)
              }
            />
          )}
        </Field>
      );
    }
  }
}
