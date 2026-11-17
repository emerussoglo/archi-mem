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

const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: 'fa-house' },
  { href: '/explorer', label: 'Recherche', icon: 'fa-magnifying-glass' },
  { href: '/aide', label: 'Aide', icon: 'fa-circle-question' },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="site-header">
        <nav className="navbar" aria-label="Navigation principale">
          <div className="navbar__brand-group">
            <Link href="/" className="navbar__brand" aria-label="Archives·Bénin, accueil">
              <span className="navbar__brand-icon" aria-hidden="true">
                <i className="fa-solid fa-box-archive" />
              </span>
              <span>
                Archives · Bénin
              </span>
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

          <div className="navbar__actions">
            <Link
              href="/explorer"
              className="navbar__cta"
              aria-label="Rechercher dans les archives"
            >
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <span>Rechercher</span>
            </Link>

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
          </div>
        </nav>
      </header>

      <nav className="mobile-tab-bar" aria-label="Navigation mobile">
        {MOBILE_NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`mobile-tab-bar__item ${isActive ? 'mobile-tab-bar__item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
