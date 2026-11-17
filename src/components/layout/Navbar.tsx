"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Accueil' },
  { href: '/explorer', label: 'Recherche' },
  { href: '/aide', label: 'Aide' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Navigation principale">
        <div className="navbar__brand-group">
          <button
            type="button"
            className="navbar__menu-button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
          </button>
          <Link href="/" className="navbar__brand" aria-label="Archives·Bénin, accueil">
            Archives · Bénin
          </Link>
        </div>

        <div id="primary-navigation" className={`navbar__links ${isMobileMenuOpen ? 'navbar__links--open' : ''}`}>
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`navbar__link ${pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)) ? 'navbar__link--active' : ''}`}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/statistiques"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`navbar__link navbar__stats-link ${pathname === '/statistiques' ? 'navbar__link--active' : ''}`}
            aria-current={pathname === '/statistiques' ? 'page' : undefined}
          >
            Statistiques
          </Link>
        </div>

        <Link href="/explorer" className="navbar__cta">
          Rechercher <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
        </Link>
      </nav>
    </header>
  );
}
