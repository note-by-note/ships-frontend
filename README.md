# Note by Note — web

Next.js 16 (App Router, Tailwind v4) front end for the Note by Note application
system. It talks to the Express API in [`../../api`](../../api).

## Getting started

```bash
cd frontend/main
npm install
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at the API
npm run dev                    # http://localhost:3000
```

The API must be running, seeded and reachable:

```bash
cd ../../api
npm run dev
npm run seed:forms             # the starter mentee / mentor / job intakes
npm run user:create -- --email you@example.com --name "You" --role admin
```

`CORS_ORIGIN` in the API's `.env` has to include `http://localhost:3000`, or the
browser will refuse every request.

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/` | anyone | Landing page |
| `/apply` | anyone | Open applications, grouped by kind |
| `/apply/[slug]` | anyone | The multi-section application itself |
| `/applications` | any user | Your own applications and their status |
| `/login`, `/register` | anyone | Account access |
| `/admin/forms` | admin | Every form; create and duplicate |
| `/admin/forms/[slug]` | admin | The form editor, with a live preview |
| `/admin/applications` | admin | The review queue |
| `/admin/applications/[id]` | admin | One application, decisions and notes |

## Layout

```
src/
  app/
    layout.tsx              providers, header, skip link
    apply/[slug]/           the applicant wizard
    admin/layout.tsx        wraps every admin route in the role guard
    admin/forms/[slug]/     the form editor
    admin/applications/     the review queue and detail
  components/
    application-wizard.tsx  sections, progress, autosave, review, submit
    account-step.tsx        register-or-sign-in, inline in the wizard
    question-input.tsx      one question definition → the right control
    form-editor.tsx         sections, questions, options, conditions, preview
    review-queue.tsx        filters, search, pagination
    application-review.tsx  answers read against the stored snapshot
    admin-guard.tsx         client-side role gate (convenience, not security)
    auth-provider.tsx       session context
    ui/                     buttons, cards, fields, badges
  lib/
    api.ts                  fetch wrapper, token storage, refresh handling
    form-logic.ts           visibility + validation, mirroring the server
    types.ts                the API's shapes
```

## How the application page works

Nothing about the steps is hardcoded. The wizard fetches the published form and
builds its steps from whatever sections it finds:

```
[ account ] → [ section 1 ] → [ section 2 ] → … → [ review and send ]
```

The account step only appears when nobody is signed in, and it is **inline**
rather than a redirect: an applicant bounced to a sign-in page mid-form has no
reason to believe their answers will survive the trip.

Steps are addressed by a stable key rather than an index, because signing in
removes a step and an index would then point at the wrong section.

Once there is an account, answers autosave (debounced) to a draft. A failed
autosave is reported quietly rather than interrupting typing — the submit sends
the full set of answers regardless.

Client-side validation exists for the feedback loop only. The server re-checks
everything, and a 422 from it maps back onto the individual questions and jumps
the applicant to the first section that has a problem.

## The form editor

The whole definition is edited locally and saved in one `PATCH`, so a
half-finished question — a choice type with no options yet — is never sent to
the server to be rejected mid-edit.

**Answer keys are fixed.** Once an application exists, its answers point at
question keys, so the editor generates a key from the label at creation time and
then leaves it alone. Renaming a question's *label* is safe and expected;
the key underneath is what keeps past answers attached.

The editor only offers a conditional rule pointing at a choice question that
appears **before** the one being edited — the same constraint the API enforces.

"Preview" renders the definition through the exact controls the applicant will
see, including conditional logic, without saving anything.

## Reusing the system

Student intake, mentor intake and job postings are the same engine with
different questions. "Duplicate" on `/admin/forms` copies a form as a new draft,
which is how a new job posting starts from the last one rather than from a blank
page. Duplicating never touches the original or its applications.

## A note on tokens

The access token is held in memory; the refresh token is in `localStorage` so a
reload does not sign you out. That trades some XSS resistance for not running a
session backend inside Next.

If that trade stops being acceptable, the upgrade is to proxy the API through
Next route handlers and keep the refresh token in an `httpOnly` cookie. Nothing
above `lib/api.ts` would have to change.

Refresh tokens rotate, so concurrent 401s must not each spend the same token —
the client shares one in-flight refresh promise. Without it, the API would
correctly read the parallel replays as token theft and revoke the whole session
family.
