/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const XLSX = require('xlsx');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'public', 'img', 'Repertoire_Archives.xlsx');
const OUTPUT = path.join(ROOT, 'public', 'data', 'notices.json');

const FIELD_ALIASES = {
  numeroInventaire: ['n', 'no', 'numero', 'numero inventaire', 'n inventaire'],
  coteArchivistique: ['cote', 'cote archivistique', 'reference', 'reference archivistique'],
  fonds: ['fonds', 'fond'],
  organismeProducteur: ['organisme producteur', 'producteur'],
  organismeDetenteur: ['organisme detenteur', 'detenteur'],
  thematique: ['thematique', 'theme'],
  categorieDocumentaire: ['categorie documentaire', 'categorie'],
  typeDocument: ['type de document', 'type document'],
  annee: ['annee', 'year'],
  dateDebut: ['date debut', 'date de debut'],
  dateFin: ['date fin', 'date de fin'],
  dateDocument: ['date', 'date document', 'date du document'],
  titreIntitule: ['titre intitule', 'titre', 'intitule', 'objet', 'sujet'],
  legende: ['legende', 'description'],
  lieuGeographique: ['lieu geographique', 'lieu', 'localisation', 'localite'],
  cheminAcces: ['chemin acces', 'chemin', 'path', 'emplacement'],
};

function normalizeHeader(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function toJsonValue(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  throw new Error(`Type de cellule Excel non pris en charge : ${typeof value}`);
}

function cleanText(value) {
  if (!hasValue(value)) return undefined;
  return String(value).replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function splitThemes(value) {
  const themes = new Map();
  for (const rawTheme of String(value || '').split(/[,;|]/)) {
    const cleaned = cleanText(rawTheme);
    if (!cleaned) continue;
    const key = normalizeHeader(cleaned);
    if (!themes.has(key)) themes.set(key, cleaned);
  }
  return [...themes.values()];
}

function safeSourceHeaders(headers) {
  const counts = new Map();
  return headers.map((header, index) => {
    const base = header || `Colonne ${index + 1}`;
    const count = (counts.get(base) || 0) + 1;
    counts.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });
}

function slug(value) {
  return normalizeHeader(value).replace(/\s+/g, '-');
}

function buildNotices(inputPath = INPUT) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Classeur Excel introuvable : ${inputPath}`);
  }

  const workbook = XLSX.readFile(inputPath, { cellDates: true });
  const notices = [];
  const sheetReports = [];
  const duplicateCotes = new Map();
  const duplicateRows = new Map();

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      raw: true,
      blankrows: true,
    });
    const headerRowIndex = matrix.findIndex((row) =>
      Array.from({ length: row.length }, (_, index) => row[index]).some(hasValue)
    );

    if (headerRowIndex < 0) {
      sheetReports.push({ sheet: sheetName, sourceRows: 0, notices: 0, emptyRows: 0 });
      continue;
    }

    const sourceHeaders = Array.from(
      { length: matrix[headerRowIndex].length },
      (_, index) => String(matrix[headerRowIndex][index] ?? '').trim()
    );
    const outputHeaders = safeSourceHeaders(sourceHeaders);
    const normalizedHeaders = sourceHeaders.map(normalizeHeader);
    const mappedColumns = new Map();

    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      const normalizedAliases = aliases.map(normalizeHeader);
      const columnIndex = normalizedHeaders.findIndex((header) => normalizedAliases.includes(header));
      if (columnIndex >= 0) mappedColumns.set(field, columnIndex);
    }

    const serialColumn = mappedColumns.get('numeroInventaire');
    const knownColumns = new Set(mappedColumns.values());
    const descriptiveColumns = sourceHeaders
      .map((_, index) => index)
      .filter((index) => index !== serialColumn);

    if (descriptiveColumns.length === 0) {
      throw new Error(`Aucune colonne descriptive en dehors du numéro dans la feuille « ${sheetName} ».`);
    }

    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : { s: { r: 0 } };
    let skippedRows = 0;
    let sourceRows = 0;

    for (let matrixIndex = headerRowIndex + 1; matrixIndex < matrix.length; matrixIndex += 1) {
      const cells = matrix[matrixIndex];
      if (!Array.from({ length: cells.length }, (_, index) => cells[index]).some(hasValue)) continue;
      sourceRows += 1;

      const hasDescriptiveData = descriptiveColumns.some((index) => hasValue(cells[index]));
      if (!hasDescriptiveData) {
        skippedRows += 1;
        continue;
      }

      const sourceRow = range.s.r + matrixIndex + 1;
      const sourceData = Object.fromEntries(
        outputHeaders.map((header, index) => [header, toJsonValue(cells[index])])
      );
      const extraFields = Object.fromEntries(
        sourceHeaders
          .map((header, index) => ({ header: outputHeaders[index], index }))
          .filter(({ index }) => !knownColumns.has(index))
          .map(({ header, index }) => [header, toJsonValue(cells[index])])
      );

      const notice = {
        id: `${slug(sheetName)}-row-${sourceRow}`,
        sourceSheet: sheetName,
        sourceRow,
        sourceData,
        champsSupplementaires: extraFields,
      };

      for (const [field, columnIndex] of mappedColumns) {
        const value = cells[columnIndex];
        if (!hasValue(value)) continue;
        if (field === 'thematique') {
          notice.thematiqueOriginale = String(value);
          notice.thematique = splitThemes(value);
        } else if (field === 'legende') {
          notice.legende = String(value).trim();
        } else if (field === 'numeroInventaire' || field === 'annee') {
          notice[field] = toJsonValue(value);
        } else {
          notice[field] = cleanText(value);
        }
      }

      notices.push(notice);

      const cote = notice.coteArchivistique;
      if (cote) {
        const key = normalizeHeader(cote).replace(/\s+/g, '');
        duplicateCotes.set(key, [...(duplicateCotes.get(key) || []), { cote, sourceRow }]);
      }
      const recordKey = JSON.stringify(
        sourceHeaders.map((_, index) => index === serialColumn ? null : toJsonValue(cells[index]))
      );
      duplicateRows.set(recordKey, [...(duplicateRows.get(recordKey) || []), sourceRow]);
    }

    sheetReports.push({
      sheet: sheetName,
      sourceRows,
      notices: notices.filter((notice) => notice.sourceSheet === sheetName).length,
      skippedRows,
      headers: sourceHeaders,
    });
  }

  const duplicateCoteGroups = [...duplicateCotes.values()].filter((group) => group.length > 1);
  const duplicateRowGroups = [...duplicateRows.values()].filter((group) => group.length > 1);

  return {
    notices,
    report: {
      sheets: sheetReports,
      totalNotices: notices.length,
      duplicateCotes: duplicateCoteGroups,
      duplicateRows: duplicateRowGroups,
    },
  };
}

function main() {
  const { notices, report } = buildNotices();
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(notices, null, 2)}\n`, 'utf8');

  console.log(`Notices générées : ${report.totalNotices}`);
  for (const sheet of report.sheets) {
    console.log(`${sheet.sheet} : ${sheet.notices} notices, ${sheet.skippedRows} lignes sans métadonnées`);
  }
  console.log(`Cotes en doublon : ${report.duplicateCotes.length} groupe(s)`);
  console.log(`Lignes complètes en doublon : ${report.duplicateRows.length} groupe(s)`);

  if (report.duplicateCotes.length > 0) {
    console.warn('Les notices avec cotes répétées ont été conservées :', JSON.stringify(report.duplicateCotes));
  }
  if (report.duplicateRows.length > 0) {
    console.warn('Les lignes répétées ont été conservées :', JSON.stringify(report.duplicateRows));
  }
  console.log(`JSON écrit : ${path.relative(ROOT, OUTPUT)}`);
}

if (require.main === module) main();

module.exports = { buildNotices };
