'use client';

// The site header. Signed out, it shows the public pages. Signed in, the
// dashboard is home: the logo goes there, "Dashboard" comes first, and the
// public pages move into an "Explore" menu so they stay one click away.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_LINKS, SITE } from '@/lib/site';
import { accountHome, useAuth } from './auth-provider';
import { Icon } from './marketing';
import { cx } from './ui';

const MEMBER_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/lessons', label: 'Lessons' },
  { href: '/applications', label: 'My applications' },
  { href: '/dashboard/settings', label: 'Settings' },
];

const STAFF_LINKS = [
  { href: '/admin', label: 'Staff area' },
  { href: '/admin/applications', label: 'Applications' },
];

/** Kept in the bar when signed in; everything else goes under Explore. */
const SIGNED_IN_KEEP = '/find-a-mentor';

/** `/?home` shows the front page even when signed in (see SignedInHome). */
const FRONT_PAGE = { href: '/?home', label: 'Home page' };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const home = user ? accountHome(user) : '/';
  const accountLinks = user ? (user.isStaff ? STAFF_LINKS : MEMBER_LINKS) : [];
  const exploreLinks = [FRONT_PAGE, ...NAV_LINKS.filter((link) => link.href !== SIGNED_IN_KEEP), { href: '/faq', label: 'FAQ' }];
  const barLinks = user
    ? [{ href: home, label: 'Dashboard' }, ...NAV_LINKS.filter((link) => link.href === SIGNED_IN_KEEP)]
    : NAV_LINKS;

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-navy text-cream print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 md:px-8">
        <Link href={home} className="inline-flex shrink-0 items-center gap-2 font-display text-xl font-bold">
          <Icon name="music" className="size-5" />
          {SITE.name}
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {barLinks.map((link) => (
            <BarLink key={link.href} href={link.href} active={isActive(pathname, link.href)}>
              {link.label}
            </BarLink>
          ))}
          {user ? (
            <HoverMenu
              label="Explore"
              align="left"
              buttonClassName="rounded-md px-3 py-2 text-sm text-cream/70 hover:text-cream"
            >
              {exploreLinks.map((link) => (
                <MenuLink key={link.href} href={link.href}>
                  {link.label}
                </MenuLink>
              ))}
            </HoverMenu>
          ) : null}
        </nav>

        <div className="ml-auto hidden items-center gap-2 xl:ml-0 xl:flex">
          {loading ? null : user ? (
            <HoverMenu
              label={user.name}
              align="right"
              buttonClassName="rounded-full border border-cream/25 px-4 py-2 text-sm hover:border-cream/60"
            >
              {accountLinks.map((link) => (
                <MenuLink key={link.href} href={link.href}>
                  {link.label}
                </MenuLink>
              ))}
              <div className="my-1 border-t border-line" />
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-cream focus-visible:bg-cream"
              >
                Sign out
              </button>
            </HoverMenu>
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
            {user ? (
              <>
                <p className="px-3 pb-1 text-sm text-cream/60">Signed in as {user.name}</p>
                {[...barLinks, ...accountLinks.filter((link) => link.href !== home)].map((link) => (
                  <MobileLink key={link.href} href={link.href} active={pathname === link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </MobileLink>
                ))}
                <p className="mt-3 border-t border-cream/10 px-3 pt-4 pb-1 text-xs font-semibold tracking-widest text-cream/45 uppercase">
                  Explore
                </p>
                {exploreLinks.map((link) => (
                  <MobileLink key={link.href} href={link.href} active={pathname === link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </MobileLink>
                ))}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 rounded-lg border-t border-cream/10 px-3 py-3 text-left text-base text-cream/80"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                {[{ href: '/', label: 'Home' }, ...NAV_LINKS, { href: '/faq', label: 'FAQ' }].map((link) => (
                  <MobileLink key={link.href} href={link.href} active={pathname === link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </MobileLink>
                ))}
                {loading ? null : (
                  <div className="mt-3 flex gap-3 border-t border-cream/10 px-3 pt-4">
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
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function BarLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'relative rounded-md px-3 py-2 text-sm transition-colors',
        active
          ? 'font-semibold text-cream after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold'
          : 'text-cream/70 hover:text-cream',
      )}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cx('rounded-lg px-3 py-3 text-base', active ? 'bg-cream/10 font-semibold' : 'text-cream/80')}
    >
      {children}
    </Link>
  );
}

function MenuLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-cream focus-visible:bg-cream">
      {children}
    </Link>
  );
}

/**
 * A button with a menu under it. Opens on hover (with a short grace period so
 * moving the pointer down into the menu doesn't close it), and also on click,
 * tap and keyboard; hover alone would shut out touch screens and keyboards.
 */
function HoverMenu({
  label,
  align,
  buttonClassName,
  children,
}: {
  label: string;
  align: 'left' | 'right';
  buttonClassName: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedAt = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const show = () => {
    cancelClose();
    if (!open) openedAt.current = Date.now();
    setOpen(true);
  };
  // A click right after the pointer arrived (and hover opened the menu) means
  // "open it", not "close it again".
  const toggle = () => {
    if (open && Date.now() - openedAt.current < 500) return;
    openedAt.current = Date.now();
    setOpen((value) => !value);
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
        onClick={toggle}
        className={cx('flex items-center gap-2 transition-colors', buttonClassName, open && 'text-cream')}
      >
        {label}
        <span aria-hidden className={cx('text-xs transition-transform', open && 'rotate-180')}>
          ▾
        </span>
      </button>

      {open ? (
        // pt-2 rather than a margin: the gap stays part of the hover area.
        <div className={cx('absolute top-full z-50 w-56 pt-2', align === 'right' ? 'right-0' : 'left-0')}>
          <div role="menu" className="rounded-xl bg-white p-2 text-navy shadow-xl">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
