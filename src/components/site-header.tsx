'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_LINKS, SITE } from '@/lib/site';
import { useAuth } from './auth-provider';
import { Icon } from './marketing';
import { cx } from './ui';

const MEMBER_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/lessons', label: 'Lessons' },
  { href: '/applications', label: 'My applications' },
  { href: '/dashboard/settings', label: 'Settings' },
];

const STAFF_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/applications', label: 'Applications' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const accountLinks = user ? (user.isStaff ? STAFF_LINKS : MEMBER_LINKS) : [];
  // Staff land in the staff area; students and mentors in their dashboard.
  const dashboardHref = user?.isStaff ? '/admin' : '/dashboard';
  const navLinks = user ? [...NAV_LINKS, { href: dashboardHref, label: 'Dashboard' }] : NAV_LINKS;

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-navy text-cream">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 md:px-8">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2 font-display text-xl font-bold">
          <Icon name="music" className="size-5" />
          {SITE.name}
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'font-semibold text-cream after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold'
                    : 'text-cream/70 hover:text-cream',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 xl:ml-0 xl:flex">
          {loading ? null : user ? (
            <AccountMenu name={user.name} links={accountLinks} onSignOut={handleSignOut} />
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-cream/85 hover:text-cream">
                Log in
              </Link>
              <Link href="/apply" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-navy hover:bg-cream">
                Apply
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-full hover:bg-cream/10 xl:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} className="size-6" />
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-menu" className="border-t border-cream/10 xl:hidden">
          <nav aria-label="Main" className="mx-auto flex max-w-7xl flex-col px-5 py-4 md:px-8">
            {[
              { href: '/', label: 'Home' },
              ...(user ? [{ href: dashboardHref, label: 'Dashboard' }] : []),
              ...NAV_LINKS,
              { href: '/faq', label: 'FAQ' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={cx(
                  'rounded-lg px-3 py-3 text-base',
                  pathname === link.href ? 'bg-cream/10 font-semibold' : 'text-cream/80',
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-cream/10 pt-4">
              {loading ? null : user ? (
                <>
                  <p className="px-3 text-sm text-cream/60">Signed in as {user.name}</p>
                  {accountLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-3 text-base text-cream/80"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button type="button" onClick={handleSignOut} className="rounded-lg px-3 py-3 text-left text-base text-cream/80">
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-3">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-full border border-cream/40 py-3 text-center text-sm font-semibold"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/apply"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-full bg-white py-3 text-center text-sm font-semibold text-navy"
                  >
                    Apply
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

/**
 * The name button and its menu. Opens on hover (with a short grace period so
 * moving the pointer down into the menu doesn't close it), and also on click,
 * tap and keyboard — hover alone would shut out touch screens and keyboards.
 */
function AccountMenu({
  name,
  links,
  onSignOut,
}: {
  name: string;
  links: { href: string; label: string }[];
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const show = () => {
    cancelClose();
    setOpen(true);
  };
  const hideSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  // Close after navigating, and clean up a pending timer on unmount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);
  useEffect(() => cancelClose, []);

  return (
    <div
      ref={container}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
      onBlur={(event) => {
        if (!container.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cx(
          'flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
          open ? 'border-cream/60 bg-cream/10' : 'border-cream/25 hover:border-cream/60',
        )}
      >
        {name}
        <span aria-hidden className={cx('text-xs transition-transform', open && 'rotate-180')}>
          ▾
        </span>
      </button>

      {open ? (
        // pt-2 rather than a margin: the gap stays part of the hover area.
        <div className="absolute right-0 top-full z-50 w-56 pt-2">
          <div role="menu" className="rounded-xl bg-white p-2 text-navy shadow-xl">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-cream focus-visible:bg-cream"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-1 border-t border-line" />
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-cream focus-visible:bg-cream"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
