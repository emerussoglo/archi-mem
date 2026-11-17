/**
 * Archives·Bénin - Health Check
 * GET /api/health - Vérifie l'état du service et du chargement du catalogue
 */

import { NextResponse } from 'next/server';
import { loadNoticesOnce, getCachedNotices, clearNoticesCache } from '@/lib/notices-loader';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'notices.json');
    const fileExists = fs.existsSync(filePath);
    let fileSize = 0;
    let lastModified: Date | null = null;

    if (fileExists) {
      const stats = fs.statSync(filePath);
      fileSize = stats.size;
      lastModified = stats.mtime;
    }

    let loadError: string | null = null;
    if (!getCachedNotices() && fileExists) {
      try {
        await loadNoticesOnce();
      } catch (error) {
        loadError = error instanceof Error ? error.message : 'Erreur inconnue';
      }
    }

    const cachedRecords = getCachedNotices();
    const isLoaded = cachedRecords !== null && cachedRecords.length > 0;
    const recordCount = cachedRecords?.length || 0;
    const status = isLoaded ? 'healthy' : (fileExists ? 'degraded' : 'unhealthy');

    const result = {
      status,
      timestamp: new Date().toISOString(),
      catalog: {
        file: 'public/data/notices.json',
        fileExists,
        fileSize,
        lastModified: lastModified?.toISOString() || null,
        isLoaded,
        recordCount,
        loadError,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    return NextResponse.json(result, { status: isLoaded ? 200 : 503 });
  } catch (error) {
    console.error('[API Health] Erreur:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erreur interne',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Endpoint pour forcer le rechargement du catalogue
  try {
    clearNoticesCache();
    const records = await loadNoticesOnce();

    return NextResponse.json({
      success: true,
      message: 'Catalogue rechargé',
      recordCount: records.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API Health Reload] Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du rechargement',
      },
      { status: 500 }
    );
  }
}