/**
 * Archives·Bénin - API Filtres
 * GET /api/catalog/filters - Récupère les valeurs disponibles pour tous les filtres
 */

import { NextResponse } from 'next/server';
import { loadNoticesOnce, getCachedNotices } from '@/lib/notices-loader';
import { getSearchService } from '@/lib/search';

async function initializeServices() {
  const records = await loadNoticesOnce();
  getSearchService(records);
}

export async function GET() {
  try {
    await initializeServices();

    const records = getCachedNotices();

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'Catalogue non chargé' },
        { status: 503 }
      );
    }

    const searchService = getSearchService();
    const filters = searchService.getFilterOptions();

    return NextResponse.json({
      success: true,
      filters,
    });
  } catch (error) {
    console.error('[API Filters] Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne',
      },
      { status: 500 }
    );
  }
}