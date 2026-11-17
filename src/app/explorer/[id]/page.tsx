import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadNoticesOnce } from '@/lib/notices-loader';

export default async function ArchiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const records = await loadNoticesOnce();
  const record = records.find((item) => item.id === id);

  if (!record) notFound();

  const themes = record.thematique || [];
  const fields = [
    { label: 'Cote archivistique', value: record.coteArchivistique, icon: 'fa-hashtag' },
    { label: "Numéro d'inventaire", value: record.numeroInventaire, icon: 'fa-list-ol' },
    { label: 'Fonds documentaire', value: record.fonds, icon: 'fa-box-archive' },
    { label: 'Organisme producteur', value: record.organismeProducteur, icon: 'fa-building' },
    { label: 'Organisme détenteur', value: record.organismeDetenteur, icon: 'fa-building-columns' },
    { label: 'Année', value: record.annee, icon: 'fa-calendar' },
    { label: 'Date de début', value: record.dateDebut, icon: 'fa-calendar' },
    { label: 'Date de fin', value: record.dateFin, icon: 'fa-calendar' },
    { label: 'Date du document', value: record.dateDocument, icon: 'fa-calendar' },
    { label: 'Catégorie documentaire', value: record.categorieDocumentaire?.replace(/_/g, ' '), icon: 'fa-folder-open' },
    { label: 'Type de document', value: record.typeDocument, icon: 'fa-file-lines' },
    { label: 'Lieu géographique', value: record.lieuGeographique, icon: 'fa-location-dot' },
    { label: "Chemin d'accès", value: record.cheminAcces, icon: 'fa-link' },
  ];

  return (
    <article className="detail-page">
      <Link href="/explorer" className="detail-page__back">
        <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Retour aux résultats
      </Link>

      <header className="detail-identity">
        <div className="detail-identity__top">
          <span className="eyebrow">Notice archivistique</span>
          <span className="detail-identity__number">N° {record.numeroInventaire || '—'}</span>
        </div>
        <h1>{record.coteArchivistique || record.titreIntitule || 'Notice archivistique'}</h1>
        <div className="archive-card__badges">
          {record.categorieDocumentaire && (
            <span className="archive-card__badge archive-card__badge--blue">
              {record.categorieDocumentaire.replace(/_/g, ' ')}
            </span>
          )}
          {record.typeDocument && <span className="archive-card__badge">{record.typeDocument}</span>}
          {record.annee && (
            <span className="archive-card__badge">
              <i className="fa-regular fa-calendar" aria-hidden="true" /> {record.annee}
            </span>
          )}
        </div>
      </header>

      {record.legende && (
        <section className="detail-section" aria-labelledby="legend-title">
          <h2 id="legend-title" className="eyebrow">Légende</h2>
          <p className="detail-legend">{record.legende}</p>
        </section>
      )}

      <section className="detail-section" aria-labelledby="description-title">
        <h2 id="description-title" className="eyebrow">Description archivistique</h2>
        <dl className="detail-metadata">
          {fields.filter((field) => field.value !== undefined && field.value !== '').map((field) => (
            <div className="detail-metadata__item" key={field.label}>
              <dt><i className={`fa-solid ${field.icon}`} aria-hidden="true" /> {field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
          {record.titreIntitule && (
            <div className="detail-metadata__item detail-metadata__item--wide">
              <dt><i className="fa-solid fa-heading" aria-hidden="true" /> Titre / intitulé</dt>
              <dd>{record.titreIntitule}</dd>
            </div>
          )}
          {themes.length > 0 && (
            <div className="detail-metadata__item detail-metadata__item--wide">
              <dt><i className="fa-solid fa-tags" aria-hidden="true" /> Thématiques</dt>
              <dd className="detail-tags">
                {themes.map((theme) => <span key={theme}>{theme}</span>)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {Object.entries(record.champsSupplementaires).some(([, value]) => value !== null) && (
        <section className="detail-section" aria-labelledby="extra-fields-title">
          <h2 id="extra-fields-title" className="eyebrow">Autres champs de la source</h2>
          <dl className="detail-metadata">
            {Object.entries(record.champsSupplementaires)
              .filter(([, value]) => value !== null)
              .map(([label, value]) => (
                <div className="detail-metadata__item" key={label}>
                  <dt>{label}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
          </dl>
        </section>
      )}

      <p className="detail-notice">
        Cette notice décrit une ressource conservée par l&apos;organisme détenteur. Le portail ne diffuse pas les fichiers ; les conditions d&apos;accès s&apos;obtiennent auprès du service d&apos;archives.
      </p>

      <div className="detail-actions">
        <Link href="/explorer" className="button button--primary">
          <i className="fa-solid fa-list" aria-hidden="true" /> Revenir aux résultats
        </Link>
        <Link
          href={`/contact?cote=${encodeURIComponent(record.coteArchivistique || '')}`}
          className="button button--outline"
        >
          Demander l&apos;accès à la ressource
        </Link>
      </div>
    </article>
  );
}
