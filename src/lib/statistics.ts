/**
 * Archives·Bénin - Service de statistiques
 * Calcule tous les indicateurs et distributions à partir des données réelles
 */

import type { ArchiveRecord, Statistics, DistributionData } from '@/types/catalog';

export class StatisticsService {
  private records: ArchiveRecord[];

  constructor(records: ArchiveRecord[]) {
    this.records = records;
  }

  updateRecords(records: ArchiveRecord[]): void {
    this.records = records;
  }

  /**
   * Calcule les statistiques globales
   */
  getStatistics(): Statistics {
    const distinctCotes = new Set<string>();
    const distinctFonds = new Set<string>();
    const distinctOrganismes = new Set<string>();
    const distinctThematiques = new Set<string>();
    const distinctCategories = new Set<string>();
    const distinctTypes = new Set<string>();
    const distinctLieux = new Set<string>();
    const distinctAnnees = new Set<string | number>();
    const metadataCompleteness = { annee: 0, legende: 0, lieuGeographique: 0 };

    for (const record of this.records) {
      if (record.coteArchivistique?.trim()) distinctCotes.add(record.coteArchivistique.trim());
      if (record.fonds?.trim()) distinctFonds.add(record.fonds.trim());
      if (record.organismeProducteur?.trim()) distinctOrganismes.add(record.organismeProducteur.trim());
      for (const theme of this.getThemes(record)) {
        distinctThematiques.add(this.normalizeLabel(theme));
      }
      if (record.categorieDocumentaire?.trim()) distinctCategories.add(record.categorieDocumentaire.trim());
      if (record.typeDocument?.trim()) distinctTypes.add(record.typeDocument.trim());
      if (record.lieuGeographique?.trim()) distinctLieux.add(record.lieuGeographique.trim());
      if (record.annee !== undefined && record.annee !== null && record.annee !== '') metadataCompleteness.annee += 1;
      if (record.legende?.trim()) metadataCompleteness.legende += 1;
      if (record.lieuGeographique?.trim()) metadataCompleteness.lieuGeographique += 1;
      if (record.annee !== undefined && record.annee !== null && record.annee !== '') {
        distinctAnnees.add(record.annee);
      }
    }

    return {
      totalNotices: this.records.length,
      distinctCotes: distinctCotes.size,
      distinctFonds: distinctFonds.size,
      distinctOrganismes: distinctOrganismes.size,
      distinctThematiques: distinctThematiques.size,
      distinctCategories: distinctCategories.size,
      distinctTypes: distinctTypes.size,
      distinctLieux: distinctLieux.size,
      distinctAnnees: distinctAnnees.size,
      metadataCompleteness,
    };
  }

  /**
   * Calcule les distributions pour les graphiques
   */
  getDistributions(): DistributionData {
    const byFonds: Record<string, number> = {};
    const byOrganisme: Record<string, number> = {};
    const byThematique: Record<string, number> = {};
    const byTypeDocument: Record<string, number> = {};
    const byCategorie: Record<string, number> = {};
    const byAnnee: Record<string | number, number> = {};
    const byLieu: Record<string, number> = {};
    const thematicLabels = new Map<string, string>();

    for (const record of this.records) {
      // Par fonds
      if (record.fonds?.trim()) {
        const key = record.fonds.trim();
        byFonds[key] = (byFonds[key] || 0) + 1;
      }

      // Par organisme
      if (record.organismeProducteur?.trim()) {
        const key = record.organismeProducteur.trim();
        byOrganisme[key] = (byOrganisme[key] || 0) + 1;
      }

      // Par thématique
      for (const theme of this.getThemes(record)) {
        const normalized = this.normalizeLabel(theme);
        const key = thematicLabels.get(normalized) || theme;
        thematicLabels.set(normalized, key);
        byThematique[key] = (byThematique[key] || 0) + 1;
      }

      // Par type de document
      if (record.typeDocument?.trim()) {
        const key = record.typeDocument.trim();
        byTypeDocument[key] = (byTypeDocument[key] || 0) + 1;
      }

      // Par catégorie
      if (record.categorieDocumentaire?.trim()) {
        const key = record.categorieDocumentaire.trim();
        byCategorie[key] = (byCategorie[key] || 0) + 1;
      }

      // Par année
      if (record.annee !== undefined && record.annee !== null && record.annee !== '') {
        const key = record.annee;
        byAnnee[key] = (byAnnee[key] || 0) + 1;
      }

      // Par lieu
      if (record.lieuGeographique?.trim()) {
        const key = record.lieuGeographique.trim();
        byLieu[key] = (byLieu[key] || 0) + 1;
      }
    }

    // Trier les distributions par valeur décroissante (sauf années)
    const sortByValueDesc = <T extends Record<string | number, number>>(obj: T): T => {
      const entries = Object.entries(obj);
      entries.sort((a, b) => b[1] - a[1]);
      return Object.fromEntries(entries) as T;
    };

    // Pour les années, trier par clé croissante
    const anneeEntries = Object.entries(byAnnee);
    anneeEntries.sort((a, b) => {
      const numA = Number(a[0]);
      const numB = Number(b[0]);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a[0]).localeCompare(String(b[0]), 'fr');
    });

    return {
      byFonds: sortByValueDesc(byFonds),
      byOrganisme: sortByValueDesc(byOrganisme),
      byThematique: sortByValueDesc(byThematique),
      byTypeDocument: sortByValueDesc(byTypeDocument),
      byCategorie: sortByValueDesc(byCategorie),
      byAnnee: Object.fromEntries(anneeEntries),
      byLieu: sortByValueDesc(byLieu),
    };
  }

  /**
   * Obtient les données pour un graphique spécifique
   */
  getChartData(type: keyof DistributionData, limit?: number): { labels: string[]; data: number[] } {
    const distributions = this.getDistributions();
    const dist = distributions[type] as Record<string | number, number>;
    const entries = Object.entries(dist);

    const limited = limit ? entries.slice(0, limit) : entries;

    return {
      labels: limited.map(([key]) => String(key)),
      data: limited.map(([, value]) => value),
    };
  }

  /**
   * Données pour l'évolution chronologique (ligne du temps)
   */
  getTimelineData(): { labels: string[]; data: number[] } {
    const dist = this.getDistributions().byAnnee;
    const entries = Object.entries(dist);

    // Filtrer seulement les années valides
    const validEntries = entries
      .filter(([key]) => {
        const num = Number(key);
        return !isNaN(num) && num > 1800 && num < 2100;
      })
      .sort((a, b) => Number(a[0]) - Number(b[0]));

    return {
      labels: validEntries.map(([key]) => String(key)),
      data: validEntries.map(([, value]) => value),
    };
  }

  private getThemes(record: ArchiveRecord): string[] {
    const value = record.thematique?.length ? record.thematique : record.thematiqueOriginale;
    if (!value) return [];
    const values = Array.isArray(value) ? value : value.split(/[,;|]/);
    const themes = new Map<string, string>();
    for (const theme of values.map((item) => item.trim()).filter(Boolean)) {
      const normalized = this.normalizeLabel(theme);
      if (!themes.has(normalized)) themes.set(normalized, theme);
    }
    return Array.from(themes.values());
  }

  private normalizeLabel(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * Instance singleton
 */
let statisticsServiceInstance: StatisticsService | null = null;

export function getStatisticsService(records?: ArchiveRecord[]): StatisticsService {
  if (records) {
    statisticsServiceInstance = new StatisticsService(records);
  }
  if (!statisticsServiceInstance) {
    throw new Error('StatisticsService non initialisé.');
  }
  return statisticsServiceInstance;
}

export function resetStatisticsService(): void {
  statisticsServiceInstance = null;
}