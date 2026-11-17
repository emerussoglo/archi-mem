/**
 * Archives·Bénin - API Statistiques globales
 * GET /api/statistics - Indicateurs globaux
 * GET /api/statistics/distribution - Données pour graphiques
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadNoticesOnce, getCachedNotices } from '@/lib/notices-loader';
import { getStatisticsService } from '@/lib/statistics';
import type { DistributionData } from '@/types/catalog';

function isDistributionType(type: string): type is keyof DistributionData {
  return [
    'byFonds',
    'byOrganisme',
    'byThematique',
    'byTypeDocument',
    'byCategorie',
    'byAnnee',
    'byLieu',
  ].includes(type);
}

async function initializeServices() {
  const records = await loadNoticesOnce();
  getStatisticsService(records);
}

export async function GET(request: NextRequest) {
  try {
    await initializeServices();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'global' | 'distribution' | 'timeline' | specific chart
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const records = getCachedNotices();

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'Catalogue non chargé' },
        { status: 503 }
      );
    }

    const statsService = getStatisticsService();

    // Statistiques globales
    if (!type || type === 'global') {
      const stats = statsService.getStatistics();
      return NextResponse.json({ success: true, data: stats });
    }

    // Distribution complète
    if (type === 'distribution') {
      const dist = statsService.getDistributions();
      return NextResponse.json({ success: true, data: dist });
    }

    // Timeline (évolution chronologique)
    if (type === 'timeline') {
      const timeline = statsService.getTimelineData();
      return NextResponse.json({ success: true, data: timeline });
    }

    // Graphique spécifique
    if (isDistributionType(type)) {
      const chartData = statsService.getChartData(type, limit);
      return NextResponse.json({ success: true, data: chartData });
    }

    return NextResponse.json(
      { error: 'Type de statistique non reconnu' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API Statistics] Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne',
      },
      { status: 500 }
    );
  }
}