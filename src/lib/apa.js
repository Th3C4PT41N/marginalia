/* ------------------------------------------------------------------
   APA 7th edition helpers — in-text citations and reference entries.
------------------------------------------------------------------- */

const SUFFIXES = /^(jr|sr|ii|iii|iv)\.?$/i;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initialsOf(parts) {
  return parts
    .filter(Boolean)
    .map((part) => {
      const pieces = part.split('-').filter(Boolean);
      return pieces
        .map((piece) => `${piece.charAt(0).toUpperCase()}.`)
        .join('-');
    })
    .join(' ');
}

/** "Jane Q. Smith" → "Smith, J. Q."   |   "Smith, Jane" → "Smith, J." */
export function apaAuthorName(raw) {
  const name = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!name) return '';

  if (name.includes(',')) {
    const [lastPart, ...rest] = name.split(',');
    const surname = lastPart.trim();
    const given = rest.join(' ').trim();
    if (!given) return surname;
    const tokens = given.split(/\s+/).filter((t) => !SUFFIXES.test(t));
    const initials = initialsOf(tokens);
    return initials ? `${surname}, ${initials}` : surname;
  }

  const tokens = name.split(/\s+/);
  if (tokens.length === 1) return tokens[0];
  const surname = tokens[tokens.length - 1];
  const given = tokens.slice(0, -1).filter((t) => !SUFFIXES.test(t));
  const initials = initialsOf(given);
  return initials ? `${surname}, ${initials}` : surname;
}

export function splitAuthors(raw) {
  return String(raw || '')
    .split(/\s*;\s*|\s+and\s+/i)
    .map((a) => a.trim())
    .filter(Boolean);
}

/** Surname-only form used inside an in-text citation. */
export function inTextAuthor(raw) {
  const authors = splitAuthors(raw);
  if (!authors.length) return '';
  const surnames = authors.map((a) => {
    const name = a.includes(',') ? a.split(',')[0] : a.trim().split(/\s+/).pop();
    return name.trim();
  });
  if (surnames.length === 1) return surnames[0];
  if (surnames.length === 2) return `${surnames[0]} & ${surnames[1]}`;
  return `${surnames[0]} et al.`;
}

function shortTitle(title) {
  const words = String(title || '').trim().split(/\s+/).slice(0, 4).join(' ');
  return words || 'Untitled';
}

/**
 * In-text citation, e.g. (Smith, 2020, p. 14)
 * @param {object} meta  { author, year, title, publisher }
 * @param {number|string} page
 */
export function inTextCitation(meta, page) {
  const author = inTextAuthor(meta?.author);
  const year = String(meta?.year || '').trim() || 'n.d.';
  const pageLabel =
    page === undefined || page === null || page === '' ? '' : `, p. ${page}`;

  if (!author) {
    return `(${shortTitle(meta?.title)}, ${year}${pageLabel})`;
  }
  return `(${author}, ${year}${pageLabel})`;
}

/** Full reference-list entry as an HTML string. */
export function bibliographyEntry(meta) {
  const authors = splitAuthors(meta?.author).map(apaAuthorName).filter(Boolean);
  let authorPart = '';

  if (authors.length === 1) authorPart = authors[0];
  else if (authors.length === 2) authorPart = `${authors[0]}, & ${authors[1]}`;
  else if (authors.length > 2) {
    authorPart = `${authors.slice(0, -1).join(', ')}, & ${authors[authors.length - 1]}`;
  }

  const year = String(meta?.year || '').trim() || 'n.d.';
  const title = String(meta?.title || '').trim() || 'Untitled';
  const publisher = String(meta?.publisher || '').trim();

  const segments = [];
  if (authorPart) segments.push(`${escapeHtml(authorPart)} (${escapeHtml(year)}).`);
  else segments.push(`(${escapeHtml(year)}).`);

  segments.push(`<i>${escapeHtml(title)}</i>.`);
  if (publisher) segments.push(`${escapeHtml(publisher)}.`);

  return `<p>${segments.join(' ')}</p>`;
}

export function bibliographySortKey(meta) {
  const authors = splitAuthors(meta?.author);
  const first = authors[0] || '';
  const surname = first.includes(',') ? first.split(',')[0] : first.trim().split(/\s+/).pop();
  const key = (surname || meta?.title || '').toLowerCase().replace(/[^a-z0-9 ]/g, '');
  return key || 'zzzz';
}

/** Sorted, de-duplicated reference list. */
export function buildReferenceList(files) {
  const seen = new Set();
  return files
    .filter((file) => {
      if (seen.has(file.id)) return false;
      seen.add(file.id);
      return true;
    })
    .slice()
    .sort((a, b) => bibliographySortKey(a.meta).localeCompare(bibliographySortKey(b.meta)))
    .map((file) => ({
      id: file.id,
      name: file.name,
      html: bibliographyEntry(file.meta),
      complete: Boolean(file.meta?.author && file.meta?.year && file.meta?.title),
    }));
}

/** Standalone, downloadable HTML reference list. */
export function buildBibliographyDocument(files, title = 'References') {
  const entries = buildReferenceList(files);
  const body = entries.length
    ? entries.map((entry) => entry.html).join('\n')
    : '<p>No sources loaded.</p>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0 auto; max-width: 44rem; padding: 4rem 1.5rem 6rem;
    background: #fbf8f2; color: #181511;
    font-family: "Newsreader", Georgia, "Times New Roman", serif;
    font-size: 17px; line-height: 1.7;
  }
  h1 { font-size: 1.6rem; font-weight: 500; letter-spacing: -0.01em; margin: 0 0 0.35rem; }
  .kicker { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.18em;
    text-transform: uppercase; color: #7c7367; margin: 0 0 2rem; }
  .rule { height: 1px; background: rgba(24,21,17,0.14); margin: 0 0 2rem; }
  p { margin: 0 0 1rem; padding-left: 2em; text-indent: -2em; }
  i { font-style: italic; }
  @media print { body { background: #fff; padding: 0; } }
</style>
</head>
<body>
  <p class="kicker">Marginalia · Dissertation Workbench</p>
  <h1>${escapeHtml(title)}</h1>
  <div class="rule"></div>
  <div>${body}</div>
</body>
</html>`;
}
