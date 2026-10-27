'use client';

// The applicant's multi-section application.
//
// Nothing about the steps is hardcoded: the sections, their order, their
// questions and the rules for each come from the form the admin published. The
// only fixed steps are the account step (authentication is not a question) and
// the final review.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import {
  fromAnswerList,
  sectionProgress,
  toAnswerList,
  validateSection,
  visibleQuestions,
  type AnswerMap,
} from '@/lib/form-logic';
import type { AnswerValue, Application, ApplicationForm } from '@/lib/types';
import { useAuth } from './auth-provider';
import { AccountStep } from './account-step';
import { QuestionInput } from './question-input';
import { Alert, Button, ButtonLink, Card, Spinner, cx } from './ui';

/**
 * Steps carry a stable key rather than being addressed by position. The account
 * step disappears the moment someone signs in, so an index would silently point
 * at the wrong section; a key survives the list changing under it.
 */
type Step =
  | { key: 'account'; kind: 'account' }
  | { key: string; kind: 'section'; index: number }
  | { key: 'review'; kind: 'review' };

const AUTOSAVE_DELAY = 1200;

export function ApplicationWizard({ slug, mentor }: { slug: string; mentor?: string }) {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [form, setForm] = useState<ApplicationForm | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepKey, setStepKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [mentorError, setMentorError] = useState<string | null>(null);
  const [mentorPreview, setMentorPreview] = useState<string | null>(null);

  const headingRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);
  const mentorAppliedRef = useRef(false);

  // --- Load the form ---------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    api
      .get<{ data: ApplicationForm }>(`/forms/${encodeURIComponent(slug)}`)
      .then((body) => {
        if (!cancelled) setForm(body.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError && err.status === 404
            ? 'We could not find that application.'
            : 'We could not load this application. Please try again shortly.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // --- Start or resume, once there is an account -----------------------------

  const startApplication = useCallback(async () => {
    if (!form?.accepting) return;

    try {
      const body = await api.post<{ data: Application }>('/applications', { formSlug: form.slug });
      setApplication(body.data);
      setAnswers(fromAnswerList(body.data.answers));

      // Resume in place. Done here rather than in an effect because this is the
      // one moment the saved position becomes known.
      if (body.data.lastSectionKey) {
        const resumeKey = `section:${body.data.lastSectionKey}`;
        if (form.sections.some((section) => section.key === body.data.lastSectionKey)) {
          setStepKey(resumeKey);
        }
      }

      if (body.data.status === 'withdrawn') {
        // Withdrawn, and the form is closed, so it can't be reopened yet.
        setLoadError('You withdrew this application. It can be reopened once applications are open again.');
      } else if (body.data.status !== 'draft') {
        // Already submitted, from a previous visit. There is nothing to fill in.
        setSubmitted({ message: form.settings.successMessage });
      }
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'We could not start your application.');
    }
  }, [form]);

  useEffect(() => {
    // Starting the application needs both an account and a loaded form, and
    // either can arrive last, so an effect is the right trigger. The lint rule
    // cannot see that every setState inside is behind an await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user && form && !application) void startApplication();
  }, [user, form, application, startApplication]);

  // --- The mentor a student asked for -----------------------------------------

  // Before sign-in there's no application to put the mentor on yet, so show
  // whose name will go on it.
  useEffect(() => {
    if (!mentor || form?.kind !== 'mentee') return;
    api
      .get<{ data: { name: string } }>(`/mentors/${encodeURIComponent(mentor)}`)
      .then((body) => setMentorPreview(body.data.name))
      .catch(() => setMentorPreview(null));
  }, [mentor, form?.kind]);

  const chooseMentor = useCallback(
    async (choice: string | null) => {
      if (!application) return;
      setMentorError(null);
      try {
        const body = await api.patch<{ data: Application }>(`/applications/${application.id}/mentor`, { mentor: choice });
        setApplication(body.data);
      } catch (err) {
        setMentorError(err instanceof ApiError ? err.message : 'We could not update your mentor choice.');
      }
    },
    [application],
  );

  // Arriving from "Apply to learn with…": put that mentor on the application
  // once it exists, then drop the parameter so a reload doesn't redo it.
  useEffect(() => {
    if (!mentor || !application || form?.kind !== 'mentee' || mentorAppliedRef.current) return;
    mentorAppliedRef.current = true;
    router.replace(pathname, { scroll: false });
    // chooseMentor only sets state after its request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (application.requestedMentor?.slug !== mentor && !application.mentorRequestSent) void chooseMentor(mentor);
  }, [mentor, application, form?.kind, chooseMentor, router, pathname]);

  // --- Steps -----------------------------------------------------------------

  const steps = useMemo<Step[]>(() => {
    if (!form) return [];
    const sections: Step[] = form.sections.map((section, index) => ({
      key: `section:${section.key}`,
      kind: 'section',
      index,
    }));
    return user
      ? [...sections, { key: 'review', kind: 'review' }]
      : [{ key: 'account', kind: 'account' }, ...sections, { key: 'review', kind: 'review' }];
  }, [form, user]);

  // Derived, not stored: when the account step falls away the key still names a
  // real step, and an unknown key simply falls back to the beginning.
  const stepIndex = Math.max(0, stepKey ? steps.findIndex((entry) => entry.key === stepKey) : 0);
  const step = steps[stepIndex];

  // --- Autosave --------------------------------------------------------------

  useEffect(() => {
    if (!application || application.status !== 'draft' || !form?.settings.allowDrafts) return;
    if (!dirtyRef.current) return;

    const timer = setTimeout(async () => {
      setSaveState('saving');
      try {
        const currentSection = step?.kind === 'section' ? form.sections[step.index]?.key : undefined;
        await api.patch(`/applications/${application.id}`, {
          answers: toAnswerList(form.sections, answers),
          ...(currentSection ? { lastSectionKey: currentSection } : {}),
        });
        dirtyRef.current = false;
        setSaveState('saved');
      } catch {
        // A failed autosave is not worth interrupting typing over — the submit
        // sends the full set of answers anyway, so nothing is lost unless the
        // tab is closed. The indicator says so quietly.
        setSaveState('error');
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [answers, application, form, step]);

  const setAnswer = useCallback((key: string, value: AnswerValue) => {
    dirtyRef.current = true;
    setSaveState('idle');
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  // --- Navigation ------------------------------------------------------------

  const focusHeading = useCallback(() => {
    // Moving focus to the new step's heading is what makes the wizard usable by
    // keyboard and screen reader; without it focus stays on a button that has
    // just been replaced.
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  function goNext() {
    if (!form || !step) return;

    if (step.kind === 'section') {
      const section = form.sections[step.index];
      const sectionErrors = validateSection(section, answers);
      if (Object.keys(sectionErrors).length) {
        setErrors(sectionErrors);
        focusHeading();
        return;
      }
    }

    const next = steps[Math.min(stepIndex + 1, steps.length - 1)];
    if (next) setStepKey(next.key);
    focusHeading();
  }

  function goBack() {
    const previous = steps[Math.max(0, stepIndex - 1)];
    if (previous) setStepKey(previous.key);
    focusHeading();
  }

  function jumpToSection(index: number) {
    const target = steps.find((entry) => entry.kind === 'section' && entry.index === index);
    if (target) {
      setStepKey(target.key);
      focusHeading();
    }
  }

  async function submit() {
    if (!form || !application) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const body = await api.post<{ data: Application; meta: { successMessage: string } }>(
        `/applications/${application.id}/submit`,
        { answers: toAnswerList(form.sections, answers) },
      );
      setApplication(body.data);
      setSubmitted({ message: body.meta.successMessage || form.settings.successMessage });
      // A mentor applying for lessons now has a student side to their dashboard.
      if (user?.role === 'mentor' && !user.alsoStudent && body.data.formKind === 'mentee') void refreshUser();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        // The server found something the client's copy of the rules missed.
        // Show it against the questions and send the applicant to the first
        // section that has a problem rather than leaving them on the summary.
        const answerErrors = err.answerErrors;
        setErrors(answerErrors);

        const firstKey = Object.keys(answerErrors)[0];
        const sectionIndex = form.sections.findIndex((section) =>
          section.questions.some((question) => question.key === firstKey),
        );
        if (sectionIndex >= 0) jumpToSection(sectionIndex);
        setSubmitError('Some answers need attention before this can be sent.');
      } else {
        setSubmitError(err instanceof ApiError ? err.message : 'We could not send your application.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // --- Render ----------------------------------------------------------------

  if (loading || authLoading) return <Spinner label="Loading the application" />;

  if (loadError || !form) {
    return (
      <Shell>
        <Alert>{loadError ?? 'Application not found.'}</Alert>
        <div className="mt-6">
          <ButtonLink href="/apply" variant="secondary">
            Back to open applications
          </ButtonLink>
        </div>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell>
        <Card className="px-8 py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-ok-soft text-xl text-ok">
            ✓
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-ink">Application received</h1>
          <p className="mx-auto mt-3 max-w-lg text-ink-soft">
            {submitted.message || 'Thank you. A person will read your application and be in touch.'}
          </p>
          {form.kind === 'mentee' ? (
            <div className="mx-auto mt-6 max-w-lg text-left">
              <MentorChoice application={application} preview={mentorPreview} error={mentorError} onClear={() => chooseMentor(null)} />
            </div>
          ) : null}
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/applications" variant="secondary">
              My applications
            </ButtonLink>
            <ButtonLink href="/">Back to home</ButtonLink>
          </div>
        </Card>
      </Shell>
    );
  }

  if (!form.accepting) {
    return (
      <Shell>
        <Card className="px-8 py-12 text-center">
          <h1 className="text-2xl font-semibold text-ink">{form.title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-ink-soft">
            {form.settings.closedMessage || 'This application is not open at the moment.'}
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/apply" variant="secondary">
              See what else is open
            </ButtonLink>
          </div>
        </Card>
      </Shell>
    );
  }

  const sectionSteps = steps.filter((entry) => entry.kind === 'section');
  const currentSectionIndex = step?.kind === 'section' ? step.index : -1;

  return (
    <Shell>
      <div className="mb-8">
        <p className="text-sm font-medium text-accent">{kindLabel(form.kind)}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{form.title}</h1>
        {form.description ? <p className="mt-3 max-w-2xl text-ink-soft">{form.description}</p> : null}
        {form.kind === 'mentee' ? (
          <div className="mt-6 max-w-2xl">
            <MentorChoice application={application} preview={mentorPreview} error={mentorError} onClear={() => chooseMentor(null)} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <ProgressRail
          form={form}
          answers={answers}
          steps={steps}
          stepIndex={stepIndex}
          currentSectionIndex={currentSectionIndex}
          onJump={jumpToSection}
          canJump={Boolean(user)}
        />

        <div className="min-w-0">
          <Card className="p-6 sm:p-8">
            <div ref={headingRef} tabIndex={-1} className="outline-none">
              {step?.kind === 'account' ? (
                <AccountStep onDone={() => focusHeading()} />
              ) : step?.kind === 'review' ? (
                <ReviewStep form={form} answers={answers} onEdit={jumpToSection} />
              ) : step?.kind === 'section' ? (
                <SectionStep
                  form={form}
                  index={step.index}
                  answers={answers}
                  errors={errors}
                  onChange={setAnswer}
                  position={sectionSteps.findIndex((entry) => entry.kind === 'section' && entry.index === step.index) + 1}
                  total={sectionSteps.length}
                />
              ) : null}
            </div>

            {step?.kind !== 'account' ? (
              <>
                {submitError ? (
                  <div className="mt-6">
                    <Alert>{submitError}</Alert>
                  </div>
                ) : null}

                <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                  <Button variant="secondary" onClick={goBack} disabled={stepIndex === 0}>
                    Back
                  </Button>

                  <div className="flex items-center gap-4">
                    <SaveIndicator state={saveState} enabled={form.settings.allowDrafts} />
                    {step?.kind === 'review' ? (
                      <Button size="lg" onClick={submit} disabled={submitting || !application}>
                        {submitting ? 'Sending…' : 'Submit application'}
                      </Button>
                    ) : (
                      <Button size="lg" onClick={goNext}>
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </Card>
        </div>
      </div>
    </Shell>
  );
}

/**
 * Which mentor this student application asks for, if any. Choosing happens on
 * Find a Mentor; this shows the choice and lets the student remove it.
 */
function MentorChoice({
  application,
  preview,
  error,
  onClear,
}: {
  application: Application | null;
  preview: string | null;
  error: string | null;
  onClear: () => void;
}) {
  const chosen = application?.requestedMentor?.name ?? (application ? null : preview);
  const sent = Boolean(application?.mentorRequestSent);
  const decided = application ? ['accepted', 'rejected', 'withdrawn'].includes(application.status) : false;

  if (!chosen) {
    if (decided) return null;
    return (
      <p className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm text-ink-soft">
        Have a mentor in mind?{' '}
        <Link href="/find-a-mentor" className="font-medium text-accent underline underline-offset-2">
          Choose one on Find a Mentor
        </Link>
        . This is optional. If you don’t choose one, we’ll match you.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
      <p className="text-ink">
        {sent ? (
          <>
            Your application went to <strong>{chosen}</strong>. You’ll see their answer on your dashboard.
          </>
        ) : (
          <>
            You’re asking to learn with <strong>{chosen}</strong>. They’ll see your application once our team
            approves it.
          </>
        )}
      </p>
      {!sent && !decided && application ? (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/find-a-mentor" className="font-medium text-accent underline underline-offset-2">
            Choose someone else
          </Link>
          <button type="button" onClick={onClear} className="font-medium text-ink-soft underline underline-offset-2">
            Remove
          </button>
        </p>
      ) : null}
      {error ? <p className="mt-2 text-danger">{error}</p> : null}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-6 py-12">{children}</div>;
}

function kindLabel(kind: string): string {
  return { mentee: 'Student application', mentor: 'Mentor application', job: 'Job application' }[kind] ?? 'Application';
}

function SaveIndicator({ state, enabled }: { state: 'idle' | 'saving' | 'saved' | 'error'; enabled: boolean }) {
  if (!enabled) return null;

  const text = {
    idle: '',
    saving: 'Saving…',
    saved: 'Progress saved',
    error: 'Could not save, but your answers are still here',
  }[state];

  if (!text) return null;

  return (
    <p aria-live="polite" className={cx('text-xs', state === 'error' ? 'text-danger' : 'text-ink-faint')}>
      {text}
    </p>
  );
}

function ProgressRail({
  form,
  answers,
  steps,
  stepIndex,
  currentSectionIndex,
  onJump,
  canJump,
}: {
  form: ApplicationForm;
  answers: AnswerMap;
  steps: Step[];
  stepIndex: number;
  currentSectionIndex: number;
  onJump: (index: number) => void;
  canJump: boolean;
}) {
  const onReview = steps[stepIndex]?.kind === 'review';

  return (
    <nav aria-label="Application sections" className="lg:sticky lg:top-8 lg:self-start">
      <ol className="space-y-1">
        {!canJump ? (
          <li className="flex items-center gap-3 rounded-lg bg-accent-soft px-3 py-2.5 text-sm font-medium text-accent">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs text-white">
              1
            </span>
            Your account
          </li>
        ) : null}

        {form.sections.map((section, index) => {
          const progress = sectionProgress(section, answers);
          const active = index === currentSectionIndex;
          const offset = canJump ? 1 : 2;

          return (
            <li key={section.key}>
              <button
                type="button"
                disabled={!canJump}
                onClick={() => onJump(index)}
                aria-current={active ? 'step' : undefined}
                className={cx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-accent-soft font-medium text-accent'
                    : 'text-ink-soft hover:bg-paper disabled:hover:bg-transparent',
                  !canJump && 'opacity-50',
                )}
              >
                <span
                  className={cx(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs',
                    progress.complete
                      ? 'border-accent bg-accent text-white'
                      : active
                        ? 'border-accent text-accent'
                        : 'border-line-strong text-ink-faint',
                  )}
                >
                  {progress.complete ? '✓' : index + offset}
                </span>
                <span className="min-w-0 flex-1 truncate">{section.title}</span>
              </button>
            </li>
          );
        })}

        <li
          className={cx(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
            onReview ? 'bg-accent-soft font-medium text-accent' : 'text-ink-faint',
          )}
        >
          <span
            className={cx(
              'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs',
              onReview ? 'border-accent text-accent' : 'border-line-strong',
            )}
          >
            {form.sections.length + (canJump ? 1 : 2)}
          </span>
          Review and send
        </li>
      </ol>
    </nav>
  );
}

function SectionStep({
  form,
  index,
  answers,
  errors,
  onChange,
  position,
  total,
}: {
  form: ApplicationForm;
  index: number;
  answers: AnswerMap;
  errors: Record<string, string>;
  onChange: (key: string, value: AnswerValue) => void;
  position: number;
  total: number;
}) {
  const section = form.sections[index];
  const questions = visibleQuestions(section, answers);
  const sectionErrors = questions.filter((question) => errors[question.key]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-faint">
          Section {position} of {total}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-ink">{section.title}</h2>
        {section.description ? <p className="mt-2 text-ink-soft">{section.description}</p> : null}
      </div>

      {sectionErrors.length ? (
        <Alert>
          <p className="font-medium">Please check {sectionErrors.length === 1 ? 'this answer' : 'these answers'}:</p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
            {sectionErrors.map((question) => (
              <li key={question.key}>{errors[question.key]}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <div className="space-y-6">
        {questions.map((question) => (
          <QuestionInput
            key={question.key}
            question={question}
            value={answers[question.key] ?? null}
            error={errors[question.key]}
            onChange={(value) => onChange(question.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewStep({
  form,
  answers,
  onEdit,
}: {
  form: ApplicationForm;
  answers: AnswerMap;
  onEdit: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Review your application</h2>
        <p className="mt-2 text-ink-soft">
          Everything below is what we will read. You can still change any of it. Once you send it,
          you cannot edit it.
        </p>
      </div>

      <div className="space-y-6">
        {form.sections.map((section, index) => {
          const questions = visibleQuestions(section, answers).filter((q) => q.type !== 'statement');

          return (
            <section key={section.key} className="rounded-lg border border-line">
              <header className="flex items-center justify-between gap-4 border-b border-line bg-paper px-4 py-2.5">
                <h3 className="font-medium text-ink">{section.title}</h3>
                <Button variant="ghost" size="sm" onClick={() => onEdit(index)}>
                  Edit
                </Button>
              </header>

              <dl className="divide-y divide-line">
                {questions.map((question) => (
                  <div key={question.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_1.4fr] sm:gap-4">
                    <dt className="text-sm text-ink-soft">{question.label}</dt>
                    <dd className="text-sm text-ink">
                      {formatAnswer(answers[question.key] ?? null, question.options) || (
                        <span className="text-ink-faint">
                          {question.required ? 'Not answered yet' : 'Not answered'}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>

      <p className="text-sm text-ink-soft">
        By sending this you confirm the answers are accurate. See our{' '}
        <Link href="/" className="font-medium text-accent underline underline-offset-2">
          contact page
        </Link>{' '}
        if anything needs correcting after you send.
      </p>
    </div>
  );
}

/** Turn a stored value back into something a person reads, resolving option labels. */
export function formatAnswer(value: AnswerValue, options: { value: string; label: string }[] = []): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  const label = (entry: string) => options.find((option) => option.value === entry)?.label ?? entry;

  if (Array.isArray(value)) return value.map(label).join(', ');
  return label(String(value));
}
