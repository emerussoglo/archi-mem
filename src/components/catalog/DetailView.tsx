"use client";

import { ArchiveRecord } from '@/types/catalog';
import { Modal } from '@/components/ui/Modal';

interface DetailViewProps {
  record: ArchiveRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

type DisplayFieldKey =
  | 'numeroInventaire'
  | 'coteArchivistique'
  | 'fonds'
  | 'organismeProducteur'
  | 'organismeDetenteur'
  | 'thematique'
  | 'categorieDocumentaire'
  | 'typeDocument'
  | 'annee'
  | 'dateDebut'
  | 'dateFin'
  | 'dateDocument'
  | 'titreIntitule'
  | 'legende'
  | 'lieuGeographique'
  | 'cheminAcces';

const FIELD_CONFIG: {
  key: DisplayFieldKey;
  label: string;
  icon: string;
}[] = [
  { key: 'numeroInventaire', label: "Numéro d'inventaire", icon: 'fa-solid fa-hashtag' },
  { key: 'coteArchivistique', label: 'Cote archivistique', icon: 'fa-solid fa-hashtag' },
  { key: 'fonds', label: 'Fonds', icon: 'fa-solid fa-building' },
  { key: 'organismeProducteur', label: 'Organisme producteur', icon: 'fa-solid fa-building' },
  { key: 'organismeDetenteur', label: 'Organisme détenteur', icon: 'fa-solid fa-building-columns' },
  { key: 'thematique', label: 'Thématique', icon: 'fa-solid fa-folder-open' },
  { key: 'categorieDocumentaire', label: 'Catégorie documentaire', icon: 'fa-solid fa-tag' },
  { key: 'typeDocument', label: 'Type de document', icon: 'fa-solid fa-file-lines' },
  { key: 'annee', label: 'Année', icon: 'fa-solid fa-calendar' },
  { key: 'dateDebut', label: 'Date de début', icon: 'fa-solid fa-calendar' },
  { key: 'dateFin', label: 'Date de fin', icon: 'fa-solid fa-calendar' },
  { key: 'dateDocument', label: 'Date du document', icon: 'fa-solid fa-calendar' },
  { key: 'titreIntitule', label: 'Titre / Intitulé', icon: 'fa-solid fa-file-lines' },
  { key: 'legende', label: 'Légende', icon: 'fa-solid fa-file-lines' },
  { key: 'lieuGeographique', label: 'Lieu géographique', icon: 'fa-solid fa-location-dot' },
  { key: 'cheminAcces', label: "Chemin d'accès", icon: 'fa-solid fa-arrow-up-right-from-square' },
] as const;

export function DetailView({ record, isOpen, onClose }: DetailViewProps) {
  if (!record) return null;

  const renderValue = (value: string | number | string[] | undefined, key: string) => {
    if (!value && value !== 0) return null;
    if (Array.isArray(value)) return value.join(', ');

    // Pour le chemin d'accès, afficher comme du code
    if (key === 'cheminAcces') {
      return (
        <code className="detail-field__value--code break-all">
          {value}
        </code>
      );
    }

    // Pour la légende, permettre le multiligne
    if (key === 'legende') {
      return <p className="whitespace-pre-wrap detail-field__value">{value}</p>;
    }

    return <span className="detail-field__value">{String(value)}</span>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record.titreIntitule || 'Détail de la notice'}
      size="lg"
      closeOnOverlayClick={true}
      closeOnEscape={true}
      showCloseButton={true}
    >
      <div className="detail-modal">
        <div className="detail-modal__heading">
          <div>
            <h2>{record.titreIntitule || record.coteArchivistique || 'Notice archivistique'}</h2>
            {record.coteArchivistique && (
              <span className="archive-card__cote">{record.coteArchivistique}</span>
            )}
          </div>
          {record.typeDocument && (
            <span className="archive-card__badge">{record.typeDocument}</span>
          )}
        </div>

        <div className="detail-grid">
          {FIELD_CONFIG.map(({ key, label, icon }) => {
            const value = record[key];
            if (!value && value !== 0) return null;

            const isFullWidth = ['titreIntitule', 'legende', 'cheminAcces'].includes(key);

            return (
              <div
                key={key}
                className={`detail-field ${isFullWidth ? 'detail-field--full' : ''}`}
              >
                <dt className="detail-field__label">
                  <i className={icon} aria-hidden="true" />
                  {label}
                </dt>
                <dd>{renderValue(value, key)}</dd>
              </div>
            );
          })}
        </div>

        <div className="detail-modal__actions">
          <button
            onClick={onClose}
            className="button button--outline"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}