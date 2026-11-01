/* The seeded working draft. Real prose, deliberately imperfect so the
   consistency auditor has something to report on first run. */
export const INITIAL_DRAFT_TITLE = 'Chapter Two — The Annotated Page';

export const INITIAL_DRAFT = `<span class="chapter-kicker">Chapter Two</span>
<h1>The Annotated Page</h1>
<p class="dropcap">In the Folger copy of Bacon's <em>Advancement of Learning</em> (1629), a seventeenth-century reader has done something that no modern edition records: on the verso of the title page, beside the word “method,” they have drawn a small hand with an index finger extended toward the margin. The mark is not decoration. It is an instruction to return.</p>
<p>Scholarship on early modern reading has long treated annotation as evidence of ownership rather than evidence of thought. The distinction is convenient, but it is also false. A marginal note records a decision: the reader has judged a passage worth the cost of ink, and in judging has already begun to interpret. As William Sherman observes, “the margins of early modern books are the closest thing we have to a transcript of reading”. The formulation is useful, though it flatters the evidence, since marginalia preserve only the reading that survived.</p>
<p>Furthermore, the physical form of the note matters as much as its content. A pointing hand, a bracketed paragraph, and a single underlined clause are not interchangeable gestures. Each implies a different theory of what a text is for. The hand says <em>look here</em>; the bracket says <em>this belongs together</em>; the underline says <em>this sentence can be carried elsewhere</em>. Taken together, they describe a reader who expected the book to be disassembled and reused.</p>
<h2>2.3 The Reader as Co-Author</h2>
<p>It is crucial to note that annotation was taught. Schoolbooks of the period frequently supplied printed marginalia as models, and students were expected to imitate them before producing notes of their own. The practice therefore sits awkwardly between reception and composition. What one eighteenth-century cataloguer called 'the furniture of the mind' was, in practice, furniture assembled from other people's sentences.</p>
<blockquote>To read with a pen is to accept that the page is unfinished — that meaning is not deposited by the author but assembled, provisionally, by whoever returns to the text next.</blockquote>
<p>Consequently, the history of annotation is also a history of selection. Not every reader could afford ink, and not every book was permitted a margin. Women's copies, schoolboys' copies, and the copies of servants survive in far smaller numbers than those of gentlemen scholars, which means that the archive of reading is skewed toward the hands that owned the paper. Consequently, any claim about a period's “reading practice” must first answer a question about whose practice was allowed to leave a trace.</p>
<p>Bacon himself described the fragmentary knowledge of his contemporaries as “a dry light”. The image is apt for the marginalist, who works by intermittent illumination rather than continuous argument. A note is a lamp held briefly to one sentence and then withdrawn. What remains is not a summary of the book but a map of the reader's attention, and maps of attention are precisely what literary history has the least evidence for.</p>
<p>This chapter therefore treats annotation as a compositional act in its own right. The notes assembled here are not illustrations of a thesis; they are the thesis, insofar as they show how meaning was actually made — fitfully, in the margins, and often against the grain of the printed page.</p>`;

const DRAFT_STYLES = `
  :root { color-scheme: light; }
  body {
    margin: 0 auto; max-width: 42rem; padding: 5rem 1.5rem 8rem;
    background: #fbf8f2; color: #181511;
    font-family: "Newsreader", Georgia, "Times New Roman", serif;
    font-size: 18px; line-height: 1.78;
    -webkit-font-smoothing: antialiased;
  }
  h1 { font-size: 2rem; font-weight: 400; letter-spacing: -0.015em; margin: 0 0 1.2rem; line-height: 1.15; }
  h2 { font-size: 1.25rem; font-weight: 500; margin: 2.5rem 0 1rem; }
  p { margin: 0 0 1.1rem; }
  .chapter-kicker {
    display: block; font-family: ui-monospace, monospace; font-size: 10px;
    letter-spacing: 0.2em; text-transform: uppercase; color: #ad3829; margin-bottom: 0.75rem;
  }
  .dropcap::first-letter { float: left; font-size: 3.4rem; line-height: 0.78; padding-right: 0.5rem; padding-top: 0.2rem; }
  blockquote {
    margin: 2rem 0; padding-left: 1.25rem; border-left: 2px solid rgba(173,56,41,0.4);
    font-style: italic; color: #4d463c;
  }
  em { font-style: italic; }
  hr { border: 0; text-align: center; margin: 2.5rem 0; }
  hr::after { content: "❦"; color: rgba(24,21,17,0.35); }
  @media print { body { background: #fff; padding: 0; } }
`;

export function buildDraftDocument(bodyHtml, title) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${String(title || 'Untitled Draft').replace(/[<>&]/g, '')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&display=swap" rel="stylesheet">
<style>${DRAFT_STYLES}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
