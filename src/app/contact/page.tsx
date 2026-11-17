import ContactForm from './ContactForm';

interface ContactPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const cote = params.cote;
  const initialSubject = Array.isArray(cote) ? cote[0] : cote;

  return (
    <div className="contact-page">
      <section className="contact-copy">
        <p className="eyebrow">Contact</p>
        <h1>Écrire au<br />répertoire</h1>
        <p className="contact-copy__intro">
          Une question sur une notice, une demande de consultation ou une précision à apporter ? Utilisez ce formulaire.
        </p>
        <div className="contact-guidance">
          <div>
            <i className="fa-solid fa-hashtag" aria-hidden="true" />
            <p><strong>Précisez la cote</strong><span>Indiquer la cote (par exemple UNICEF-BEN_ATV_001) accélère le traitement.</span></p>
          </div>
          <div>
            <i className="fa-solid fa-lock" aria-hidden="true" />
            <p><strong>Aucun fichier transmis</strong><span>Le portail ne diffuse pas les photographies ; les demandes d&apos;accès sont traitées par le service d&apos;archives.</span></p>
          </div>
        </div>
      </section>

      <ContactForm initialSubject={initialSubject ? `Demande de consultation — ${initialSubject}` : ''} />
    </div>
  );
}
