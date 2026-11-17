import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCatalogNotices, resetCatalogNoticesCache } from '../src/lib/catalog-client';

describe('chargement client des notices', () => {
  beforeEach(() => {
    resetCatalogNoticesCache();
  });

  afterEach(() => {
    resetCatalogNoticesCache();
    vi.unstubAllGlobals();
  });

  it('charge et partage le tableau depuis /data/notices.json', async () => {
    const notices = [{
      id: 'notice-1',
      coteArchivistique: 'COTE-001',
      fonds: 'Fonds test',
      sourceData: { 'Cote archivistique': 'COTE-001' },
    }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => notices,
    });
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([
      loadCatalogNotices(),
      loadCatalogNotices(),
    ]);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith('/data/notices.json', {
      headers: { Accept: 'application/json' },
    });
    expect(first).toHaveLength(1);
    expect(second).toBe(first);
  });

  it('signale un HTTP non réussi au lieu de laisser le catalogue en chargement', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => [],
    }));

    await expect(loadCatalogNotices()).rejects.toThrow('HTTP 404');
  });
});
