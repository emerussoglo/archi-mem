"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ArchiveRecord,
  SearchParams,
  PaginatedResult,
  FilterOptions,
  Statistics,
  DistributionData,
} from '@/types/catalog';
import {
  getCatalogDistributions,
  getCatalogFilters,
  getCatalogNotice,
  getCatalogStatistics,
  loadCatalogNotices,
  searchCatalogNotices,
} from '@/lib/catalog-client';

interface UseCatalogState {
  records: ArchiveRecord[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

interface UseCatalogActions {
  search: (params: SearchParams) => Promise<PaginatedResult<ArchiveRecord>>;
  getFilters: () => Promise<FilterOptions>;
  getRecord: (id: string) => Promise<ArchiveRecord | undefined>;
  getStatistics: () => Promise<Statistics>;
  getDistributions: () => Promise<DistributionData>;
  refresh: () => Promise<void>;
}

export function useCatalog(): UseCatalogState & UseCatalogActions {
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const loadInitial = useCallback(async (forceReload = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedRecords = await loadCatalogNotices(forceReload);
      setRecords(loadedRecords);
      setTotalCount(loadedRecords.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le catalogue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(
    (params: SearchParams): Promise<PaginatedResult<ArchiveRecord>> => {
      return searchCatalogNotices(params);
    },
    []
  );

  const getFilters = useCallback((): Promise<FilterOptions> => getCatalogFilters(), []);

  const getRecord = useCallback(
    (id: string): Promise<ArchiveRecord | undefined> => getCatalogNotice(id),
    []
  );

  const getStatistics = useCallback((): Promise<Statistics> => getCatalogStatistics(), []);

  const getDistributions = useCallback((): Promise<DistributionData> => getCatalogDistributions(), []);

  const refresh = useCallback(() => loadInitial(true), [loadInitial]);

  useEffect(() => {
    let active = true;
    loadCatalogNotices()
      .then((loadedRecords) => {
        if (!active) return;
        setRecords(loadedRecords);
        setTotalCount(loadedRecords.length);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Impossible de charger le catalogue.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    records,
    isLoading,
    error,
    totalCount,
    search,
    getFilters,
    getRecord,
    getStatistics,
    getDistributions,
    refresh,
  };
}

// Hook spécialisé pour la recherche avec état local
export function useCatalogSearch(initialParams: SearchParams = {}) {
  const { search, getFilters, isLoading: catalogLoading } = useCatalog();
  const [results, setResults] = useState<PaginatedResult<ArchiveRecord>>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<FilterOptions>({
    fonds: [],
    organismeProducteur: [],
    organismeDetenteur: [],
    thematique: [],
    categorieDocumentaire: [],
    typeDocument: [],
    annees: [],
    lieuxGeographiques: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 20,
    ...initialParams,
  });
  const initialParamsRef = useRef(searchParams);
  const searchRequestId = useRef(0);

  const loadFilters = useCallback(async () => {
    try {
      const f = await getFilters();
      setFilters(f);
      setSearchError(null);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Impossible de charger les filtres.');
    }
  }, [getFilters]);

  const executeSearch = useCallback(
    async (params: SearchParams) => {
      const requestId = ++searchRequestId.current;
      setSearchParams(params);
      setIsSearching(true);
      setSearchError(null);
      try {
        const result = await search(params);
        if (requestId === searchRequestId.current) setResults(result);
      } catch (err) {
        if (requestId === searchRequestId.current) {
          setSearchError(err instanceof Error ? err.message : 'La recherche a échoué.');
        }
      } finally {
        if (requestId === searchRequestId.current) setIsSearching(false);
      }
    },
    [search]
  );

  const updateParams = useCallback(
    (newParams: Partial<SearchParams>) => {
      const params = { ...searchParams, ...newParams, page: 1 }; // Reset page on filter change
      executeSearch(params);
    },
    [searchParams, executeSearch]
  );

  const goToPage = useCallback(
    (page: number) => {
      executeSearch({ ...searchParams, page });
    },
    [searchParams, executeSearch]
  );

  const changeLimit = useCallback(
    (limit: number) => {
      executeSearch({ ...searchParams, limit, page: 1 });
    },
    [searchParams, executeSearch]
  );

  const reset = useCallback(() => {
    const params: SearchParams = { page: 1, limit: 20 };
    executeSearch(params);
  }, [executeSearch]);

  useEffect(() => {
    let active = true;
    const requestId = ++searchRequestId.current;

    const loadInitialSearch = async () => {
      try {
        const [filterOptions, result] = await Promise.all([
          getFilters(),
          search(initialParamsRef.current),
        ]);
        if (!active || requestId !== searchRequestId.current) return;
        setFilters(filterOptions);
        setResults(result);
        setSearchError(null);
      } catch (err) {
        if (active && requestId === searchRequestId.current) {
          setSearchError(err instanceof Error ? err.message : 'Impossible de charger les données du catalogue.');
        }
      } finally {
        if (active && requestId === searchRequestId.current) setIsSearching(false);
      }
    };

    void loadInitialSearch();
    return () => {
      active = false;
    };
  }, [getFilters, search]);

  return {
    results,
    filters,
    searchParams,
    searchError,
    isSearching: isSearching || catalogLoading,
    updateParams,
    goToPage,
    changeLimit,
    reset,
    loadFilters,
  };
}

// Hook pour les statistiques
export function useStatistics() {
  const { getStatistics, getDistributions } = useCatalog();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [distributions, setDistributions] = useState<DistributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      const [s, d] = await Promise.all([getStatistics(), getDistributions()]);
      setStats(s);
      setDistributions(d);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  }, [getStatistics, getDistributions]);

  const load = useCallback(async () => {
    setIsLoading(true);
    await fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    let active = true;
    Promise.all([getStatistics(), getDistributions()])
      .then(([nextStats, nextDistributions]) => {
        if (!active) return;
        setStats(nextStats);
        setDistributions(nextDistributions);
        setError(null);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [getStatistics, getDistributions]);

  return { stats, distributions, isLoading, error, refresh: load };
}