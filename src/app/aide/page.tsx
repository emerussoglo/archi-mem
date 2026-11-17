"use client";

import Link from 'next/link';

const FAQ_CATEGORIES = [
  {
    id: 'general',
    title: 'Questions générales',
    icon: 'fa-solid fa-circle-question',
    questions: [
      {
        q: "Qu'est-ce qu'Archives·Bénin ?",
        a: "Archives·Bénin est une plateforme numérique de recherche et de consultation de ressources archivistiques. Elle permet aux étudiants, chercheurs, historiens, documentalistes et autres utilisateurs de retrouver facilement des notices archivistiques à partir d'un catalogue numérique."
      },
      {
        q: "Quelle est la source des données ?",
        a: "Les données affichées proviennent de public/data/notices.json, généré localement à partir de la feuille Saisie_Rapide du classeur Repertoire_Archives.xlsx. Les champs proposés dans les filtres sont construits depuis les valeurs effectivement présentes dans les notices."
      },
      {
        q: "À quelle fréquence les données sont-elles mises à jour ?",
        a: "Après modification du classeur source, exécutez npm run data:build pour régénérer le JSON, puis redéployez l'application. Le catalogue JSON est conservé en mémoire pendant la vie de chaque instance serveur."
      },
      {
        q: "L'accès est-il gratuit ?",
        a: "Oui, l'accès à la plateforme est entièrement gratuit et sans inscription requise."
      },
    ],
  },
  {
    id: 'recherche',
    title: 'Recherche et filtres',
    icon: 'fa-solid fa-magnifying-glass',
    questions: [
      {
        q: "Comment fonctionne la recherche simple ?",
        a: "La barre de recherche principale effectue une recherche full-text simultanée dans tous les champs : cote archivistique, fonds, organisme producteur, thématique, catégorie documentaire, type de document, année, titre/intitulé, légende et lieu géographique. Elle ignore la casse, les accents, et permet la recherche partielle (ex: 'sant' trouvera 'santé', 'santé publique', etc.)."
      },
      {
        q: "Comment utiliser la recherche avancée ?",
        a: "Utilisez les filtres de la colonne latérale ou ouvrez les filtres avancés. Les options de fonds, organismes, thématiques, types et années sont construites à partir des données réelles disponibles. Un lieu n'est filtrable que si une valeur de lieu est structurée dans la source."
      },
      {
        q: "Puis-je combiner plusieurs filtres ?",
        a: "Oui, tous les filtres sont combinables. Par exemple, vous pouvez rechercher toutes les ressources du fonds 'UNICEF' concernant la thématique 'santé', produites entre 2000 et 2010. Chaque filtre supplémentaire affine les résultats (opérateur ET)."
      },
      {
        q: "Comment réinitialiser les filtres ?",
        a: "Un bouton 'Tout effacer' ou 'Réinitialiser' est disponible dans la barre d'outils et dans le panneau des filtres avancés. Il remet tous les critères à zéro et recharge la liste complète."
      },
    ],
  },
  {
    id: 'resultats',
    title: 'Résultats et consultation',
    icon: 'fa-solid fa-file-lines',
    questions: [
      {
        q: "Comment sont affichés les résultats ?",
        a: "Les résultats sont présentés sous forme de cartes (notices archivistiques) affichant les informations essentielles : titre, cote, fonds, organisme, thématique, année, type de document, lieu. La pagination permet de naviguer (20 résultats par page par défaut, modifiable)."
      },
      {
        q: "Comment consulter le détail d'une notice ?",
        a: "Cliquez sur une carte pour ouvrir un aperçu, ou sur 'Voir la notice' pour accéder à sa fiche. Les champs absents de la source ne sont pas inventés et ne sont pas affichés."
      },
      {
        q: "Le chemin d'accès permet-il d'ouvrir le document ?",
        a: "Le chemin d'accès est affiché comme une métadonnée informative. Le navigateur ne peut pas ouvrir automatiquement des fichiers locaux pour des raisons de sécurité. Copiez le chemin pour l'utiliser dans votre explorateur de fichiers ou système d'archivage."
      },
    ],
  },
  {
    id: 'champs',
    title: 'Comprendre les champs',
    icon: 'fa-solid fa-tag',
    questions: [
      {
        q: "Que signifie 'Cote archivistique' ?",
        a: "C'est le code de référence unique qui identifie une notice dans le système de classement archivistique (ex: '1F/23/45'). Elle permet de localiser physiquement ou logiquement le document."
      },
      {
        q: "Quelle est la différence entre 'Fonds' et 'Organisme producteur' ?",
        a: "Le 'Fonds' est l'ensemble organique de documents produits/réunis par une même entité. L''Organisme producteur/détenteur' est l'institution, l'administration ou la personne qui a produit ou détient les documents. Un fonds peut être associé à un ou plusieurs organismes."
      },
      {
        q: "À quoi correspondent 'Thématique', 'Catégorie' et 'Type' ?",
        a: "• Thématique : sujet ou domaine traité (ex: Santé, Éducation, Agriculture)\n• Catégorie documentaire : nature intellectuelle (ex: Rapport, Correspondance, Plan, Photographie)\n• Type de document : support ou format (ex: Papier, Numérique, Microfilm, Audiovisuel)"
      },
      {
        q: "Comment sont gérées les années ?",
        a: "L'année peut être une valeur exacte (ex: 2020) ou une période. La recherche avancée permet de filtrer par année exacte ou par intervalle (année de début / année de fin). Les valeurs non numériques ou aberrantes sont ignorées dans les tris chronologiques."
      },
    ],
  },
  {
    id: 'technique',
    title: 'Aspects techniques',
    icon: 'fa-solid fa-book-open',
    questions: [
      {
        q: "Comment les données Excel sont-elles converties ?",
        a: "Le script local utilise SheetJS (xlsx) pour lire toutes les feuilles du classeur .xlsx et générer public/data/notices.json. L'application consulte ensuite le JSON, pas le classeur directement."
      },
      {
        q: "Combien de notices la plateforme peut-elle gérer ?",
        a: "Le catalogue actuel contient 359 notices exploitables. Le nombre de notices et les statistiques sont calculés depuis public/data/notices.json."
      },
      {
        q: "Comment sont calculées les statistiques ?",
        a: "Tous les indicateurs (totaux, distincts, graphiques) sont calculés en temps réel à partir des données chargées en mémoire. Aucune valeur n'est codée en dur. Les graphiques utilisent des données agrégées côté serveur et sont rendus côté client avec du CSS/SVG natif (pas de bibliothèque lourde)."
      },
      {
        q: "La plateforme fonctionne-t-elle hors ligne ?",
        a: "Non, c'est une application web Next.js qui nécessite un serveur Node.js pour l'API et le rendu. Cependant, une fois la page chargée, la navigation entre les sections (via les liens Next.js) est fluide."
      },
    ],
  },
];

const SEARCH_TIPS = [
  { tip: "Utilisez des mots-clés simples", example: "santé 2020" },
  { tip: "Recherchez par cote exacte", example: "1F/23/45" },
  { tip: "Combinez termes et filtres", example: "rapport + filtre fonds=UNICEF" },
  { tip: "La recherche ignore les accents", example: "sante = santé" },
  { tip: "Filtrez par intervalle d'années", example: "1990 - 2000" },
];

export default function AidePage() {
  return (
    <div className="help-page">
      <header className="page-intro">
        <p className="eyebrow">Aide</p>
        <h1>Utiliser le répertoire</h1>
        <p>Quelques repères pour rechercher une ressource, lire une notice et comprendre ce que le répertoire contient réellement.</p>
      </header>

      <section className="help-steps" aria-label="Étapes de consultation">
        {[
          { icon: 'fa-magnifying-glass', title: '1. Rechercher', text: 'Un mot, une cote, une année.' },
          { icon: 'fa-sliders', title: '2. Affiner', text: 'Combiner les filtres utiles.' },
          { icon: 'fa-file-lines', title: '3. Consulter', text: 'Lire la notice complète.' },
        ].map((step) => (
          <div className="help-step" key={step.title}>
            <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
            <strong>{step.title}</strong>
            <span>{step.text}</span>
          </div>
        ))}
      </section>

      <section className="faq-list" aria-label="Questions fréquentes">
        {FAQ_CATEGORIES.map((category) => (
          <div className="faq-category" key={category.id}>
            <h2><i className={category.icon} aria-hidden="true" /> {category.title}</h2>
            {category.questions.map((question) => (
              <details className="faq-item" key={question.q}>
                <summary>{question.q}<i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary>
                <p>{question.a}</p>
              </details>
            ))}
          </div>
        ))}
      </section>

      <ul className="search-tips" aria-label="Conseils de recherche">
        {SEARCH_TIPS.map((tip) => (
          <li key={tip.tip}><i className="fa-solid fa-check" aria-hidden="true" /> <span>{tip.tip}: <code>{tip.example}</code></span></li>
        ))}
      </ul>

      <p className="help-contact">Vous avez une question sur une notice ? <Link href="/contact">Écrire au répertoire</Link></p>
    </div>
  );
}