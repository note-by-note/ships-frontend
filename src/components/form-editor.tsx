'use client';

// The form editor: sections, questions and their rules, all editable at runtime.
//
// The whole definition is edited locally and saved in one PATCH. That keeps a
// half-finished question — a choice type with no options yet — from being sent
// to the server and rejected mid-edit, and it makes "discard" trivial.

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import type {
  ApplicationForm,
  FormQuestion,
  FormSection,
  FormStatus,
  OptionPreset,
  QuestionType,
} from '@/lib/types';
import { QuestionInput } from './question-input';
import { Alert, Badge, Button, Card, PageHeader, Spinner, StatusBadge, cx, humanize } from './ui';
import { Field, Select, TextArea, TextInput } from './ui/fields';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'short_text', label: 'Short text' },
  { value: 'long_text', label: 'Long text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'Link' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Single choice' },
  { value: 'multi_select', label: 'Multiple choice' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'scale', label: 'Scale' },
  { value: 'statement', label: 'Statement (no answer)' },
];

const PRESETS: { value: OptionPreset | ''; label: string }[] = [
  { value: '', label: 'Custom options' },
  { value: 'instruments', label: 'Instruments' },
  { value: 'experience_levels', label: 'Experience levels' },
  { value: 'age_groups', label: 'Age groups' },
  { value: 'languages', label: 'Languages' },
  { value: 'availability_days', label: 'Availability — days' },
  { value: 'availability_times', label: 'Availability — times' },
  { value: 'formats', label: 'Lesson formats' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'genres', label: 'Genres' },
];

const CHOICE_TYPES: QuestionType[] = ['select', 'radio', 'multi_select'];
const TEXT_TYPES: QuestionType[] = ['short_text', 'long_text'];
const RANGE_TYPES: QuestionType[] = ['number', 'scale'];

function keyFromLabel(label: string, taken: Set<string>): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50) || 'question';

  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}_${suffix}`)) suffix += 1;
  return `${base}_${suffix}`;
}

function blankQuestion(taken: Set<string>): FormQuestion {
  return {
    key: keyFromLabel('question', taken),
    type: 'short_text',
    label: '',
    help: '',
    placeholder: '',
    required: false,
    minLength: null,
    maxLength: null,
    min: null,
    max: null,
    maxSelections: null,
    optionsPreset: null,
    options: [],
    visibleWhen: null,
  };
}

export function FormEditor({ slug }: { slug: string }) {
  const [form, setForm] = useState<ApplicationForm | null>(null);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: ApplicationForm }>(`/forms/${encodeURIComponent(slug)}`)
      .then((body) => {
        setForm(body.data);
        setSections(body.data.sections);
        setTitle(body.data.title);
        setDescription(body.data.description);
        setSuccessMessage(body.data.settings.successMessage);
        setOpensAt(toLocalInput(body.data.opensAt));
        setClosesAt(toLocalInput(body.data.closesAt));
        setOpenSection(body.data.sections[0]?.key ?? null);
      })
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : 'We could not load this form.'),
      )
      .finally(() => setLoading(false));
  }, [slug]);

  const takenKeys = useMemo(
    () => new Set(sections.flatMap((section) => section.questions.map((question) => question.key))),
    [sections],
  );

  const markDirty = useCallback(() => setSaved(false), []);

  const updateSection = useCallback(
    (index: number, patch: Partial<FormSection>) => {
      markDirty();
      setSections((current) =>
        current.map((section, i) => (i === index ? { ...section, ...patch } : section)),
      );
    },
    [markDirty],
  );

  const updateQuestion = useCallback(
    (sectionIndex: number, questionIndex: number, patch: Partial<FormQuestion>) => {
      markDirty();
      setSections((current) =>
        current.map((section, i) =>
          i !== sectionIndex
            ? section
            : {
                ...section,
                questions: section.questions.map((question, q) =>
                  q === questionIndex ? { ...question, ...patch } : question,
                ),
              },
        ),
      );
    },
    [markDirty],
  );

  function move<T>(list: T[], from: number, to: number): T[] {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }

  async function save(nextStatus?: FormStatus) {
    if (!form) return;
    setSaving(true);
    setError(null);

    try {
      const body = await api.patch<{ data: ApplicationForm }>(`/forms/${form.slug}`, {
        title,
        description,
        sections,
        settings: { ...form.settings, successMessage },
        opensAt: opensAt ? new Date(opensAt).toISOString() : null,
        closesAt: closesAt ? new Date(closesAt).toISOString() : null,
        ...(nextStatus ? { status: nextStatus } : {}),
      });
      setForm(body.data);
      setSections(body.data.sections);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not save this form.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading the form" />;
  if (!form) return <Alert>{error ?? 'Form not found.'}</Alert>;

  const questionCount = sections.reduce((sum, section) => sum + section.questions.length, 0);

  return (
    <>
      <Link
        href="/admin/forms"
        className="mb-6 inline-block text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
      >
        ← All forms
      </Link>

      <PageHeader
        title={title || 'Untitled form'}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={form.status} />
            <Badge>{humanize(form.kind)}</Badge>
            <Badge>v{form.version}</Badge>
            <span className="text-ink-faint">/apply/{form.slug}</span>
          </span>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setPreview((current) => !current)}>
              {preview ? 'Back to editing' : 'Preview'}
            </Button>
            <Button onClick={() => save()} disabled={saving}>
              {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
            </Button>
          </>
        }
      />

      {error ? (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {form.status !== 'draft' ? (
        <div className="mb-6">
          <Alert tone="warn">
            This form is live. Changing its questions bumps it to v{form.version + 1} — applications
            already submitted keep the questions they were asked, so past reviews stay accurate.
          </Alert>
        </div>
      ) : null}

      {preview ? (
        <FormPreview sections={sections} title={title} description={description} />
      ) : (
        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-ink">Basics</h2>

            <Field label="Title" required>
              {({ id }) => (
                <TextInput
                  id={id}
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    markDirty();
                  }}
                />
              )}
            </Field>

            <Field label="Introduction" help="Shown above the first section.">
              {({ id, describedBy }) => (
                <TextArea
                  id={id}
                  rows={3}
                  aria-describedby={describedBy}
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    markDirty();
                  }}
                />
              )}
            </Field>

            <Field label="Confirmation message" help="Shown after a successful submission.">
              {({ id, describedBy }) => (
                <TextArea
                  id={id}
                  rows={2}
                  aria-describedby={describedBy}
                  value={successMessage}
                  onChange={(event) => {
                    setSuccessMessage(event.target.value);
                    markDirty();
                  }}
                />
              )}
            </Field>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="font-medium text-ink">
              Sections{' '}
              <span className="font-normal text-ink-faint">
                ({sections.length}, {questionCount} {questionCount === 1 ? 'question' : 'questions'})
              </span>
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                markDirty();
                const key = keyFromLabel(`section_${sections.length + 1}`, new Set(sections.map((s) => s.key)));
                setSections((current) => [
                  ...current,
                  { key, title: 'New section', description: '', questions: [] },
                ]);
                setOpenSection(key);
              }}
            >
              Add section
            </Button>
          </div>

          {sections.map((section, sectionIndex) => (
            <SectionEditor
              key={section.key}
              section={section}
              index={sectionIndex}
              total={sections.length}
              open={openSection === section.key}
              onToggle={() => setOpenSection(openSection === section.key ? null : section.key)}
              earlierQuestions={sections
                .slice(0, sectionIndex + 1)
                .flatMap((entry, i) =>
                  (i === sectionIndex ? entry.questions : entry.questions).map((question) => question),
                )}
              onChange={(patch) => updateSection(sectionIndex, patch)}
              onMove={(direction) => {
                markDirty();
                setSections((current) => move(current, sectionIndex, sectionIndex + direction));
              }}
              onRemove={() => {
                markDirty();
                setSections((current) => current.filter((_, i) => i !== sectionIndex));
              }}
              onAddQuestion={() => {
                markDirty();
                updateSection(sectionIndex, {
                  questions: [...section.questions, blankQuestion(takenKeys)],
                });
              }}
              onQuestionChange={(questionIndex, patch) =>
                updateQuestion(sectionIndex, questionIndex, patch)
              }
              onQuestionMove={(questionIndex, direction) => {
                markDirty();
                updateSection(sectionIndex, {
                  questions: move(section.questions, questionIndex, questionIndex + direction),
                });
              }}
              onQuestionRemove={(questionIndex) => {
                markDirty();
                updateSection(sectionIndex, {
                  questions: section.questions.filter((_, i) => i !== questionIndex),
                });
              }}
            />
          ))}

          <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h2 className="font-medium text-ink">Status</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {form.status === 'published' && !form.accepting
                  ? 'Published, but outside its open and close dates, so not taking applications right now.'
                  : form.status === 'published'
                  ? 'Live and accepting applications.'
                  : form.status === 'draft'
                    ? 'Only admins can see this. Publish when you are ready.'
                    : 'Visible but not accepting new applications.'}
              </p>
            </div>

            <div className="flex gap-2">
              {form.status !== 'published' ? (
                <Button onClick={() => save('published')} disabled={saving || questionCount === 0}>
                  Publish
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => save('closed')} disabled={saving}>
                  Close applications
                </Button>
              )}
              {form.status === 'closed' ? (
                <Button variant="secondary" onClick={() => save('archived')} disabled={saving}>
                  Archive
                </Button>
              ) : null}
            </div>

            <div className="grid w-full gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <Field label="Opens" help="Before this, the form shows its “not open” message.">
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="datetime-local"
                    value={opensAt}
                    onChange={(e) => {
                      markDirty();
                      setOpensAt(e.target.value);
                    }}
                  />
                )}
              </Field>
              <Field label="Closes" help="Applications stop automatically at this time.">
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="datetime-local"
                    value={closesAt}
                    onChange={(e) => {
                      markDirty();
                      setClosesAt(e.target.value);
                    }}
                  />
                )}
              </Field>
              <p className="text-xs text-ink-faint sm:col-span-2">
                Dates only apply while the form is published. Click Save to keep date changes.
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function SectionEditor({
  section,
  index,
  total,
  open,
  onToggle,
  earlierQuestions,
  onChange,
  onMove,
  onRemove,
  onAddQuestion,
  onQuestionChange,
  onQuestionMove,
  onQuestionRemove,
}: {
  section: FormSection;
  index: number;
  total: number;
  open: boolean;
  onToggle: () => void;
  earlierQuestions: FormQuestion[];
  onChange: (patch: Partial<FormSection>) => void;
  onMove: (direction: number) => void;
  onRemove: () => void;
  onAddQuestion: () => void;
  onQuestionChange: (index: number, patch: Partial<FormQuestion>) => void;
  onQuestionMove: (index: number, direction: number) => void;
  onQuestionRemove: (index: number) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-paper px-5 py-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span aria-hidden className="text-ink-faint">
            {open ? '▾' : '▸'}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{section.title || 'Untitled section'}</span>
            <span className="text-xs text-ink-faint">
              {section.questions.length} {section.questions.length === 1 ? 'question' : 'questions'} ·{' '}
              {section.key}
            </span>
          </span>
        </button>

        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move section up">
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Move section down"
          >
            ↓
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove section">
            Remove
          </Button>
        </div>
      </header>

      {open ? (
        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section title" required>
              {({ id }) => (
                <TextInput id={id} value={section.title} onChange={(e) => onChange({ title: e.target.value })} />
              )}
            </Field>
            <Field label="Description" help="Optional context shown under the title.">
              {({ id, describedBy }) => (
                <TextInput
                  id={id}
                  aria-describedby={describedBy}
                  value={section.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                />
              )}
            </Field>
          </div>

          <div className="space-y-3">
            {section.questions.map((question, questionIndex) => (
              <QuestionEditor
                key={question.key}
                question={question}
                index={questionIndex}
                total={section.questions.length}
                earlierQuestions={earlierQuestions.slice(
                  0,
                  earlierQuestions.findIndex((entry) => entry.key === question.key),
                )}
                onChange={(patch) => onQuestionChange(questionIndex, patch)}
                onMove={(direction) => onQuestionMove(questionIndex, direction)}
                onRemove={() => onQuestionRemove(questionIndex)}
              />
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={onAddQuestion}>
            Add question
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function QuestionEditor({
  question,
  index,
  total,
  earlierQuestions,
  onChange,
  onMove,
  onRemove,
}: {
  question: FormQuestion;
  index: number;
  total: number;
  earlierQuestions: FormQuestion[];
  onChange: (patch: Partial<FormQuestion>) => void;
  onMove: (direction: number) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(!question.label);
  const isChoice = CHOICE_TYPES.includes(question.type);
  const isText = TEXT_TYPES.includes(question.type);
  const isRange = RANGE_TYPES.includes(question.type);

  // Only questions before this one may gate it — the same rule the API enforces.
  const conditionCandidates = earlierQuestions.filter((entry) => CHOICE_TYPES.includes(entry.type));

  return (
    <div className={cx('rounded-lg border', expanded ? 'border-accent/40 bg-accent-soft/30' : 'border-line')}>
      <header className="flex flex-wrap items-center gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block truncate text-sm font-medium text-ink">
            {question.label || <span className="text-ink-faint italic">Untitled question</span>}
          </span>
          <span className="text-xs text-ink-faint">
            {QUESTION_TYPES.find((entry) => entry.value === question.type)?.label}
            {question.required ? ' · required' : ''}
            {question.visibleWhen ? ' · conditional' : ''}
          </span>
        </button>

        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up">
            ↑
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Move down">
            ↓
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove question">
            ✕
          </Button>
        </div>
      </header>

      {expanded ? (
        <div className="space-y-4 border-t border-line px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Field label="Question" required>
              {({ id }) => (
                <TextInput id={id} value={question.label} onChange={(e) => onChange({ label: e.target.value })} />
              )}
            </Field>

            <Field label="Type" required>
              {({ id }) => (
                <Select
                  id={id}
                  value={question.type}
                  onChange={(e) => {
                    const type = e.target.value as QuestionType;
                    // Options are meaningless off a choice type; clearing them
                    // keeps a stale list from reappearing on a later switch back.
                    onChange({
                      type,
                      ...(CHOICE_TYPES.includes(type) ? {} : { options: [], optionsPreset: null }),
                    });
                  }}
                >
                  {QUESTION_TYPES.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field label="Help text" help="Shown under the question.">
            {({ id, describedBy }) => (
              <TextInput
                id={id}
                aria-describedby={describedBy}
                value={question.help}
                onChange={(e) => onChange({ help: e.target.value })}
              />
            )}
          </Field>

          {question.type !== 'statement' ? (
            <label className="flex items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onChange({ required: e.target.checked })}
                className="size-4 accent-[var(--color-accent)]"
              />
              Required
            </label>
          ) : null}

          {isChoice ? <OptionsEditor question={question} onChange={onChange} /> : null}

          {isText ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum length">
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="number"
                    min={0}
                    value={question.minLength ?? ''}
                    onChange={(e) => onChange({ minLength: e.target.value ? Number(e.target.value) : null })}
                  />
                )}
              </Field>
              <Field label="Maximum length">
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="number"
                    min={1}
                    value={question.maxLength ?? ''}
                    onChange={(e) => onChange({ maxLength: e.target.value ? Number(e.target.value) : null })}
                  />
                )}
              </Field>
            </div>
          ) : null}

          {isRange ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum">
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="number"
                    value={question.min ?? ''}
                    onChange={(e) => onChange({ min: e.target.value ? Number(e.target.value) : null })}
                  />
                )}
              </Field>
              <Field label="Maximum">
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="number"
                    value={question.max ?? ''}
                    onChange={(e) => onChange({ max: e.target.value ? Number(e.target.value) : null })}
                  />
                )}
              </Field>
            </div>
          ) : null}

          {question.type === 'multi_select' ? (
            <Field label="Maximum selections" help="Leave blank for no limit.">
              {({ id, describedBy }) => (
                <TextInput
                  id={id}
                  type="number"
                  min={1}
                  aria-describedby={describedBy}
                  value={question.maxSelections ?? ''}
                  onChange={(e) => onChange({ maxSelections: e.target.value ? Number(e.target.value) : null })}
                />
              )}
            </Field>
          ) : null}

          <ConditionEditor question={question} candidates={conditionCandidates} onChange={onChange} />

          <p className="text-xs text-ink-faint">
            Answer key: <code className="font-mono">{question.key}</code> — fixed once applications exist,
            so past answers keep pointing at the right question.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function OptionsEditor({
  question,
  onChange,
}: {
  question: FormQuestion;
  onChange: (patch: Partial<FormQuestion>) => void;
}) {
  const preset = question.optionsPreset ?? '';

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <Field label="Options" help="A preset stays in sync with the site's own lists as they change.">
        {({ id, describedBy }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            value={preset}
            onChange={(e) =>
              onChange({
                optionsPreset: (e.target.value || null) as OptionPreset | null,
                ...(e.target.value ? { options: [] } : {}),
              })
            }
          >
            {PRESETS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {preset ? (
        <p className="text-sm text-ink-soft">
          Using the shared <strong>{PRESETS.find((p) => p.value === preset)?.label}</strong> list.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {question.options.map((option, index) => (
              <li key={index} className="flex gap-2">
                <TextInput
                  aria-label={`Option ${index + 1}`}
                  value={option.label}
                  placeholder="Option label"
                  onChange={(e) =>
                    onChange({
                      options: question.options.map((entry, i) =>
                        i === index
                          ? // The stored value follows the label only while the
                            // option is new; an edit after applications exist
                            // would otherwise orphan answers pointing at it.
                            { label: e.target.value, value: entry.value || e.target.value }
                          : entry,
                      ),
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove option ${index + 1}`}
                  onClick={() => onChange({ options: question.options.filter((_, i) => i !== index) })}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange({ options: [...question.options, { value: '', label: '' }] })}
          >
            Add option
          </Button>

          {!question.options.length ? (
            <p className="text-sm text-danger">A choice question needs at least one option.</p>
          ) : null}
        </>
      )}
    </div>
  );
}

function ConditionEditor({
  question,
  candidates,
  onChange,
}: {
  question: FormQuestion;
  candidates: FormQuestion[];
  onChange: (patch: Partial<FormQuestion>) => void;
}) {
  const rule = question.visibleWhen;
  const target = candidates.find((entry) => entry.key === rule?.questionKey);

  if (!candidates.length) {
    return (
      <p className="text-xs text-ink-faint">
        To show this question conditionally, add a choice question before it.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <Field label="Show this question only when…" help="Leave unset to always show it.">
        {({ id, describedBy }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            value={rule?.questionKey ?? ''}
            onChange={(e) =>
              onChange({
                visibleWhen: e.target.value ? { questionKey: e.target.value, equals: [] } : null,
              })
            }
          >
            <option value="">Always show</option>
            {candidates.map((entry) => (
              <option key={entry.key} value={entry.key}>
                {entry.label || entry.key}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {target ? (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">…is one of</legend>
          <div className="flex flex-wrap gap-2">
            {target.options.map((option) => {
              const checked = rule?.equals.includes(option.value) ?? false;
              return (
                <label
                  key={option.value}
                  className={cx(
                    'cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors',
                    checked ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong text-ink-soft',
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) =>
                      onChange({
                        visibleWhen: {
                          questionKey: target.key,
                          equals: e.target.checked
                            ? [...(rule?.equals ?? []), option.value]
                            : (rule?.equals ?? []).filter((entry) => entry !== option.value),
                        },
                      })
                    }
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
          {!rule?.equals.length ? (
            <p className="mt-2 text-xs text-ink-faint">
              With nothing selected, it shows whenever that question has any answer.
            </p>
          ) : null}
        </fieldset>
      ) : null}
    </div>
  );
}

/** Renders the definition through the same controls the applicant will see. */
function FormPreview({
  sections,
  title,
  description,
}: {
  sections: FormSection[];
  title: string;
  description: string;
}) {
  const [answers, setAnswers] = useState<Record<string, never>>({});

  return (
    <div className="space-y-6">
      <Alert tone="accent">
        A preview. Nothing here is saved, and conditional questions react to what you enter.
      </Alert>

      <Card className="p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">{title || 'Untitled form'}</h2>
        {description ? <p className="mt-2 text-ink-soft">{description}</p> : null}

        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <section key={section.key}>
              <h3 className="text-lg font-semibold text-ink">{section.title}</h3>
              {section.description ? <p className="mt-1 text-ink-soft">{section.description}</p> : null}

              <div className="mt-5 space-y-6">
                {section.questions
                  .filter((question) => {
                    const rule = question.visibleWhen;
                    if (!rule?.questionKey) return true;
                    const value = answers[rule.questionKey];
                    if (!rule.equals.length) return Boolean(value);
                    return rule.equals.includes(String(value ?? ''));
                  })
                  .map((question) => (
                    <QuestionInput
                      key={question.key}
                      question={question}
                      value={answers[question.key] ?? null}
                      onChange={(value) =>
                        setAnswers((current) => ({ ...current, [question.key]: value as never }))
                      }
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** ISO timestamp → the value a datetime-local input expects, in local time. */
function toLocalInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
