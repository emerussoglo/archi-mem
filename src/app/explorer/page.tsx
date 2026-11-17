"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArchiveCard } from '@/components/catalog/ArchiveCard';
import { AdvancedFilters } from '@/components/catalog/AdvancedFilters';
import { DetailView } from '@/components/catalog/DetailView';
import { SearchBar } from '@/components/catalog/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { useCatalogSearch } from '@/hooks/useCatalog';
import type { ArchiveRecord, SearchParams } from '@/types/catalog';

const EMPTY_FILTERS = {
  fonds: [] as string[],
  organismeProducteur: [] as string[],
  organismeDetenteur: [] as string[],
  thematique: [] as string[],
  categorieDocumentaire: [] as string[],
  typeDocument: [] as string[],
  annee: '',
  anneeDebut: '',
  anneeFin: '',
  lieuGeographique: [] as string[],
};

type SelectedFilters = typeof EMPTY_FILTERS;

export default function ExplorerPage() {
  const {
    results,
    filters,
    searchParams,
    searchError,
    isSearching,
    updateParams,
    goToPage,
    changeLimit,
    reset,
  } = useCatalogSearch({ limit: 20 });
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(EMPTY_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);
  const initialUrlHandled = useRef(false);

  const hasActiveFilters = Object.values(selectedFilters).some(
    (value) => Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  const applyFilters = useCallback((nextFilters: SelectedFilters) => {
    setSelectedFilters(nextFilters);
    const params: Partial<SearchParams> = {
      fonds: nextFilters.fonds,
      organismeProducteur: nextFilters.organismeProducteur,
      organismeDetenteur: nextFilters.organismeDetenteur,
      thematique: nextFilters.thematique,
      categorieDocumentaire: nextFilters.categorieDocumentaire,
      typeDocument: nextFilters.typeDocument,
      annee: nextFilters.annee || undefined,
      anneeDebut: nextFilters.anneeDebut || undefined,
      anneeFin: nextFilters.anneeFin || undefined,
      lieuGeographique: nextFilters.lieuGeographique,
    };
    updateParams(params);
  }, [updateParams]);

  useEffect(() => {
    if (initialUrlHandled.current) return;
    initialUrlHandled.current = true;
    const url = new URLSearchParams(window.location.search);
    const params: Partial<SearchParams> = {};
    const selected = { ...EMPTY_FILTERS };

    const readList = (key: keyof SelectedFilters) => {
      const values = url.getAll(key).flatMap((value) => value.split(',')).filter(Boolean);
      if (Array.isArray(selected[key])) {
        (selected[key] as string[]) = values;
        if (values.length) (params as Record<string, unknown>)[key] = values;
      }
    };

    readList('fonds');
    readList('organismeProducteur');
    readList('organismeDetenteur');
    readList('thematique');
    readList('categorieDocumentaire');
    readList('typeDocument');
    readList('lieuGeographique');

    for (const key of ['annee', 'anneeDebut', 'anneeFin'] as const) {
      const value = url.get(key);
      if (value) {
        selected[key] = value;
        params[key] = value;
      }
    }
    const query = url.get('q') || url.get('search');
    if (query) params.query = query;

    if (Object.keys(params).length > 0) {
      setSelectedFilters(selected);
      updateParams(params);
    }
    if (url.get('advanced') === 'true') setShowAdvanced(true);
  }, [updateParams]);

  const handleReset = () => {
    setSelectedFilters(EMPTY_FILTERS);
    setSelectedRecord(null);
    reset();
  };

  const filterList = (
    label: string,
    items: string[],
    selected: string[],
    onChange: (value: string, checked: boolean) => void,
  ) => (
    <fieldset className="sidebar-filter">
      <legend>{label}</legend>
      {items.length > 0 ? items.slice(0, 8).map((value) => (
        <label key={value} className="sidebar-filter__option">
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={(event) => onChange(value, event.target.checked)}
          />
          <span>{value}</span>
        </label>
      )) : <p className="filter-hint">Aucune valeur structurée dans la source.</p>}
      {items.length > 8 && (
        <button type="button" className="text-button" onClick={() => setShowAdvanced(true)}>
          Voir toutes les valeurs ({items.length})
        </button>
      )}
    </fieldset>
  );

  const updateList = (field: keyof SelectedFilters, value: string, checked: boolean) => {
    const current = selectedFilters[field];
    if (!Array.isArray(current)) return;
    applyFilters({
      ...selectedFilters,
      [field]: checked ? [...current, value] : current.filter((entry) => entry !== value),
    });
  };

  return (
    <div className="explorer-page">
      <header className="page-intro explorer-intro">
        <p className="eyebrow">Recherche documentaire</p>
        <h1>Explorer le répertoire</h1>
        <p>Combinez la recherche par mot-clé et les filtres pour isoler les notices qui vous intéressent.</p>
        <SearchBar
          value={searchParams.query || ''}
          onChange={(query) => updateParams({ query, page: 1 })}
          onSearch={(query) => updateParams({ query, page: 1 })}
          placeholder="Rechercher par mot-clé, cote, lieu, thématique..."
          showAdvancedButton={false}
          isLoading={isSearching}
          className="explorer-search"
        />
      </header>

      <div className="explorer-layout">
        <aside className="filter-panel" aria-label="Filtres de recherche">
          <div className="filter-panel__heading">
            <h2>Filtres</h2>
            <button type="button" className="text-button" onClick={handleReset}>Réinitialiser</button>
          </div>

          <fieldset className="sidebar-filter">
            <legend>Année</legend>
            <div className="year-filter">
              <label>
                <span>De</span>
                <select
                  value={selectedFilters.anneeDebut}
                  onChange={(event) => applyFilters({ ...selectedFilters, anneeDebut: event.target.value })}
                >
                  <option value="">Toutes</option>
                  {filters.annees.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
              <label>
                <span>À</span>
                <select
                  value={selectedFilters.anneeFin}
                  onChange={(event) => applyFilters({ ...selectedFilters, anneeFin: event.target.value })}
                >
                  <option value="">Toutes</option>
                  {filters.annees.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
            </div>
            <p className="filter-hint">Seules les années renseignées sont proposées.</p>
          </fieldset>

          {filterList('Thématique', filters.thematique, selectedFilters.thematique, (value, checked) => updateList('thematique', value, checked))}
          {filterList('Fonds documentaire', filters.fonds, selectedFilters.fonds, (value, checked) => updateList('fonds', value, checked))}
          {filterList('Organisme producteur', filters.organismeProducteur, selectedFilters.organismeProducteur, (value, checked) => updateList('organismeProducteur', value, checked))}
          {filterList('Organisme détenteur', filters.organismeDetenteur, selectedFilters.organismeDetenteur, (value, checked) => updateList('organismeDetenteur', value, checked))}
          {filterList('Type de document', filters.typeDocument, selectedFilters.typeDocument, (value, checked) => updateList('typeDocument', value, checked))}

          <button
            type="button"
            className="button button--outline filter-panel__advanced"
            onClick={() => setShowAdvanced((open) => !open)}
          >
            <i className="fa-solid fa-sliders" aria-hidden="true" />
            {showAdvanced ? 'Masquer les filtres avancés' : 'Plus de filtres'}
          </button>
        </aside>

        <section className="explorer-results" aria-label="Résultats de recherche">
          <div className="results-toolbar">
            <p>
              <strong>{results.total.toLocaleString('fr-FR')}</strong>{' '}
              notice{results.total !== 1 ? 's' : ''}
              {searchParams.query ? <> pour « {searchParams.query} »</> : ''}
            </p>
            <label className="results-limit">
              <span>Par page</span>
              <select value={results.limit} onChange={(event) => changeLimit(Number(event.target.value))}>
                {[10, 20, 50, 100].map((limit) => <option key={limit} value={limit}>{limit}</option>)}
              </select>
            </label>
          </div>

          {showAdvanced && (
            <AdvancedFilters
              filters={filters}
              selectedFilters={selectedFilters}
              onChange={applyFilters}
              onReset={handleReset}
              onApply={() => setShowAdvanced(false)}
              isOpen
              onToggle={() => setShowAdvanced(false)}
              hasActiveFilters={hasActiveFilters}
              className="results-advanced"
            />
          )}

          {searchError ? (
            <p className="notice notice--error" role="alert">{searchError}</p>
          ) : isSearching && results.data.length === 0 ? (
            <p className="loading-note" aria-live="polite">Chargement des notices…</p>
          ) : results.data.length > 0 ? (
            <>
              <div className="catalog-grid">
                {results.data.map((record) => (
                  <ArchiveCard
                    key={record.id}
                    record={record}
                    onClick={() => setSelectedRecord(record)}
                  />
                ))}
              </div>
              <Pagination
                currentPage={results.page}
                totalPages={results.totalPages}
                totalItems={results.total}
                itemsPerPage={results.limit}
                onPageChange={goToPage}
                onItemsPerPageChange={changeLimit}
              />
            </>
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-box-open" aria-hidden="true" />
              <h2>Aucun résultat</h2>
              <p>Essayez d&apos;élargir votre recherche ou de réinitialiser les filtres.</p>
              {(hasActiveFilters || searchParams.query) && (
                <button type="button" className="button button--primary" onClick={handleReset}>Réinitialiser</button>
              )}
            </div>
          )}
        </section>
      </div>

      <DetailView
        record={selectedRecord}
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
