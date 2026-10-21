import Link from 'next/link';
import { FOOTER_LINKS, SITE } from '@/lib/site';
import { ContactEmail, Container, Icon } from './marketing';

export function SiteFooter() {
  return (
    <footer className="bg-navy text-cream print:hidden">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex max-w-xs flex-col gap-4">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-bold">
            <Icon name="music" className="size-5" />
            {SITE.name}
          </Link>
          <p className="text-sm leading-relaxed text-cream/70">
            Free online music lessons. Student volunteers who play an instrument, teaching students who want to
            learn one.
          </p>
          <ContactEmail className="w-max text-cream" />
        </div>

        {FOOTER_LINKS.map((group) => (
          <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">{group.title}</h2>
            <ul className="flex flex-col gap-2.5">
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-cream/70 hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-cream/10">
        <Container className="py-6 text-xs text-cream/60">
          © {new Date().getFullYear()} {SITE.name}. A student-led initiative.
        </Container>
      </div>
    </footer>
  );
}
