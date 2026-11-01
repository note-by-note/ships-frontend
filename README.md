# Note by Note — website

The website people see at notebynote.ca: Next.js 16 (App Router) and
Tailwind v4. Everything it shows comes from the API in `../ships-api`.

## Getting started

```bash
cd ships-frontend
npm install
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at the API
npm run dev                    # http://localhost:3000
```

The API must be running too (see `ships-api/README.md`), and its `CORS_ORIGIN`
has to include `http://localhost:3000`, or the browser refuses every request.

## Where do I change...?

| I want to change... | Look in |
| --- | --- |
| The words on a public page (home, FAQ, About, ...) | `src/app/(public)/<page name>/page.tsx` (the home page is `src/app/(public)/page.tsx`) |
| The contact email, Formspree form or Google Analytics ID | `src/lib/site.ts` |
| The Code of Conduct, Terms, Privacy Policy or parent consent text | `src/content/policies/en.tsx`, then the same change in `es.tsx`, `fr.tsx` and `zh.tsx` |
| The site header or footer | `src/components/layout/site-header.tsx`, `site-footer.tsx` |
| The sidebar links in the dashboards | `src/components/layout/member-shell.tsx` (students and mentors), `staff-shell.tsx` (staff) |
| A dashboard page | `src/app/dashboard/<page name>/page.tsx` |
| A staff area page | `src/app/admin/<page name>/page.tsx` |
| Colours and fonts | `src/app/globals.css` |
| Buttons, form fields, badges used everywhere | `src/components/ui/` |

Every file starts with a comment saying what it's for. When you're not sure
where something is, search the project for words you can see on the page.

## Layout

```
src/
  app/                        one folder per web address; page.tsx is the page
    layout.tsx                around every page: header, footer, sign-in
    globals.css               colours, fonts and other site-wide styles
    (public)/                 the public site: home, about, contact, faq,
                              find-a-mentor, for-mentors, how-it-works,
                              instruments, partners
    (policies)/               code-of-conduct, terms, privacy, parent-consent;
                              each has [lang]/ for its translations
    (account)/                login, register
    (applications)/           apply (the forms) and applications (your own)
    dashboard/                students and mentors, once signed in
    admin/                    the staff area
  components/                 the pieces pages are built from
    layout/                   header, footer, dashboard and staff frames,
                              the staff-only guard, analytics
    account/                  signing in and up, who's signed in
    public/                   public page building blocks, Find a Mentor,
                              mentor pages, instruments, contact form
    applications/             applying, reviewing applications, the form editor
    dashboard/                dashboard panels, lesson notes, hours,
                              resources, editing a mentor page
    messages/                 messages, team messages, announcements
    policies/                 the policy page layout, accepting the Code of
                              Conduct, parent consent, "Report a concern"
    ui/                       buttons, fields, badges, avatars
  content/policies/           the policy text in each language
  lib/
    site.ts                   contact details and other site-wide settings
    api.ts                    talking to the API, staying signed in
    types.ts                  the shapes of what the API sends
    form-logic.ts             application form rules (the API checks them too)
    policy-languages.ts       the languages the policies come in
    schedule.ts               lesson time helpers
    images.ts                 shrinking images in the browser before upload
```

Folder names in brackets, like `(public)`, are only for sorting. They don't
appear in the web address: `src/app/(public)/faq/page.tsx` is `/faq`.

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
