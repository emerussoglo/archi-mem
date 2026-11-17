"use client";

import React from 'react';
import Link from 'next/link';
import { ArchiveRecord } from '@/types/catalog';

interface ArchiveCardProps {
  record: ArchiveRecord;
  onClick?: () => void;
  compact?: boolean;
}

export function ArchiveCard({ record, onClick, compact = false }: ArchiveCardProps) {
  const themes = record.thematique || [];
  const year = record.annee ? String(record.annee) : null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={`archive-card ${compact ? 'archive-card--compact' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Consulter ${record.coteArchivistique || 'cette notice'}` : undefined}
    >
      <header className="archive-card__header">
        <span className="archive-card__cote">
          <i className="fa-solid fa-hashtag" aria-hidden="true" />
          {record.coteArchivistique || `Notice ${record.numeroInventaire || ''}`}
        </span>
        {year && (
          <span className="archive-card__year">
            <i className="fa-regular fa-calendar" aria-hidden="true" /> {year}
          </span>
        )}
      </header>

      <h3 className="archive-card__title">
        {record.titreIntitule || record.legende || 'Notice archivistique'}
      </h3>

      <div className="archive-card__badges">
        {record.categorieDocumentaire && (
          <span className="archive-card__badge archive-card__badge--blue">
            {record.categorieDocumentaire.replace(/_/g, ' ')}
          </span>
        )}
        {record.typeDocument && (
          <span className="archive-card__badge">{record.typeDocument}</span>
        )}
      </div>

      {themes.length > 0 && (
        <ul className="archive-card__themes" aria-label="Thématiques">
          {themes.slice(0, 3).map((theme) => (
            <li key={theme}>
              <i className="fa-solid fa-tag" aria-hidden="true" /> {theme}
            </li>
          ))}
        </ul>
      )}

      <footer className="archive-card__footer">
        <span className="archive-card__fund">
          <i className="fa-solid fa-building" aria-hidden="true" />
          {record.fonds || record.lieuGeographique || 'Fonds non renseigné'}
        </span>
        <Link
          href={`/explorer/${encodeURIComponent(record.id)}`}
          className="archive-card__link"
          onClick={(event) => event.stopPropagation()}
        >
          Voir la notice <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}
