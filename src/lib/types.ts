// Mirrors the shapes returned by the API in `api/src/routes/{forms,applications}.ts`.
// Kept hand-written rather than generated: the surface is small, and a wrong
// field here should fail at the type level rather than at runtime.

export type FormKind = 'mentee' | 'mentor' | 'job';
export type FormStatus = 'draft' | 'published' | 'closed' | 'archived';

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'radio'
  | 'checkbox'
  | 'scale'
  | 'statement';

export type OptionPreset =
  | 'instruments'
  | 'experience_levels'
  | 'age_groups'
  | 'languages'
  | 'availability_days'
  | 'availability_times'
  | 'formats'
  | 'weekdays'
  | 'genres';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface VisibilityRule {
  questionKey: string;
  equals: string[];
}

export interface FormQuestion {
  key: string;
  type: QuestionType;
  label: string;
  help: string;
  placeholder: string;
  required: boolean;
  minLength: number | null;
  maxLength: number | null;
  min: number | null;
  max: number | null;
  maxSelections: number | null;
  optionsPreset: OptionPreset | null;
  options: QuestionOption[];
  visibleWhen: VisibilityRule | null;
}

export interface FormSection {
  key: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

export interface ApplicationForm {
  id: string;
  slug: string;
  title: string;
  kind: FormKind;
  description: string;
  status: FormStatus;
  version: number;
  accepting: boolean;
  settings: {
    successMessage: string;
    closedMessage: string;
    allowDrafts: boolean;
  };
  opensAt: string | null;
  closesAt: string | null;
  sections: FormSection[];
}

export interface FormListing {
  id: string;
  slug: string;
  title: string;
  kind: FormKind;
  status: FormStatus;
  version: number;
  accepting: boolean;
  sectionCount: number;
  questionCount: number;
  submissionCount: number;
  updatedAt: string;
}

export interface OpenForm {
  slug: string;
  title: string;
  kind: FormKind;
  description: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'
  | 'withdrawn';

/** A value is whatever the question's type produces; see the API's validator. */
export type AnswerValue = string | string[] | number | boolean | null;

export interface Answer {
  sectionKey: string;
  questionKey: string;
  value: AnswerValue;
}

export interface Application {
  id: string;
  formSlug: string;
  formKind: FormKind;
  formVersion: number;
  status: ApplicationStatus;
  answers: Answer[];
  lastSectionKey: string | null;
  submittedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

/** The frozen copy of the form an application was answering. */
export interface FormSnapshot {
  title: string;
  kind: FormKind;
  version: number;
  sections: {
    key: string;
    title: string;
    description: string;
    questions: {
      key: string;
      type: QuestionType;
      label: string;
      help: string;
      required: boolean;
      options: QuestionOption[];
    }[];
  }[];
}

export interface ReviewNote {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface ApplicationDetail extends Application {
  applicant: string | null;
  applicantName: string;
  applicantEmail: string;
  formSnapshot: FormSnapshot | null;
  decision: {
    status: string | null;
    decidedAt: string | null;
    decidedBy: string | null;
    reason: string;
  };
  notes: ReviewNote[];
}

export interface ApplicationListing {
  id: string;
  formSlug: string;
  formKind: FormKind;
  status: ApplicationStatus;
  applicantName: string;
  applicantEmail: string;
  submittedAt: string | null;
  updatedAt: string;
  noteCount: number;
}

export type UserRole = 'student' | 'mentor' | 'admin';

export interface AccountUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Paged<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasMore: boolean;
    statusCounts?: Record<string, number>;
  };
}
