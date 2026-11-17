import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ArchiveRecord } from '@/types/catalog';

const DEFAULT_NOTICES_PATH = path.join(process.cwd(), 'public', 'data', 'notices.json');

let noticesCache: ArchiveRecord[] | null = null;
let loadPromise: Promise<ArchiveRecord[]> | null = null;

function isArchiveRecord(value: unknown): value is ArchiveRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.sourceSheet === 'string' &&
    typeof record.sourceRow === 'number' &&
    typeof record.sourceData === 'object' &&
    record.sourceData !== null
  );
}

export async function loadNoticesOnce(filePath = DEFAULT_NOTICES_PATH): Promise<ArchiveRecord[]> {
  if (noticesCache) return noticesCache;
  if (!loadPromise) {
    loadPromise = fs.readFile(filePath, 'utf8')
      .then((contents) => {
        const parsed: unknown = JSON.parse(contents);
        if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isArchiveRecord)) {
          throw new Error('Le fichier notices.json doit contenir un tableau de notices valide.');
        }
        noticesCache = parsed;
        return parsed;
      })
      .catch((error: unknown) => {
        loadPromise = null;
        throw new Error(
          `Impossible de charger le catalogue JSON (${filePath}) : ${
            error instanceof Error ? error.message : 'erreur inconnue'
          }`
        );
      });
  }
  return loadPromise;
}

export function getCachedNotices(): ArchiveRecord[] | null {
  return noticesCache;
}

export function clearNoticesCache(): void {
  noticesCache = null;
  loadPromise = null;
}
