"use client";

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/catalog/SearchBar';
import { ArchiveCard } from '@/components/catalog/ArchiveCard';
import { useCatalogSearch, useStatistics } from '@/hooks/useCatalog';

const SEARCH_SUGGESTIONS = ['Éducation', 'Cotonou', '2009', "Protection de l'enfant"];

const formatNumber = (value?: number) => value === undefined
  ? '…'
  : value.toLocaleString('fr-FR');

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { results, isSearching, searchError } = useCatalogSearch({ limit: 3 });
  const { stats, distributions, isLoading: statsLoading, error: statsError } = useStatistics();
  const total = stats?.totalNotices || 0;
  const years = Object.entries(distributions?.byAnnee || {});
  const themes = Object.entries(distributions?.byThematique || {}).slice(0, 6);
  const funds = Object.entries(distributions?.byFonds || {}).slice(0, 4);

  const submitSearch = (value: string) => {
    const trimmed = value.trim();
    router.push(trimmed ? `/explorer?q=${encodeURIComponent(trimmed)}` : '/explorer');
  };

  const searchSuggestion = (value: string) => {
    router.push(`/explorer?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <p className="eyebrow">Archives · Bénin</p>
        <h1 id="home-title">Explorez la mémoire<br />documentaire</h1>
        <p className="home-hero__intro">
          Retrouvez et consultez les ressources archivistiques référencées.
        </p>

        <div className="home-hero__search">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={submitSearch}
            placeholder="Rechercher une ressource, un lieu, une thématique, une cote..."
            showAdvancedButton={false}
          />
        </div>

        <div className="suggestions" aria-label="Suggestions de recherche">
          <span className="suggestions__label">Suggestions</span>
          {SEARCH_SUGGESTIONS.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => searchSuggestion(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>

        {/* <Link href="/explorer?advanced=true" className="button button--outline home-hero__advanced">
          <i className="fa-solid fa-sliders" aria-hidden="true" />
          Recherche avancée
        </Link> */}

        <div className="home-metrics" aria-label="Chiffres clés du répertoire">
          <Metric value={formatNumber(stats?.totalNotices)} label="Notices" />
          <Metric value={formatNumber(stats?.distinctFonds)} label="Fonds" />
          <Metric value={formatNumber(stats?.distinctThematiques)} label="Thématiques" />
          <Metric value={formatNumber(stats?.distinctAnnees)} label="Années" />
        </div>
      </section>

      <section className="content-section" aria-labelledby="composition-title">
        <div className="section-heading">
          <p className="eyebrow">Vue d&apos;ensemble</p>
          <h2 id="composition-title">Composition du répertoire</h2>
        </div>
        {statsError ? (
          <p className="notice notice--error" role="alert">{statsError}</p>
        ) : (
          <div className="composition-grid">
            <section className="panel distribution-panel" aria-labelledby="years-title">
              <div className="panel__heading">
                <h3 id="years-title">Répartition par année</h3>
                <span>{formatNumber(stats?.metadataCompleteness.annee)} notices datées</span>
              </div>
              <div className="ring-grid ring-grid--years">
                {years.map(([year, count]) => (
                  <Ring
                    key={year}
                    label={year}
                    count={count}
                    total={total}
                    onClick={() => router.push(`/explorer?annee=${encodeURIComponent(year)}`)}
                  />
                ))}
              </div>
            </section>

            <section className="panel distribution-panel" aria-labelledby="metadata-title">
              <div className="panel__heading">
                <h3 id="metadata-title">Complétude des métadonnées</h3>
                <span>{formatNumber(total)} notices</span>
              </div>
              <div className="ring-grid ring-grid--metadata">
                <Ring label="Année renseignée" count={stats?.metadataCompleteness.annee || 0} total={total} />
                <Ring label="Légende renseignée" count={stats?.metadataCompleteness.legende || 0} total={total} />
                <Ring label="Lieu structuré" count={stats?.metadataCompleteness.lieuGeographique || 0} total={total} />
              </div>
              <p className="panel__note">
                Les pourcentages reflètent les champs effectivement renseignés dans le fichier source.
              </p>
            </section>
          </div>
        )}
        {statsLoading && <p className="loading-note">Calcul des statistiques depuis les notices du répertoire…</p>}
      </section>

      <section className="content-section browse-section" aria-labelledby="browse-title">
        <div className="section-heading">
          <p className="eyebrow">Accès rapide</p>
          <h2 id="browse-title">Parcourir le répertoire</h2>
          <Link href="/explorer" className="button button--outline">
            Toutes les notices <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>

        <section className="panel browse-panel" aria-labelledby="themes-title">
          <div className="panel__heading">
            <h3 id="themes-title">Explorer par thématique</h3>
            <i className="fa-solid fa-layer-group" aria-hidden="true" />
          </div>
          <div className="ring-grid ring-grid--themes">
            {themes.map(([label, count]) => (
              <Ring
                key={label}
                label={label}
                count={count}
                total={total}
                onClick={() => router.push(`/explorer?thematique=${encodeURIComponent(label)}`)}
              />
            ))}
          </div>
          <p className="panel__note">
            Les notices peuvent relever de plusieurs thématiques; les totaux thématiques ne s&apos;additionnent donc pas nécessairement au total des notices.
          </p>
        </section>

        <div className="browse-lower-grid">
          <section className="panel browse-panel" aria-labelledby="funds-title">
            <div className="panel__heading">
              <h3 id="funds-title">Fonds documentaires</h3>
              <i className="fa-solid fa-box-archive" aria-hidden="true" />
            </div>
            <div className="ring-grid ring-grid--funds">
              {funds.map(([label, count]) => (
                <Ring
                  key={label}
                  label={label}
                  count={count}
                  total={total}
                  onClick={() => router.push(`/explorer?fonds=${encodeURIComponent(label)}`)}
                />
              ))}
            </div>
          </section>
          <Link href="/explorer?advanced=true" className="advanced-card">
            <span className="advanced-card__title">Recherche avancée</span>
            <span>Combinez plusieurs critères et filtres pour isoler les notices.</span>
            <span className="button button--primary">
              Ouvrir la recherche <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </span>
            <i className="fa-solid fa-sliders advanced-card__icon" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="content-section discoveries-section" aria-labelledby="discoveries-title">
        <div className="section-heading">
          <p className="eyebrow">Sélection</p>
          <h2 id="discoveries-title">Notices à découvrir</h2>
          <p>Un aperçu de notices réellement présentes dans le répertoire.</p>
        </div>
        {searchError ? (
          <p className="notice notice--error" role="alert">{searchError}</p>
        ) : results.data.length > 0 ? (
          <div className="catalog-grid">
            {results.data.map((record) => <ArchiveCard key={record.id} record={record} />)}
          </div>
        ) : (
          <p className="loading-note">
            {isSearching ? 'Chargement des notices…' : 'Aucune notice disponible.'}
          </p>
        )}
        <div className="section-action">
          <Link href="/explorer" className="button button--outline">
            Parcourir toutes les notices <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="home-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Ring({
  label,
  count,
  total,
  onClick,
}: {
  label: string;
  count: string | number;
  total: number;
  onClick?: () => void;
}) {
  const numericCount = Number(count);
  const percentage = total > 0 ? (numericCount / total) * 100 : 0;
  const percentageLabel = percentage > 0 && percentage < 1 ? '<1%' : `${Math.round(percentage)}%`;
  const ringStyle = { '--ring-progress': `${Math.min(percentage, 100)}%` } as CSSProperties;
  const content = (
    <>
      <span className="ring" style={ringStyle}><strong>{percentageLabel}</strong></span>
      <span className="ring__label">{label}</span>
      <span className="ring__count">{numericCount.toLocaleString('fr-FR')} notice{numericCount > 1 ? 's' : ''}</span>
    </>
  );

  return onClick ? (
    <button type="button" className="ring-item" onClick={onClick}>{content}</button>
  ) : (
    <div className="ring-item">{content}</div>
  );
}
