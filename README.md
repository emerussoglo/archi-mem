# Archives·Bénin

Portail local de consultation du répertoire des archives UNICEF au Bénin. L'application utilise les notices JSON comme source principale ; le classeur Excel original est uniquement lu par le script explicite de régénération.

## Audit du classeur source

Le fichier `public/img/Repertoire_Archives.xlsx` contient une feuille (`Saisie_Rapide`, plage `A1:J500`) et 499 lignes numérotées. Parmi elles, 359 lignes ont des métadonnées et deviennent des notices ; les 140 restantes ne contiennent que le numéro séquentiel et sont ignorées comme lignes vides, sans modifier le classeur.

Colonnes disponibles : numéro d'inventaire, cote archivistique, fonds, organisme producteur, organisme détenteur, thématiques, catégorie documentaire, type de document, année et légende. La cote est unique dans les 359 notices ; aucun doublon de cote ou de ligne complète n'a été détecté. Quinze légendes contiennent des retours à la ligne, conservés dans le JSON. Cinq années contiennent la valeur atypique `S,d` (lignes source 228 à 232) : elles restent intactes et sont signalées, pas corrigées automatiquement. Les légendes contiennent aussi des dates en texte ; aucune colonne de date, de titre, de lieu structuré ou de chemin d'accès n'existe dans le classeur.

## Générer et utiliser les notices

`public/data/notices.json` est le catalogue lu par les routes API, la recherche, les filtres, les statistiques et les fiches descriptives. Chaque notice garde sa feuille et son numéro de ligne source, les champs archivistiques associés, les thématiques séparées et toutes les cellules d'origine dans `sourceData`. Les éventuels doublons restent dans le JSON ; le script les signale sans les supprimer.

Après une mise à jour du fichier Excel, régénérez le JSON localement :

```bash
npm run data:build
```

Le traitement ne contacte aucun service externe et n'écrit jamais dans le classeur original.

## Développement et validation

```bash
npm ci
npm run dev
```

Le site est servi sur `http://localhost:3000`. Vérifications :

```bash
npm test
npm run lint
npm run build
```

## API

- `GET /api/health` vérifie le JSON local et son chargement.
- `GET /api/catalog` recherche et pagine les notices, y compris les valeurs source conservées.
- `GET /api/catalog/filters` renvoie les options présentes dans le JSON.
- `GET /api/catalog/{id}` renvoie une notice.
- `GET /api/statistics` calcule les indicateurs depuis les mêmes notices ; `?type=distribution` fournit les répartitions.

La configuration de traçage Next.js inclut le JSON dans les fonctions API et la route dynamique des notices pour le déploiement Vercel.
