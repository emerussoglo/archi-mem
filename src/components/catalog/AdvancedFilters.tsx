"use client";

import React, { useState } from 'react';
import { FilterOptions } from '@/types/catalog';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

interface SelectedFilters {
  fonds: string[];
  organismeProducteur: string[];
  organismeDetenteur: string[];
  thematique: string[];
  categorieDocumentaire: string[];
  typeDocument: string[];
  annee: string;
  anneeDebut: string;
  anneeFin: string;
  lieuGeographique: string[];
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  selectedFilters: SelectedFilters;
  onChange: (filters: SelectedFilters) => void;
  onReset: () => void;
  onApply: () => void;
  isOpen: boolean;
  onToggle: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

const FILTER_SECTIONS = [
  { key: 'fonds', label: 'Fonds documentaires' },
  { key: 'organismeProducteur', label: 'Organisme producteur' },
  { key: 'organismeDetenteur', label: 'Organisme détenteur' },
  { key: 'thematique', label: 'Thématique' },
  { key: 'categorieDocumentaire', label: 'Catégorie documentaire' },
  { key: 'typeDocument', label: 'Type de document' },
  { key: 'lieuGeographique', label: 'Lieu géographique' },
] as const;

export function AdvancedFilters({
  filters,
  selectedFilters,
  onChange,
  onReset,
  onApply,
  isOpen,
  onToggle,
  hasActiveFilters,
  className = '',
}: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const toggleValue = (key: keyof SelectedFilters, value: string, checked: boolean) => {
    const current = selectedFilters[key];
    if (!Array.isArray(current)) return;
    const next = checked
      ? [...current, value]
      : current.filter((entry) => entry !== value);
    onChange({ ...selectedFilters, [key]: next });
  };

  const activeCount = Object.values(selectedFilters).reduce(
    (count, value) => count + (Array.isArray(value) ? value.length : value ? 1 : 0),
    0
  );

  if (!isOpen) {
    return (
      <Button variant={hasActiveFilters ? 'primary' : 'outline'} onClick={onToggle} className={className}>
        <i className="fa-solid fa-sliders" aria-hidden="true" />
        Recherche avancée {hasActiveFilters ? `(${activeCount})` : ''}
      </Button>
    );
  }

  return (
    <section className={`advanced-filters ${className}`} aria-labelledby="advanced-filters-title">
      <header className="advanced-filters__header">
        <div>
          <h2 id="advanced-filters-title">Recherche avancée</h2>
          <p>Combinez plusieurs critères pour affiner les notices.</p>
        </div>
        <button type="button" className="icon-button" onClick={onToggle} aria-label="Fermer les filtres">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </header>

      <div className="advanced-filters__grid">
        {FILTER_SECTIONS.map((section) => {
          const values = filters[section.key === 'lieuGeographique' ? 'lieuxGeographiques' : section.key];
          const selected = selectedFilters[section.key] as string[];
          const expanded = expandedSections[section.key] ?? section.key === 'thematique';
          if (values.length === 0) return null;

          return (
            <section key={section.key} className="filter-section">
              <button
                type="button"
                className="filter-section__toggle"
                onClick={() => toggleSection(section.key)}
                aria-expanded={expanded}
              >
                <span>{section.label}</span>
                <span className="filter-section__count">
                  {selected.length ? `${selected.length} sélectionné(s)` : `${values.length} valeurs`}
                </span>
                <i className={`fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true" />
              </button>
              {expanded && (
                <div className="filter-section__options">
                  {values.map((value) => (
                    <Checkbox
                      key={value}
                      label={value}
                      checked={selected.includes(String(value))}
                      onChange={(checked) => toggleValue(section.key, String(value), checked)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
        <section className="filter-section filter-section--years">
          <h3>Année</h3>
          <div className="year-filter">
            <label>
              <span>De</span>
              <input
                type="number"
                min={1800}
                max={2100}
                value={selectedFilters.anneeDebut}
                onChange={(event) => onChange({ ...selectedFilters, anneeDebut: event.target.value })}
              />
            </label>
            <label>
              <span>À</span>
              <input
                type="number"
                min={1800}
                max={2100}
                value={selectedFilters.anneeFin}
                onChange={(event) => onChange({ ...selectedFilters, anneeFin: event.target.value })}
              />
            </label>
          </div>
          <label className="year-filter__exact">
            <span>Année exacte</span>
            <input
              type="number"
              min={1800}
              max={2100}
              value={selectedFilters.annee}
              onChange={(event) => onChange({ ...selectedFilters, annee: event.target.value })}
            />
          </label>
          <p className="filter-hint">Seules les années renseignées dans le répertoire sont prises en compte.</p>
        </section>
      </div>

      <footer className="advanced-filters__actions">
        <Button variant="outline" onClick={onReset}>Réinitialiser</Button>
        <Button onClick={onApply}>Afficher les résultats</Button>
      </footer>
    </section>
  );
}
