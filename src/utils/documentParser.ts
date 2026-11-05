import { DocumentSection } from '../types';

export interface ParsedSection {
  id: string;
  title: string;
  level: number;
  content: string;
  fullBlock: string;
}

/**
 * Parses markdown text into discrete draggable/reorderable sections based on headings (#, ##, ###)
 */
export function extractDocumentSections(markdown: string): ParsedSection[] {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.split('\n');
  const sections: ParsedSection[] = [];
  let currentTitle = 'Document Header & Introduction';
  let currentLevel = 1;
  let currentLines: string[] = [];
  let sectionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);

    if (headingMatch) {
      if (currentLines.length > 0 || sections.length > 0) {
        sections.push({
          id: `sec-${sectionIndex++}`,
          title: currentTitle,
          level: currentLevel,
          content: currentLines.join('\n').trim(),
          fullBlock: (currentTitle !== 'Document Header & Introduction' ? `${'#'.repeat(currentLevel)} ${currentTitle}\n` : '') + currentLines.join('\n'),
        });
        currentLines = [];
      }
      currentLevel = headingMatch[1].length;
      currentTitle = headingMatch[2].trim();
    } else {
      currentLines.push(line);
    }
  }

  // Push remaining lines
  if (currentLines.length > 0 || currentTitle) {
    sections.push({
      id: `sec-${sectionIndex++}`,
      title: currentTitle,
      level: currentLevel,
      content: currentLines.join('\n').trim(),
      fullBlock: (currentTitle !== 'Document Header & Introduction' ? `${'#'.repeat(currentLevel)} ${currentTitle}\n` : '') + currentLines.join('\n'),
    });
  }

  return sections;
}

/**
 * Re-assembles parsed sections back into markdown document
 */
export function assembleDocumentFromSections(sections: ParsedSection[]): string {
  return sections
    .map((s) => {
      if (s.title === 'Document Header & Introduction' && !s.content.startsWith('#')) {
        return s.content;
      }
      const hashes = '#'.repeat(Math.max(1, Math.min(4, s.level)));
      return `${hashes} ${s.title}\n\n${s.content}`.trim();
    })
    .filter((block) => block.length > 0)
    .join('\n\n');
}

/**
 * Calculates document metrics: word count, reading time, characters, paragraphs
 */
export function calculateDocumentMetrics(text: string) {
  const clean = text.trim();
  if (!clean) {
    return {
      words: 0,
      characters: 0,
      paragraphs: 0,
      readingMinutes: 0,
      readabilityEstimate: 'N/A',
    };
  }

  const words = clean.split(/\s+/).filter(Boolean).length;
  const characters = clean.length;
  const paragraphs = clean.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 200));

  // Heuristic Readability indicator (approx Flesch grade)
  const sentences = clean.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const avgWordsPerSentence = words / sentences;

  let readabilityEstimate = 'Standard (Easy to read)';
  if (avgWordsPerSentence > 25) {
    readabilityEstimate = 'Dense & Complex';
  } else if (avgWordsPerSentence > 18) {
    readabilityEstimate = 'Intermediate';
  } else if (avgWordsPerSentence < 12) {
    readabilityEstimate = 'Crisp & Direct';
  }

  return {
    words,
    characters,
    paragraphs,
    readingMinutes,
    readabilityEstimate,
  };
}
