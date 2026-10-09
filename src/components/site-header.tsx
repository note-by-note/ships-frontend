'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Button, ButtonLink, cx } from './ui';

const LINKS = [
  { href: '/find-a-mentor', label: 'Find a mentor' },
  { href: '/apply', label: 'Apply' },
  { href: '/applications', label: 'My applications', signedIn: true },
];

const ADMIN_LINKS = [
  { href: '/admin/applications', label: 'Review' },
  { href: '/admin/forms', label: 'Forms' },
];

export function SiteHeader() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    ...LINKS.filter((link) => !link.signedIn || user),
    ...(user?.role === 'admin' ? ADMIN_LINKS : []),
  ];

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="font-semibold tracking-tight text-ink">
          Note by Note
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'rounded-lg px-3 py-1.5 text-sm transition-colors',
                  active ? 'bg-accent-soft font-medium text-accent' : 'text-ink-soft hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <span className="hidden text-sm text-ink-soft sm:inline">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/apply" size="sm">
                Apply
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
