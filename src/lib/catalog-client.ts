import type { ArchiveRecord, DistributionData, SearchParams, Statistics } from '@/types/catalog';
import { SearchService } from '@/lib/search';
import { StatisticsService } from '@/lib/statistics';

let cachedNotices: ArchiveRecord[] | null = null;
let noticesRequest: Promise<ArchiveRecord[]> | null = null;

function isArchiveRecord(value: unknown): value is ArchiveRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.coteArchivistique === 'string' &&
    typeof record.fonds === 'string' &&
    typeof record.sourceData === 'object' &&
    record.sourceData !== null
  );
}

export function loadCatalogNotices(forceReload = false): Promise<ArchiveRecord[]> {
  if (forceReload) {
    cachedNotices = null;
    noticesRequest = null;
  }
  if (cachedNotices) return Promise.resolve(cachedNotices);
  if (!noticesRequest) {
    noticesRequest = fetch('/data/notices.json', {
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Impossible de charger /data/notices.json (HTTP ${response.status}).`);
        }
        const parsed: unknown = await response.json();
        if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isArchiveRecord)) {
          throw new Error('/data/notices.json ne contient pas un tableau de notices valide.');
        }
        cachedNotices = parsed;
        return parsed;
      })
      .catch((error: unknown) => {
        noticesRequest = null;
        throw error instanceof Error ? error : new Error('Erreur inconnue pendant le chargement des notices.');
      });
  }
  return noticesRequest;
}

export function resetCatalogNoticesCache(): void {
  cachedNotices = null;
  noticesRequest = null;
}

export async function searchCatalogNotices(params: SearchParams) {
  const records = await loadCatalogNotices();
  return new SearchService(records).search(params);
}

export async function getCatalogFilters() {
  const records = await loadCatalogNotices();
  return new SearchService(records).getFilterOptions();
}

export async function getCatalogNotice(id: string): Promise<ArchiveRecord | undefined> {
  const records = await loadCatalogNotices();
  return records.find((record) => record.id === id);
}

export async function getCatalogStatistics(): Promise<Statistics> {
  const records = await loadCatalogNotices();
  return new StatisticsService(records).getStatistics();
}

export async function getCatalogDistributions(): Promise<DistributionData> {
  const records = await loadCatalogNotices();
  return new StatisticsService(records).getDistributions();
}
