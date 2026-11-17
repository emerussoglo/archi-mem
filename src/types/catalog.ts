export type NoticeSourceValue = string | number | boolean | null;

export interface ArchiveRecord {
  id: string;
  sourceSheet: string;
  sourceRow: number;
  sourceData: Record<string, NoticeSourceValue>;
  champsSupplementaires: Record<string, NoticeSourceValue>;
  numeroInventaire?: string | number;
  coteArchivistique?: string;
  fonds?: string;
  organismeProducteur?: string;
  organismeDetenteur?: string;
  thematique?: string[];
  thematiqueOriginale?: string;
  categorieDocumentaire?: string;
  typeDocument?: string;
  annee?: string | number;
  dateDebut?: string | number;
  dateFin?: string | number;
  dateDocument?: string | number;
  titreIntitule?: string;
  legende?: string;
  lieuGeographique?: string;
  cheminAcces?: string;
}

export interface SearchParams {
  query?: string;
  fonds?: string[];
  organismeProducteur?: string[];
  organismeDetenteur?: string[];
  thematique?: string[];
  categorieDocumentaire?: string[];
  typeDocument?: string[];
  annee?: string | number;
  anneeDebut?: string | number;
  anneeFin?: string | number;
  lieuGeographique?: string[];
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterOptions { 
  fonds: string[];
  organismeProducteur: string[];
  organismeDetenteur: string[];
  thematique: string[];
  categorieDocumentaire: string[];
  typeDocument: string[];
  annees: (string | number)[];
  lieuxGeographiques: string[];
}

export interface Statistics {
  totalNotices: number;
  distinctCotes: number;
  distinctFonds: number;
  distinctOrganismes: number;
  distinctThematiques: number;
  distinctCategories: number;
  distinctTypes: number;
  distinctLieux: number;
  distinctAnnees: number;
  metadataCompleteness: {
    annee: number;
    legende: number;
    lieuGeographique: number;
  };
}

export interface DistributionData {
  byFonds: Record<string, number>;
  byOrganisme: Record<string, number>;
  byThematique: Record<string, number>;
  byTypeDocument: Record<string, number>;
  byCategorie: Record<string, number>;
  byAnnee: Record<string | number, number>;
  byLieu: Record<string, number>;
}

export interface CatalogState {
  records: ArchiveRecord[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
