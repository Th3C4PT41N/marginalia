import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export { pdfjsLib };

/** Extract a normalized text string from a pdf.js text-content payload. */
function textContentToString(content) {
  let out = '';
  for (const item of content.items) {
    if (typeof item.str !== 'string') continue;
    out += item.str;
    if (item.hasEOL) out += '\n';
    else out += ' ';
  }
  return out
    .replace(/\u00ad/g, '')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function parseYear(dateString) {
  if (!dateString) return '';
  const match = String(dateString).match(/(1[5-9]\d{2}|20\d{2}|21\d{2})/);
  return match ? match[1] : '';
}

function cleanPdfString(value) {
  if (!value) return '';
  const trimmed = String(value).replace(/\u0000/g, '').trim();
  if (!trimmed || /^(untitled|unknown|anonymous)$/i.test(trimmed)) return '';
  return trimmed;
}

/**
 * Load a PDF File/Blob into a structured source record.
 * Returns { doc, numPages, pages, meta } — `doc` is the live pdf.js proxy.
 */
export async function loadPdf(file, onProgress) {
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pages = [];
  for (let num = 1; num <= doc.numPages; num += 1) {
    const page = await doc.getPage(num);
    const content = await page.getTextContent();
    pages.push({ num, text: textContentToString(content) });
    page.cleanup();
    onProgress?.(num / doc.numPages);
  }

  let info = {};
  try {
    const metadata = await doc.getMetadata();
    info = metadata?.info ?? {};
  } catch {
    info = {};
  }

  /* pdf.js routes non-standard info keys (e.g. Publisher) into `Custom`. */
  const custom = info.Custom ?? {};
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    doc,
    numPages: doc.numPages,
    pages,
    meta: {
      author: cleanPdfString(info.Author ?? custom.Author),
      year: parseYear(info.CreationDate) || parseYear(info.ModDate),
      title: cleanPdfString(info.Title ?? custom.Title) || baseName,
      publisher: cleanPdfString(info.Publisher ?? custom.Publisher),
    },
  };
}

/**
 * Start rendering a page into a canvas at the requested scale (DPR aware).
 * Returns the render task (cancellable) and the viewport that was used.
 */
export function startPageRender(page, canvas, scale) {
  const viewport = page.getViewport({ scale });
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const ctx = canvas.getContext('2d', { alpha: false });

  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  const task = page.render({
    canvasContext: ctx,
    viewport,
    transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
    background: '#ffffff',
    // 'print' keeps the render loop on setTimeout instead of rAF, so pages
    // still finish while the tab is backgrounded.
    intent: 'print',
  });

  return { task, viewport };
}

/**
 * Build a selectable text layer aligned to the rendered viewport.
 * Mirrors pdf.js's own text layer positioning, then scales each span
 * horizontally so it matches the glyph advance width.
 */
export function buildTextLayer(layer, textContent, viewport, highlight = '') {
  layer.innerHTML = '';
  const needle = highlight.trim().toLowerCase();
  const frag = document.createDocumentFragment();
  const spans = [];

  for (const item of textContent.items) {
    if (!item.str) continue;

    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const fontHeight = Math.hypot(tx[2], tx[3]);
    if (!fontHeight) continue;

    const angle = Math.atan2(tx[1], tx[0]);
    const span = document.createElement('span');
    span.textContent = item.str;
    span.style.left = `${tx[4]}px`;
    span.style.top = `${tx[5] - fontHeight}px`;
    span.style.fontSize = `${fontHeight}px`;
    span.style.fontFamily = 'sans-serif';
    if (angle) span.style.transform = `rotate(${angle}rad)`;
    span.dataset.targetWidth = String(item.width * viewport.scale);

    if (needle && item.str.toLowerCase().includes(needle)) {
      span.classList.add('is-hit');
    }

    spans.push(span);
    frag.appendChild(span);
  }

  layer.appendChild(frag);

  // One measured pass: horizontally scale spans to their true advance width.
  requestAnimationFrame(() => {
    for (const span of spans) {
      const target = Number(span.dataset.targetWidth);
      const actual = span.getBoundingClientRect().width;
      if (!target || !actual) continue;
      const ratio = target / actual;
      if (ratio > 0.05 && Math.abs(ratio - 1) > 0.01) {
        const existing = span.style.transform || '';
        span.style.transform = `${existing} scaleX(${ratio.toFixed(4)})`;
      }
    }
  });

  return layer;
}
