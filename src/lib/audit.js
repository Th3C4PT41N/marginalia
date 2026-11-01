/* ------------------------------------------------------------------
   Structural & stylistic consistency auditor.
   Runs deterministic regex passes over the live draft HTML.
------------------------------------------------------------------- */

function htmlToPlainText(html) {
  if (!html) return '';
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;width:600px;visibility:hidden;white-space:pre-wrap;';
  host.innerHTML = html;
  document.body.appendChild(host);
  const text = host.innerText || host.textContent || '';
  host.remove();
  return text.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function contextAround(text, index, length, radius = 34) {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end).replace(/\n/g, ' ')}${suffix}`;
}

function collectMatches(text, regex, { sampleLimit = 3, radius = 34 } = {}) {
  const matches = [];
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  let match;
  let guard = 0;
  while ((match = re.exec(text)) !== null && guard < 5000) {
    guard += 1;
    matches.push({
      value: match[0],
      index: match.index,
      context: contextAround(text, match.index, match[0].length, radius),
    });
    if (match[0].length === 0) re.lastIndex += 1;
  }
  return { count: matches.length, samples: matches.slice(0, sampleLimit), all: matches };
}

const DOUBLE_QUOTES = /["“][^"“”\n]{1,400}["”]/g;
const SINGLE_QUOTES = /(^|[\s([—–])['‘][^'‘’\n]{2,240}['’](?=[\s.,;:!?)\]]|$)/g;
const PUNCT_OUTSIDE = /["”]\s*[,.;:!?]/g;
const TRANSITIONS = [
  { label: 'Furthermore', regex: /\bfurthermore\b/gi },
  { label: 'Consequently', regex: /\bconsequently\b/gi },
  { label: 'It is crucial to note', regex: /\bit is crucial to note\b/gi },
];

export function auditHtml(html) {
  const text = htmlToPlainText(html);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

  // 1 — Mixed single/double quotation marks
  const doubles = collectMatches(text, DOUBLE_QUOTES);
  const singles = collectMatches(text, SINGLE_QUOTES);
  const mixedQuotes = doubles.count > 0 && singles.count > 0;

  const quoteCheck = {
    id: 'quotes',
    label: 'Quotation mark consistency',
    status: mixedQuotes ? 'warn' : 'pass',
    count: mixedQuotes ? Math.min(doubles.count, singles.count) : 0,
    detail: mixedQuotes
      ? `${doubles.count} double-quoted phrase${doubles.count === 1 ? '' : 's'} and ${singles.count} single-quoted phrase${singles.count === 1 ? '' : 's'} appear in the draft. Mixed conventions read as inconsistency — choose one and apply it throughout.`
      : doubles.count > 0
        ? 'Double quotation marks are used consistently.'
        : singles.count > 0
          ? 'Single quotation marks are used consistently.'
          : 'No quoted phrases detected.',
    samples: mixedQuotes
      ? [
          ...doubles.samples.slice(0, 2).map((s) => ({ kind: 'double', text: s.context })),
          ...singles.samples.slice(0, 2).map((s) => ({ kind: 'single', text: s.context })),
        ]
      : [],
    fixable: false,
  };

  // 2 — Punctuation sitting outside a closing quotation mark
  const punct = collectMatches(text, PUNCT_OUTSIDE, { sampleLimit: 4 });
  const punctCheck = {
    id: 'punctuation',
    label: 'Punctuation inside quotation marks',
    status: punct.count > 0 ? 'warn' : 'pass',
    count: punct.count,
    detail:
      punct.count > 0
        ? `${punct.count} closing quote${punct.count === 1 ? ' is' : 's are'} followed by punctuation. In US style, commas and periods belong inside the quotation mark.`
        : 'Commas and periods sit correctly inside closing quotation marks.',
    samples: punct.samples.map((s) => ({ kind: 'punct', text: s.context })),
    fixable: punct.count > 0,
  };

  // 3 — Overused transitional phrases
  const transitionRows = TRANSITIONS.map(({ label, regex }) => {
    const found = collectMatches(text, regex, { sampleLimit: 2 });
    return { label, count: found.count, samples: found.samples };
  });
  const transitionTotal = transitionRows.reduce((sum, row) => sum + row.count, 0);
  const heaviest = transitionRows.slice().sort((a, b) => b.count - a.count)[0];

  const transitionCheck = {
    id: 'transitions',
    label: 'Overused transitions',
    status: transitionTotal >= 4 ? 'warn' : transitionTotal > 0 ? 'info' : 'pass',
    count: transitionTotal,
    detail:
      transitionTotal > 0
        ? `${transitionTotal} mechanical transition${transitionTotal === 1 ? '' : 's'} (${((transitionTotal / Math.max(words, 1)) * 1000).toFixed(1)} per 1,000 words). “${heaviest.label}” accounts for ${heaviest.count}.`
        : 'No flagged transitional phrases. Argument flow is carried by content, not connectives.',
    samples: transitionRows
      .filter((row) => row.count > 0)
      .flatMap((row) =>
        row.samples.map((s) => ({ kind: row.label, text: s.context })),
      )
      .slice(0, 4),
    rows: transitionRows,
    fixable: false,
  };

  const checks = [quoteCheck, punctCheck, transitionCheck];

  return {
    text,
    words,
    checks,
    issueCount: checks.filter((c) => c.status !== 'pass').length,
    flaggedCount: checks.reduce((sum, c) => sum + c.count, 0),
    transitionRows,
  };
}

/** Move punctuation that trails a closing double quote to the inside. */
export function fixPunctuationOutsideQuotes(html) {
  return html.replace(/([”"])(\s*)([,.;:!?])/g, (_match, quote, space, punct) => {
    return `${punct}${quote}${space}`;
  });
}

export { htmlToPlainText };
