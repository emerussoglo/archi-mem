import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/explorer', label: 'Recherche' },
  { href: '/statistiques', label: 'Statistiques' },
  { href: '/aide', label: 'Aide' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <Link href="/" className="site-footer__brand">Archives · Bénin</Link>
          <nav className="site-footer__links" aria-label="Navigation de pied de page">
            {FOOTER_LINKS.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
        </div>
        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Archives UNICEF Bénin</span>
          <span>Descriptions archivistiques non authentifiées.</span>
        </div>
      </div>
      <div className="site-footer__wordmark" aria-hidden="true">ARCHIVES · BÉNIN</div>
    </footer>
  );
}
