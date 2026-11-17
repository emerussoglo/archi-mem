/**
 * Archives·Bénin - Moteur de recherche archivistique
 * Recherche full-text multi-champs avec gestion des accents, casse, recherche partielle
 */

import type { ArchiveRecord, SearchParams, PaginatedResult, FilterOptions } from '@/types/catalog';

export class SearchService {
  private records: ArchiveRecord[];
  private searchableFields: (keyof ArchiveRecord)[];

  constructor(records: ArchiveRecord[]) {
    this.records = records;
    this.searchableFields = [
      'numeroInventaire',
      'coteArchivistique',
      'fonds',
      'organismeProducteur',
      'organismeDetenteur',
      'thematique',
      'thematiqueOriginale',
      'categorieDocumentaire',
      'typeDocument',
      'annee',
      'dateDebut',
      'dateFin',
      'dateDocument',
      'titreIntitule',
      'legende',
      'lieuGeographique',
      'cheminAcces',
      'sourceData',
      'champsSupplementaires',
    ];
  }

  updateRecords(records: ArchiveRecord[]): void {
    this.records = records;
  }

  /**
   * Normalise un texte pour la recherche (minuscules, sans accents, trim)
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // Supprimer les diacritiques
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Vérifie si un terme correspond à une valeur (recherche partielle)
   */
  private matchesTerm(value: string, term: string): boolean {
    const normValue = this.normalizeText(value);
    const normTerm = this.normalizeText(term);
    return normValue.includes(normTerm);
  }

  /**
   * Recherche globale sur tous les champs
   */
  search(params: SearchParams): PaginatedResult<ArchiveRecord> {
    let filtered = this.records;

    // 1. Recherche textuelle globale
    if (params.query && params.query.trim()) {
      const queryTerms = params.query
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0);

      filtered = filtered.filter((record) =>
        queryTerms.every((term) =>
          this.searchableFields.some((field) => {
            return this.searchValues(record[field]).some((value) => this.matchesTerm(value, term));
          })
        )
      );
    }

    // 2. Filtres par champs exacts (valeurs multiples = OR)
    if (params.fonds && params.fonds.length > 0) {
      const fondsSet = new Set(params.fonds.map((f) => this.normalizeText(f)));
      filtered = filtered.filter((r) => r.fonds && fondsSet.has(this.normalizeText(r.fonds)));
    }

    if (params.organismeProducteur && params.organismeProducteur.length > 0) {
      const set = new Set(params.organismeProducteur.map((f) => this.normalizeText(f)));
      filtered = filtered.filter((r) => r.organismeProducteur && set.has(this.normalizeText(r.organismeProducteur)));
    }

    if (params.organismeDetenteur && params.organismeDetenteur.length > 0) {
      const set = new Set(params.organismeDetenteur.map((f) => this.normalizeText(f)));
      filtered = filtered.filter((r) => r.organismeDetenteur && set.has(this.normalizeText(r.organismeDetenteur)));
    }

    if (params.thematique && params.thematique.length > 0) {
      const set = new Set(params.thematique.map((f) => this.normalizeText(f)));
      filtered = filtered.filter((r) => this.getThemes(r).some((theme) => set.has(this.normalizeText(theme))));
    }

    if (params.categorieDocumentaire && params.categorieDocumentaire.length > 0) {
      const set = new Set(params.categorieDocumentaire.map((f) => this.normalizeText(f)));
      filtered = filtered.filter((r) => r.categorieDocumentaire && set.has(this.normalizeText(r.categorieDocumentaire)));
    }

    if (params.typeDocument && params.typeDocument.length > 0) {
      const set = new Set(params.typeDocument.map((f) => this.normalizeText(f)));
      filtered = filtered.filter((r) => r.typeDocument && set.has(this.normalizeText(r.typeDocument)));
    }

    if (params.lieuGeographique && params.lieuGeographique.length > 0) {
      const set = new Set(params.lieuGeographique.map((f) => this.normalizeText(f)));
      filtered = filtered.filter((r) => r.lieuGeographique && set.has(this.normalizeText(r.lieuGeographique)));
    }

    // 3. Filtre année exacte
    if (params.annee !== undefined && params.annee !== null && params.annee !== '') {
      filtered = filtered.filter((r) => r.annee !== undefined && String(r.annee) === String(params.annee));
    }

    // 4. Filtre intervalle d'années
    if (params.anneeDebut !== undefined && params.anneeDebut !== null && params.anneeDebut !== '') {
      const debut = Number(params.anneeDebut);
      if (!isNaN(debut)) {
        filtered = filtered.filter((r) => {
          const year = Number(r.annee);
          return !isNaN(year) && year >= debut;
        });
      }
    }

    if (params.anneeFin !== undefined && params.anneeFin !== null && params.anneeFin !== '') {
      const fin = Number(params.anneeFin);
      if (!isNaN(fin)) {
        filtered = filtered.filter((r) => {
          const year = Number(r.annee);
          return !isNaN(year) && year <= fin;
        });
      }
    }

    // 5. Pagination
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Obtient les options de filtre disponibles
   */
  getFilterOptions(): FilterOptions {
    const getUnique = (field: keyof ArchiveRecord): string[] => {
      const values = new Set<string>();
      for (const record of this.records) {
        const value = record[field];
        if (value !== undefined && value !== null && value !== '') {
          values.add(String(value).trim());
        }
      }
      return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    };

    const getUniqueYears = (): (string | number)[] => {
      const years = new Set<string | number>();
      for (const record of this.records) {
        if (record.annee !== undefined && record.annee !== null && record.annee !== '') {
          years.add(record.annee);
        }
      }
      return Array.from(years).sort((a, b) => {
        const numA = typeof a === 'number' ? a : Number(a);
        const numB = typeof b === 'number' ? b : Number(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return String(a).localeCompare(String(b), 'fr');
      });
    };

    return {
      fonds: getUnique('fonds'),
      organismeProducteur: getUnique('organismeProducteur'),
      organismeDetenteur: getUnique('organismeDetenteur'),
      thematique: this.getUniqueThemes(),
      categorieDocumentaire: getUnique('categorieDocumentaire'),
      typeDocument: getUnique('typeDocument'),
      annees: getUniqueYears(),
      lieuxGeographiques: getUnique('lieuGeographique'),
    };
  }

  /**
   * Obtient un enregistrement par ID
   */
  getById(id: string): ArchiveRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  /**
   * Obtient un enregistrement par cote archivistique
   */
  getByCote(cote: string): ArchiveRecord | undefined {
    const normCote = this.normalizeText(cote);
    return this.records.find((r) => r.coteArchivistique && this.normalizeText(r.coteArchivistique) === normCote);
  }

  /**
   * Retourne le nombre total d'enregistrements
   */
  getTotalCount(): number {
    return this.records.length;
  }

  private searchValues(value: unknown): string[] {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value).trim() ? [String(value)] : [];
    }
    if (Array.isArray(value)) return value.flatMap((item) => this.searchValues(item));
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).flatMap((item) => this.searchValues(item));
    }
    return [];
  }

  private getThemes(record: ArchiveRecord): string[] {
    const value = record.thematique?.length ? record.thematique : record.thematiqueOriginale;
    if (!value) return [];
    const values = Array.isArray(value) ? value : value.split(/[,;|]/);
    const themes = new Map<string, string>();
    for (const theme of values.map((item) => item.trim()).filter(Boolean)) {
      const normalized = this.normalizeText(theme);
      if (!themes.has(normalized)) themes.set(normalized, theme);
    }
    return Array.from(themes.values());
  }

  private getUniqueThemes(): string[] {
    const themes = new Map<string, string>();
    for (const record of this.records) {
      for (const theme of this.getThemes(record)) {
        const normalized = this.normalizeText(theme);
        if (!themes.has(normalized)) themes.set(normalized, theme);
      }
    }
    return Array.from(themes.values()).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }
}

/**
 * Instance singleton du service de recherche
 */
let searchServiceInstance: SearchService | null = null;

export function getSearchService(records?: ArchiveRecord[]): SearchService {
  if (records) {
    searchServiceInstance = new SearchService(records);
  }
  if (!searchServiceInstance) {
    throw new Error('SearchService non initialisé. Appelez getSearchService(records) au démarrage.');
  }
  return searchServiceInstance;
}

export function resetSearchService(): void {
  searchServiceInstance = null;
}