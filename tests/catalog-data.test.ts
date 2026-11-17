import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SearchService } from '../src/lib/search';
import { StatisticsService } from '../src/lib/statistics';
import type { ArchiveRecord } from '../src/types/catalog';

const noticesPath = path.join(process.cwd(), 'public', 'data', 'notices.json');
const notices: ArchiveRecord[] = JSON.parse(readFileSync(noticesPath, 'utf8'));
const sourceColumns = [
  'N°',
  'Cote archivistique',
  'Fonds',
  'Organisme producteur',
  'Organisme détenteur',
  'Thématique',
  'Catégorie documentaire',
  'Type de document',
  'Année',
  'Légende',
];

describe('catalogue JSON local', () => {
  it('contient les 359 notices et toutes les propriétés source attendues', () => {
    expect(notices).toHaveLength(359);
    expect(Object.keys(notices[0].sourceData)).toEqual(sourceColumns);
    expect(notices.every((notice) => sourceColumns.every((column) => column in notice.sourceData))).toBe(true);
    expect(new Set(notices.map((notice) => notice.coteArchivistique)).size).toBe(notices.length);
  });

  it('préserve les colonnes d’origine, les années atypiques et les retours de ligne', () => {
    const multilineNotices = notices.filter((notice) => notice.legende?.includes('\n'));
    expect(multilineNotices).toHaveLength(15);
    expect(multilineNotices[0].sourceData['Légende']).toBe(multilineNotices[0].legende);
    const anomalousYears = notices.filter((notice) => notice.annee === 'S,d');
    expect(anomalousYears).toHaveLength(5);
  });

  it('alimente la recherche, les filtres et les statistiques avec les notices JSON', () => {
    const search = new SearchService(notices);
    const example = notices[0];
    const byCote = search.search({ query: example.coteArchivistique, limit: notices.length });
    const byLegend = search.search({ query: 'Angélique', limit: notices.length });
    const theme = example.thematique?.[0];
    const byTheme = theme
      ? search.search({ thematique: [theme], limit: notices.length })
      : null;
    const combinedFilters = search.search({
      query: example.coteArchivistique,
      fonds: example.fonds ? [example.fonds] : [],
      organismeProducteur: example.organismeProducteur ? [example.organismeProducteur] : [],
      organismeDetenteur: example.organismeDetenteur ? [example.organismeDetenteur] : [],
      thematique: theme ? [theme] : [],
      typeDocument: example.typeDocument ? [example.typeDocument] : [],
      annee: example.annee,
      limit: notices.length,
    });
    const filters = search.getFilterOptions();
    const firstPage = search.search({ page: 1, limit: 10 });
    const secondPage = search.search({ page: 2, limit: 10 });
    const statistics = new StatisticsService(notices).getStatistics();

    expect(byCote.data.some((notice) => notice.id === example.id)).toBe(true);
    expect(byCote.total).toBe(1);
    expect(byLegend.data.some((notice) => notice.id === example.id)).toBe(true);
    expect(byTheme?.data.some((notice) => notice.id === example.id)).toBe(true);
    expect(combinedFilters.total).toBe(1);
    expect(filters.fonds).toHaveLength(4);
    expect(filters.organismeProducteur).toHaveLength(4);
    expect(filters.organismeDetenteur).toHaveLength(4);
    expect(filters.thematique).toHaveLength(11);
    expect(filters.categorieDocumentaire).toHaveLength(1);
    expect(filters.typeDocument).toHaveLength(1);
    expect(filters.annees).toHaveLength(20);
    expect(filters.lieuxGeographiques).toHaveLength(0);
    expect(filters.organismeDetenteur).toContain(example.organismeDetenteur);
    expect(firstPage.total).toBe(359);
    expect(firstPage.data).toHaveLength(10);
    expect(secondPage.data).toHaveLength(10);
    expect(secondPage.data[0].id).not.toBe(firstPage.data[0].id);
    expect(statistics.totalNotices).toBe(notices.length);
    expect(statistics.distinctCotes).toBe(notices.length);
    expect(statistics.distinctAnnees).toBe(20);
    expect(statistics.metadataCompleteness.legende).toBe(notices.length);
  });
});

