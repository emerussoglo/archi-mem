/**
 * Archives·Bénin - API Notice détaillée
 * GET /api/catalog/[id] - Récupère une notice par son ID
 */

import { NextResponse } from 'next/server';
import { loadNoticesOnce, getCachedNotices } from '@/lib/notices-loader';
import { getSearchService } from '@/lib/search';

async function initializeServices() {
  const records = await loadNoticesOnce();
  getSearchService(records);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeServices();

    const { id } = await params;
    const records = getCachedNotices();

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'Catalogue non chargé' },
        { status: 503 }
      );
    }

    const searchService = getSearchService();
    const record = searchService.getById(id);

    if (!record) {
      return NextResponse.json(
        { error: 'Notice non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('[API Catalog Detail] Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne',
      },
      { status: 500 }
    );
  }
}