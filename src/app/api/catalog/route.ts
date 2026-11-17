/**
 * Archives·Bénin - API Catalogue
 * GET /api/catalog - Liste paginée des notices
 * GET /api/catalog?search=... - Recherche
 * GET /api/catalog?fonds=...&organisme=... - Filtres
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadNoticesOnce, getCachedNotices } from '@/lib/notices-loader';
import { getSearchService } from '@/lib/search';
import type { SearchParams } from '@/types/catalog';

async function initializeServices() {
  const records = await loadNoticesOnce();
  getSearchService(records);
}

export async function GET(request: NextRequest) {
  try {
    await initializeServices();

    const searchParams = request.nextUrl.searchParams;
    const records = getCachedNotices();

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'Catalogue non chargé', data: [], total: 0 },
        { status: 503 }
      );
    }

    const searchService = getSearchService();

    // Paramètres de recherche
    const getValues = (...keys: string[]) => keys
      .flatMap((key) => searchParams.getAll(key))
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter(Boolean);

    const params: SearchParams = {
      query: searchParams.get('q') || searchParams.get('search') || searchParams.get('query') || undefined,
      fonds: getValues('fonds'),
      organismeProducteur: getValues('organismeProducteur', 'organisme'),
      organismeDetenteur: getValues('organismeDetenteur'),
      thematique: getValues('thematique'),
      categorieDocumentaire: getValues('categorieDocumentaire', 'categorie'),
      typeDocument: getValues('typeDocument', 'type'),
      annee: searchParams.get('annee') || undefined,
      anneeDebut: searchParams.get('anneeDebut') || undefined,
      anneeFin: searchParams.get('anneeFin') || undefined,
      lieuGeographique: getValues('lieuGeographique', 'lieu'),
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    };

    const result = searchService.search(params);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[API Catalog] Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne',
        data: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeServices();

    const body = await request.json();
    const searchService = getSearchService();

    const result = searchService.search(body as SearchParams);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[API Catalog] Erreur POST:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne',
        data: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}