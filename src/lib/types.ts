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
  | 'mentor_instruments'
  | 'partner_schools'
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
  /** Student applications: the mentor the student asked to learn with. */
  requestedMentor: { id: string; name: string; slug: string } | null;
  /** True once staff accepted the application and the request went to that mentor. */
  mentorRequestSent: boolean;
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
  isTest?: boolean;
  requestedMentorName?: string | null;
}

export type StaffRole = 'admin' | 'tech' | 'outreach' | 'marketing';
export type UserRole = 'student' | 'mentor' | StaffRole;

/** Mirrors `ships-api/src/util/permissions.ts`. */
export type Permission =
  | 'roles.manage'
  | 'users.view'
  | 'users.manage'
  | 'mentors.view'
  | 'mentors.manage'
  | 'forms.manage'
  | 'applications.review'
  | 'stats.view'
  | 'testing.use'
  | 'messages.review'
  | 'resources.manage'
  | 'hours.approve'
  | 'team.manage';

export const STAFF_ROLES: StaffRole[] = ['admin', 'tech', 'outreach', 'marketing'];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  mentor: 'Mentor',
  admin: 'Admin',
  tech: 'Tech',
  outreach: 'Outreach',
  marketing: 'Marketing',
};

export interface AccountUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  isStaff: boolean;
  permissions: Permission[];
  isTest: boolean;
  mentorProfile?: { id: string; name: string; slug: string } | null;
}

export interface DirectoryUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  isTest?: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  mentorProfile: { id: string; name: string; slug: string } | null;
}

export interface MentorProfile {
  id: string;
  name: string;
  slug: string;
  pronouns?: string;
  location?: string;
  timeZone?: string;
  instruments: string[];
  languages: string[];
  experienceLevels: string[];
  ageGroups: string[];
  formats: string[];
  availability: { days: string[]; times: string[] };
  genres: string[];
  experienceHeadline?: string;
  yearsTeaching?: number;
  shortBio?: string;
  teachingPhilosophy?: string;
  about?: string;
  whatToExpect?: string[];
  pageTheme?: PageTheme;
  photoPath?: string | null;
  pendingPhoto?: boolean;
  photoDeclinedReason?: string | null;
  favoriteMusic?: string;
  sampleUrl?: string;
  responseTime?: string;
  acceptingStudents: boolean;
  published: boolean;
  verified: boolean;
  isTest?: boolean;
  screening?: { backgroundCheckCleared?: boolean; childSafetyCertified?: boolean; note?: string };
  account?: { id: string; name: string; email: string } | null;
}

export type PageTheme = 'sky' | 'gold' | 'sage' | 'coral' | 'mist';

export interface MentorReview {
  id: string;
  authorName: string;
  authorRole?: string;
  rating: number;
  body: string;
}

/** `GET /mentors/:slug`: the public page. Open times only, never booked ones. */
export interface PublicMentor extends Omit<MentorProfile, 'account'> {
  openSchedule: ScheduleDay[];
  reviews: MentorReview[];
}

export interface MentorListing {
  id: string;
  name: string;
  slug: string;
  instruments: string[];
  published: boolean;
  verified: boolean;
  acceptingStudents: boolean;
  backgroundCheckCleared: boolean;
  isTest: boolean;
  account: { id: string; name: string; email: string } | null;
  updatedAt: string;
}

export interface MatchRequest {
  id: string;
  /** Set when it came from an accepted student application. */
  application?: string | null;
  /** Set when staff suggested this match from the Matching page. */
  matchedBy?: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  instrument: string;
  format?: string;
  preferredDays?: string[];
  preferredTimes?: string[];
  timeZone?: string;
  message?: string;
  requester?: { name: string; email: string; phone?: string };
  student?: { firstName?: string; ageGroup?: string; experienceLevel?: string };
  createdAt: string;
  respondedAt?: string | null;
}

export interface OwnMatchRequest {
  id: string;
  status: MatchRequest['status'];
  instrument: string;
  createdAt: string;
  respondedAt: string | null;
  mentor: { id: string; name: string; slug: string } | null;
}

export interface TestAccount {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor';
  mentorProfile: { id: string; name: string; slug: string } | null;
  applicationCount: number;
  matchRequestCount: number;
  createdAt: string;
}

export interface Options {
  instruments: string[];
  languages: string[];
  experienceLevels: string[];
  ageGroups: string[];
  formats: string[];
  availabilityDays: string[];
  availabilityTimes: string[];
  genres: string[];
  pageThemes?: PageTheme[];
}

export interface StaffOverview {
  applications: { byStatus: Record<string, number>; byKind: Record<string, number> };
  openForms: number;
  mentors: { total: number; published: number; accepting: number };
  accounts: Record<string, number>;
  matchRequests: Record<string, number>;
  /** Whether the API has SMTP settings, i.e. absence emails actually go out. */
  emailConfigured: boolean;
  /** What's waiting for staff: photos to approve, hours to approve, reported messages. */
  waiting?: { photos: number; hours: number; reports: number; toMatch?: number };
  /** Sent student applications per school picked on the form. */
  studentsBySchool?: { school: string; count: number }[];
}

/** Someone under "Meet the team" on the About page. */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  about: string;
  /** Their picture, relative to the API root (use apiUrl), or null for initials. */
  photoPath: string | null;
  order: number;
}

// --- Matching (staff) ---------------------------------------------------------------

export interface MatchingStudent {
  applicationId: string;
  name: string;
  instrument: string | null;
  experienceLevel: string | null;
  ageGroup: string | null;
  availability: string[];
  languages: string[];
  school: string;
  goals: string;
  acceptedAt: string;
  isTest: boolean;
}

export interface MentorSuggestion {
  mentorId: string;
  name: string;
  slug: string;
  reasons: string[];
}

export interface MatchingBoard {
  needsMentor: (MatchingStudent & { declined: string[]; suggestions: MentorSuggestion[] })[];
  waiting: (MatchingStudent & { requestId: string; mentor: string; since: string; byStaff: boolean })[];
}

export interface PartnerSchool {
  id: string;
  name: string;
  active: boolean;
}

// --- Photos ------------------------------------------------------------------------------

export interface PhotoState {
  /** The approved photo, relative to the API root (use apiUrl), or null. */
  photoPath: string | null;
  pendingPhoto: boolean;
  photoDeclinedReason: string | null;
}

export interface PendingPhoto {
  mentorId: string;
  name: string;
  slug: string;
  isTest: boolean;
  uploadedAt: string | null;
  replacesPhoto: boolean;
}

// --- Messages ----------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  senderSide: 'mentor' | 'student';
  mine: boolean;
  body: string;
  createdAt: string;
  readAt: string | null;
  reported: boolean;
  report?: { reason: string; at: string; resolvedAt: string | null } | null;
}

export interface Conversation {
  pairingId: string;
  side: 'mentor' | 'student';
  instrument: string;
  with: string;
  withPhotoPath: string | null;
  lastMessage: ChatMessage | null;
  unread: number;
}

export interface ConversationThread {
  pairingId: string;
  side: 'mentor' | 'student';
  with: string;
  withPhotoPath: string | null;
  messages: ChatMessage[];
  hasMore: boolean;
}

export interface ReviewedConversation {
  pairingId: string;
  mentor: string;
  student: string;
  instrument: string;
  messages: number;
  lastMessageAt: string;
  openReports: number;
}

// --- Resources ---------------------------------------------------------------------------

export interface SharedResource {
  id: string;
  title: string;
  note: string;
  kind: 'file' | 'link';
  url: string | null;
  file: { name: string; size: number; contentType: string } | null;
  scope: 'pairing' | 'team';
  createdBy: string;
  mine: boolean;
  canDelete: boolean;
  sharedWith: { pairingId: string; mentor: string; student: string }[];
  createdAt: string;
}

// --- Lesson notes ------------------------------------------------------------------------

export interface LessonNote {
  id: string;
  date: string;
  summary: string;
  practice: { id: string; text: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
}

// --- Volunteer hours ---------------------------------------------------------------------

export type HoursStatus = 'pending' | 'approved' | 'declined';

export interface HoursEntry {
  id: string;
  userName: string;
  date: string;
  minutes: number;
  activity: string;
  description: string;
  status: HoursStatus;
  reviewerName: string | null;
  reviewedAt: string | null;
  reviewNote: string;
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

// --- Lessons (see ships-api/src/routes/lessons.ts) ---------------------------------

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface LessonRules {
  windows: Record<Weekday, { start: string; end: string }>;
  blockMinutes: number;
  durations: number[];
}

export interface ScheduleDay {
  day: Weekday;
  slots: string[];
}

export interface LessonSlot {
  id: string;
  day: Weekday;
  start: string;
  durationMinutes: number;
  timeZone: string;
  status: 'proposed' | 'confirmed' | 'declined' | 'replaced' | 'withdrawn';
  proposedBy: 'mentor' | 'student';
  note: string;
  createdAt: string;
}

export interface AbsenceNotice {
  id: string;
  date: string;
  reporterSide: 'mentor' | 'student';
  message: string;
  acknowledgedAt: string | null;
  createdAt?: string;
}

export interface Pairing {
  id: string;
  side: 'mentor' | 'student';
  instrument: string;
  mentor: { id: string; name: string };
  student: { id: string; name: string };
  studentContact: { name?: string; email?: string } | null;
  timeZone: string;
  schedule: ScheduleDay[];
  busy: { day: Weekday; start: string; durationMinutes: number }[];
  lesson: LessonSlot | null;
  proposal: LessonSlot | null;
  absences: AbsenceNotice[];
  /** The video call link the mentor set, or null. */
  meetingUrl: string | null;
}
