"use client";

import { useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/Button';
import { useStatistics } from '@/hooks/useCatalog';
import type { DistributionData, Statistics } from '@/types/catalog';

type NumericStatistic = Exclude<keyof Statistics, 'metadataCompleteness'>;

const STAT_CARDS: { key: NumericStatistic; label: string; icon: string }[] = [
  { key: 'totalNotices', label: 'Notices', icon: 'fa-file-lines' },
  { key: 'distinctCotes', label: 'Cotes', icon: 'fa-hashtag' },
  { key: 'distinctFonds', label: 'Fonds', icon: 'fa-box-archive' },
  { key: 'distinctOrganismes', label: 'Organismes producteurs', icon: 'fa-building' },
  { key: 'distinctThematiques', label: 'Thématiques', icon: 'fa-tags' },
  { key: 'distinctCategories', label: 'Catégories', icon: 'fa-folder-open' },
  { key: 'distinctTypes', label: 'Types de document', icon: 'fa-file-lines' },
  { key: 'distinctLieux', label: 'Lieux structurés', icon: 'fa-location-dot' },
  { key: 'distinctAnnees', label: 'Années', icon: 'fa-calendar' },
];

const CHART_CONFIGS: { key: keyof DistributionData; title: string }[] = [
  { key: 'byAnnee', title: 'Répartition par année' },
  { key: 'byFonds', title: 'Répartition par fonds' },
  { key: 'byOrganisme', title: 'Organismes producteurs' },
  { key: 'byThematique', title: 'Répartition par thématique' },
  { key: 'byCategorie', title: 'Catégories documentaires' },
  { key: 'byTypeDocument', title: 'Types de document' },
  { key: 'byLieu', title: 'Lieux géographiques' },
];

export default function StatisticsPage() {
  const { stats, distributions, isLoading, error, refresh } = useStatistics();
  const [activeChart, setActiveChart] = useState<keyof DistributionData>('byFonds');
  const [chartLimit, setChartLimit] = useState(10);
  const [showTable, setShowTable] = useState(false);

  if (isLoading) {
    return <p className="loading-note statistics-loading">Chargement des statistiques du classeur…</p>;
  }

  if (error || !stats || !distributions) {
    return (
      <div className="empty-state">
        <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
        <h1>Statistiques indisponibles</h1>
        <p role="alert">{error || 'Les données statistiques ne sont pas disponibles.'}</p>
        <Button onClick={refresh}>Réessayer</Button>
      </div>
    );
  }

  const entries = Object.entries(distributions[activeChart]).slice(0, chartLimit) as [string, number][];
  const maxValue = Math.max(...entries.map(([, value]) => value), 1);
  const chartTitle = CHART_CONFIGS.find((chart) => chart.key === activeChart)?.title || 'Répartition';

  const exportCsv = () => {
    const csv = [
      ['Libellé', 'Nombre'],
      ...entries.map(([label, count]) => [label, String(count)]),
    ].map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `archives-benin-${activeChart}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="statistics-page">
      <header className="page-intro statistics-intro">
        <p className="eyebrow">Vue d&apos;ensemble</p>
        <h1>Statistiques du répertoire</h1>
        <p>Indicateurs et répartitions calculés directement à partir du classeur source.</p>
      </header>

      <section className="statistics-kpis" aria-label="Indicateurs clés">
        {STAT_CARDS.map((stat) => (
          <div className="statistic-card" key={stat.key}>
            <i className={`fa-solid ${stat.icon}`} aria-hidden="true" />
            <strong>{stats[stat.key].toLocaleString('fr-FR')}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="content-section statistics-composition" aria-labelledby="statistics-composition-title">
        <div className="section-heading">
          <h2 id="statistics-composition-title">Complétude des métadonnées</h2>
        </div>
        <div className="panel statistics-completeness">
          <CompletenessRing label="Années renseignées" count={stats.metadataCompleteness.annee} total={stats.totalNotices} />
          <CompletenessRing label="Légendes renseignées" count={stats.metadataCompleteness.legende} total={stats.totalNotices} />
          <CompletenessRing label="Lieux structurés" count={stats.metadataCompleteness.lieuGeographique} total={stats.totalNotices} />
          <p className="panel__note">
            Le fichier source ne comporte pas de colonne dédiée au lieu géographique ; cette valeur n&apos;est donc pas déduite automatiquement des légendes.
          </p>
        </div>
      </section>

      <section className="content-section statistics-distribution" aria-labelledby="distribution-title">
        <div className="section-heading section-heading--row">
          <div>
            <p className="eyebrow">Données du fichier Excel</p>
            <h2 id="distribution-title">Répartition du répertoire</h2>
          </div>
          <div className="statistics-actions">
            <Button variant="outline" onClick={refresh}>
              <i className="fa-solid fa-rotate" aria-hidden="true" /> Actualiser
            </Button>
          </div>
        </div>

        <div className="statistics-workspace">
          <aside className="panel chart-controls">
            <h3>Choisir une répartition</h3>
            <div className="chart-options" role="group" aria-label="Répartition à afficher">
              {CHART_CONFIGS.map((chart) => (
                <button
                  type="button"
                  key={chart.key}
                  className={activeChart === chart.key ? 'chart-option chart-option--active' : 'chart-option'}
                  onClick={() => setActiveChart(chart.key)}
                  aria-pressed={activeChart === chart.key}
                >
                  {chart.title}
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
              ))}
            </div>
            <label className="chart-limit">
              <span>Éléments affichés</span>
              <select value={chartLimit} onChange={(event) => setChartLimit(Number(event.target.value))}>
                {[5, 10, 20, 50].map((limit) => <option key={limit} value={limit}>Top {limit}</option>)}
              </select>
            </label>
            <Button variant="outline" onClick={() => setShowTable((value) => !value)} fullWidth>
              <i className={`fa-solid ${showTable ? 'fa-chart-column' : 'fa-table-list'}`} aria-hidden="true" />
              {showTable ? 'Voir le graphique' : 'Voir le tableau'}
            </Button>
          </aside>

          <section className="panel chart-panel" aria-labelledby="chart-title">
            <div className="panel__heading">
              <h3 id="chart-title">{chartTitle}</h3>
              <span>{entries.length} valeurs affichées</span>
            </div>
            {entries.length === 0 ? (
              <p className="empty-inline">Aucune donnée structurée disponible pour ce critère.</p>
            ) : showTable ? (
              <DistributionTable entries={entries} total={stats.totalNotices} />
            ) : (
              <div className="bar-chart" role="img" aria-label={`Graphique : ${chartTitle}`}>
                {entries.map(([label, value]) => (
                  <div className="bar-chart__item" key={label}>
                    <div className="bar-chart__value">{value.toLocaleString('fr-FR')}</div>
                    <div className="bar-chart__track">
                      <span style={{ width: `${(value / maxValue) * 100}%` }} />
                    </div>
                    <div className="bar-chart__label" title={label}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function CompletenessRing({ label, count, total }: { label: string; count: number; total: number }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="completeness-item">
      <div className="ring" style={{ '--ring-progress': `${percentage}%` } as CSSProperties}>
        <strong>{percentage}%</strong>
      </div>
      <span>{label}</span>
      <small>{count.toLocaleString('fr-FR')} notices</small>
    </div>
  );
}

function DistributionTable({ entries, total }: { entries: [string, number][]; total: number }) {
  return (
    <div className="distribution-table-wrap">
      <table className="distribution-table">
        <thead><tr><th>Rang</th><th>Libellé</th><th>Notices</th><th>Part du total</th></tr></thead>
        <tbody>
          {entries.map(([label, count], index) => (
            <tr key={label}>
              <td>{index + 1}</td>
              <td>{label}</td>
              <td>{count.toLocaleString('fr-FR')}</td>
              <td>{total ? `${Math.round((count / total) * 100)}%` : '0%'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
