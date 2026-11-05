export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  originalLineNumber?: number;
  modifiedLineNumber?: number;
}

export interface DiffResult {
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
}

/**
 * Computes a clean line-based diff using Longest Common Subsequence (LCS)
 */
export function computeDiff(original: string, modified: string): DiffResult {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');

  const n = origLines.length;
  const m = modLines.length;

  // For very long documents, use a sliding window or fast check
  if (n > 800 || m > 800) {
    return computeSimpleDiff(origLines, modLines);
  }

  // DP table for LCS
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (origLines[i] === modLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const lines: DiffLine[] = [];
  let i = n;
  let j = m;
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      stack.push({
        type: 'unchanged',
        text: origLines[i - 1],
        originalLineNumber: i,
        modifiedLineNumber: j,
      });
      unchangedCount++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        type: 'added',
        text: modLines[j - 1],
        modifiedLineNumber: j,
      });
      addedCount++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      stack.push({
        type: 'removed',
        text: origLines[i - 1],
        originalLineNumber: i,
      });
      removedCount++;
      i--;
    }
  }

  while (stack.length > 0) {
    lines.push(stack.pop()!);
  }

  return {
    lines,
    addedCount,
    removedCount,
    unchangedCount,
  };
}

function computeSimpleDiff(origLines: string[], modLines: string[]): DiffResult {
  const lines: DiffLine[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  const max = Math.max(origLines.length, modLines.length);
  for (let i = 0; i < max; i++) {
    const o = origLines[i];
    const m = modLines[i];

    if (o === undefined) {
      lines.push({ type: 'added', text: m, modifiedLineNumber: i + 1 });
      addedCount++;
    } else if (m === undefined) {
      lines.push({ type: 'removed', text: o, originalLineNumber: i + 1 });
      removedCount++;
    } else if (o === m) {
      lines.push({ type: 'unchanged', text: o, originalLineNumber: i + 1, modifiedLineNumber: i + 1 });
      unchangedCount++;
    } else {
      lines.push({ type: 'removed', text: o, originalLineNumber: i + 1 });
      lines.push({ type: 'added', text: m, modifiedLineNumber: i + 1 });
      removedCount++;
      addedCount++;
    }
  }

  return { lines, addedCount, removedCount, unchangedCount };
}
