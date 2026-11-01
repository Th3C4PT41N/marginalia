/**
 * Generates the three sample PDFs in /public/samples.
 * Run once with `npm run samples`; the output is committed with the app so
 * the workbench can be tried immediately.
 */
import pdfLib from 'pdf-lib';
import fs from 'node:fs/promises';
import path from 'node:path';

const { PDFDocument, StandardFonts, PDFName, PDFString, rgb } = pdfLib;

const OUT_DIR = path.resolve('public/samples');
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 72;
const BODY_SIZE = 12;
const LEADING = 20.5;

const INK = rgb(0.09, 0.08, 0.07);
const MUTED = rgb(0.45, 0.42, 0.38);

const DOCS = [
  {
    file: 'sherman-marginalia-reading.pdf',
    title: 'The Margins of Early Modern Books',
    author: 'Sherman, William H.',
    year: '2021',
    publisher: 'Folger Institute Press',
    subject: 'Annotation practices and the history of reading',
    paragraphs: [
      'The margins of early modern books are the closest thing we have to a transcript of reading, yet they are also the least reliable. A reader who underlines a sentence records attention; a reader who writes beside it records judgment; a reader who crosses it out records a change of mind. None of these acts is self-explanatory, and none of them survives in sufficient quantity to stand for a period.',
      'Consider the Folger copy of Bacon\'s Advancement of Learning (1629). On the verso of the title page, beside the word "method," a seventeenth-century hand has drawn a small pointing finger toward the margin. The mark is not decoration. It is an instruction to return, and it presupposes a reader who expected to use the book more than once.',
      'The manicule is the most legible of these marks, but it is not the most common. Brackets, slashes, and simple vertical rules appear far more often, and they are correspondingly harder to interpret. A bracket may mean "this belongs together," or it may mean "I disagree," or it may mean nothing at all beyond the momentary impulse to mark a page. Historians of reading have tended to resolve this ambiguity by assuming coherence where none may exist.',
      'Annotation was also a social practice. Schoolbooks of the period supplied printed marginalia as models, and students were expected to imitate them before producing notes of their own. The practice therefore sits awkwardly between reception and composition: what one eighteenth-century cataloguer called "the furniture of the mind" was, in practice, furniture assembled from other people\'s sentences.',
      'What survives is a sample selected by wealth, literacy, and permission. Women\'s copies, schoolboys\' copies, and the copies of servants survive in far smaller numbers than those of gentlemen scholars. Any claim about a period\'s reading practice must therefore answer a prior question about whose practice was allowed to leave a trace.',
      'The archive of annotation is not a record of reading in general. It is a record of reading that had ink, leisure, and the authority to interrupt a printed page. Read in that light, marginalia are less a transcript than a permit: evidence not of what readers thought, but of who was entitled to write it down.',
      'The habit of annotation was not evenly distributed across the book. Marks cluster at beginnings: the first pages of chapters, the opening of a preface, the first appearance of a technical term. Readers appear to have annotated as they oriented themselves, then stopped once the argument became familiar. A map of marks is therefore also a map of difficulty.',
      'Digitization has changed the evidence without resolving the problem. Photographs of margins make comparison easier, but they also detach the note from the page it was written against. The texture of the paper, the pressure of the pen, and the distance between note and text are precisely the details that a scan tends to lose, and precisely the details on which interpretation depends.',
    ],
  },
  {
    file: 'bacon-advancement-annotated.pdf',
    title: 'The Advancement of Learning',
    author: 'Bacon, Francis',
    year: '1629',
    publisher: 'Oxford University Press',
    subject: 'Facsimile edition with reader annotations',
    paragraphs: [
      'Learning hath been delivered as a rich storehouse for the glory of the Creator and the relief of man\'s estate. But the manner of delivery hath not been answerable to the matter. Knowledge is commonly handled as if it were a body without joints, to be carried whole rather than opened and distributed.',
      'For method is not a thing of ornament. It is the hand that guides the reader through a wilderness of particulars, and where method is wanting the reader wandereth, though the matter be good. Hence it is that many books are rather to be read than studied, and many more are studied to no purpose.',
      'Let no man think that the dignity of learning is diminished by the care of its arrangement. The astronomer who orders the stars doth not thereby make them; he maketh them intelligible. So the writer who disposeth his matter in due order doth not invent truth, but rendereth it apt for use.',
      'There is a kind of knowledge which may be called "a dry light," which shineth upon the understanding without warming the affections. It is the light of the schoolmen, subtle and barren; and it is the fault of the age that such light is often mistaken for the sun.',
      'Yet we ought not to despise the fragments. A maxim, a sentence, a note in the margin may serve when the whole treatise is wanting. The reader who collects such fragments is not a borrower but a builder, and his building is the better for being made of pieces he hath chosen himself.',
      'For the mind of man is not a vessel to be filled, but a lamp to be kindled. And a lamp is kindled by contact, not by instruction alone; wherefore the company of good books, and the notes we make in them, do more toward knowledge than the bare reading of many volumes.',
      'Neither is this a defence of mere collection. To gather sentences without order is to heap stones without a wall. The note must answer to the question that occasioned it, and the question must be one the reader can still recognise a month hence. Where that condition fails, the margin becomes a graveyard of good intentions.',
      'I have therefore set down, in the following books, both the method and the impediments of method; not as a master, but as a surveyor who marks the ground before others build. If the reader find here a phrase worth his own margin, let him take it, and let him add to it.',
    ],
  },
  {
    file: 'hollis-reading-practices.pdf',
    title: 'Reading Practices and the Printed Page',
    author: 'Hollis, Marianne',
    year: '2018',
    publisher: 'Cambridge University Press',
    subject: 'Pedagogy, gender, and the history of annotation',
    paragraphs: [
      'It is crucial to note that annotation was taught. The assumption that marginalia are spontaneous expressions of individual response has obscured the degree to which readers were trained to produce them. Printed textbooks of the sixteenth and seventeenth centuries routinely included model notes, and schoolmasters were instructed to require imitation before invention.',
      'This pedagogy produced a recognizable grammar of marks. A vertical line in the margin signaled a passage worth returning to; a bracket gathered a sequence of sentences into a single unit of argument; a brief word, often no more than "nota" or "quaere," recorded a judgment without specifying its grounds. The grammar was conventional, but its application was not.',
      'Consequently, the study of annotation must distinguish between the mark and its occasion. The same symbol may register assent in one copy and dissent in another, and without external evidence the historian cannot always tell which. Consequently, claims about the emotional or intellectual life of past readers should be advanced with unusual caution.',
      'Gender complicates the picture further. Women readers certainly annotated, but their books survive less often, and when they do survive they are less likely to be catalogued as evidence of scholarship. The archive has tended to classify women\'s marks as personal and men\'s as intellectual, a distinction that reflects the assumptions of cataloguers more than the practices of readers.',
      'Furthermore, the material record is uneven across genres. Devotional works, household manuals, and schoolbooks are heavily marked; folio histories and law books are not. Furthermore, the marks cluster in the places where a book was designed to be used: indexes, tables, and the opening pages of chapters.',
      'A history of reading built from these traces must therefore be a history of infrastructure as much as of intention. What readers could write, where they could write it, and who was permitted to keep the result are questions that precede any interpretation of the notes themselves.',
      'The classroom is the likeliest origin of most of the marks that survive. A schoolboy trained to bracket the topic sentence and to underline the conclusion carried that habit into every book he later owned. The result is a corpus that looks spontaneous but is in fact the residue of instruction, repeated until it became invisible.',
      'This has consequences for how we describe readerly agency. To say that a reader "responded" to a text is to borrow a vocabulary of freedom that the evidence does not always support. Often the reader was executing a lesson, and the interest of the note lies precisely in the gap between the lesson and the sentence it was applied to.',
    ],
  },
];

function wrap(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function buildDoc(spec) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(spec.title);
  pdf.setAuthor(spec.author);
  pdf.setSubject(spec.subject);
  pdf.setCreator('Marginalia sample library');
  pdf.setProducer('pdf-lib');
  pdf.setCreationDate(new Date(`${spec.year}-01-15T00:00:00Z`));
  pdf.setModificationDate(new Date(`${spec.year}-01-15T00:00:00Z`));
  /* pdf-lib has no setPublisher helper; write the standard info key directly. */
  pdf.getInfoDict().set(PDFName.of('Publisher'), PDFString.of(spec.publisher));

  const body = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  let page;
  let y = 0;
  let pageNumber = 0;
  const maxWidth = PAGE_W - MARGIN * 2;

  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    pageNumber += 1;
    y = PAGE_H - MARGIN;

    if (pageNumber > 1) {
      page.drawText(spec.author.split(',')[0].toUpperCase(), {
        x: MARGIN,
        y: PAGE_H - 48,
        size: 7.5,
        font: body,
        color: MUTED,
      });
      page.drawText(spec.title, {
        x: PAGE_W - MARGIN - body.widthOfTextAtSize(spec.title, 7.5),
        y: PAGE_H - 48,
        size: 7.5,
        font: body,
        color: MUTED,
      });
      page.drawLine({
        start: { x: MARGIN, y: PAGE_H - 58 },
        end: { x: PAGE_W - MARGIN, y: PAGE_H - 58 },
        thickness: 0.5,
        color: rgb(0.8, 0.78, 0.74),
      });
      y = PAGE_H - 84;
    }
  };

  newPage();

  // Title block
  page.drawText('MARGINALIA SAMPLE LIBRARY', {
    x: MARGIN,
    y,
    size: 7.5,
    font: body,
    color: MUTED,
  });
  y -= 30;

  const titleLines = wrap(spec.title, bold, 24, maxWidth);
  for (const line of titleLines) {
    page.drawText(line, { x: MARGIN, y, size: 24, font: bold, color: INK });
    y -= 30;
  }

  y -= 4;
  page.drawText(spec.author, { x: MARGIN, y, size: 12.5, font: italic, color: INK });
  y -= 18;
  page.drawText(`${spec.publisher} · ${spec.year}`, {
    x: MARGIN,
    y,
    size: 10,
    font: body,
    color: MUTED,
  });
  y -= 26;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.75,
    color: rgb(0.7, 0.68, 0.64),
  });
  y -= 30;

  for (const paragraph of spec.paragraphs) {
    const lines = wrap(paragraph, body, BODY_SIZE, maxWidth);
    for (const line of lines) {
      if (y < MARGIN + 28) newPage();
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font: body, color: INK });
      y -= LEADING;
    }
    y -= 10;
  }

  // Folio numbers
  const pages = pdf.getPages();
  pages.forEach((p, index) => {
    const label = String(index + 1);
    p.drawText(label, {
      x: PAGE_W / 2 - body.widthOfTextAtSize(label, 9) / 2,
      y: MARGIN - 24,
      size: 9,
      font: body,
      color: MUTED,
    });
  });

  const bytes = await pdf.save();
  await fs.writeFile(path.join(OUT_DIR, spec.file), bytes);
  console.log(`  ✓ ${spec.file} (${pdf.getPageCount()} pages)`);
}

await fs.mkdir(OUT_DIR, { recursive: true });
console.log('Building sample library…');
for (const spec of DOCS) {
  await buildDoc(spec);
}
console.log('Done.');
