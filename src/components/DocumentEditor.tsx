import React, { useMemo, useEffect } from 'react';
import { marked } from 'marked';
import { ViewMode } from './EditorToolbar';
import { computeDiff, DiffResult } from '../utils/diffHelper';
import { calculateDocumentMetrics } from '../utils/documentParser';
import { EditorFontSize, CanvasPageWidth } from '../types';
import { FileText, Clock, Hash, CheckCheck, Sparkles, BookOpen } from 'lucide-react';

interface DocumentEditorProps {
  content: string;
  originalContent: string;
  onChange: (newContent: string) => void;
  viewMode: ViewMode;
  onSelectionChange?: (selectedText: string) => void;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  fontSize?: EditorFontSize;
  pageWidth?: CanvasPageWidth;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  content,
  originalContent,
  onChange,
  viewMode,
  onSelectionChange,
  editorRef,
  fontSize = 'md',
  pageWidth = 'wide',
}) => {
  // Configure marked options
  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }, []);

  // Compute HTML preview
  const htmlPreview = useMemo(() => {
    try {
      return marked.parse(content || '') as string;
    } catch (e) {
      return '<p class="text-rose-500">Error rendering markdown</p>';
    }
  }, [content]);

  // Compute diff against original content
  const diffResult: DiffResult = useMemo(() => {
    if (viewMode !== 'diff') {
      return { lines: [], addedCount: 0, removedCount: 0, unchangedCount: 0 };
    }
    return computeDiff(originalContent, content);
  }, [viewMode, originalContent, content]);

  // Compute document metrics
  const metrics = useMemo(() => calculateDocumentMetrics(content), [content]);

  // Handle text selection
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const selected = target.value.substring(target.selectionStart, target.selectionEnd);
    if (onSelectionChange) {
      onSelectionChange(selected);
    }
  };

  // Font scale configurations
  const fontConfig = useMemo(() => {
    switch (fontSize) {
      case 'sm':
        return {
          textarea: 'text-xs md:text-sm',
          articleFontSize: '14px',
          articleLineHeight: '1.65',
          diffText: 'text-xs',
        };
      case 'md':
        return {
          textarea: 'text-sm md:text-base',
          articleFontSize: '16px',
          articleLineHeight: '1.75',
          diffText: 'text-sm',
        };
      case 'lg':
        return {
          textarea: 'text-base md:text-lg',
          articleFontSize: '18px',
          articleLineHeight: '1.8',
          diffText: 'text-base',
        };
      case 'xl':
        return {
          textarea: 'text-lg md:text-xl',
          articleFontSize: '21px',
          articleLineHeight: '1.85',
          diffText: 'text-lg',
        };
      case '2xl':
        return {
          textarea: 'text-xl md:text-2xl',
          articleFontSize: '24px',
          articleLineHeight: '1.9',
          diffText: 'text-xl',
        };
      default:
        return {
          textarea: 'text-base',
          articleFontSize: '16px',
          articleLineHeight: '1.75',
          diffText: 'text-sm',
        };
    }
  }, [fontSize]);

  // Page width styling for preview
  const pageWidthClass = useMemo(() => {
    switch (pageWidth) {
      case 'standard':
        return 'max-w-3xl';
      case 'wide':
        return 'max-w-5xl';
      case 'full':
        return 'max-w-none w-full';
      default:
        return 'max-w-5xl';
    }
  }, [pageWidth]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      {/* Editor & Preview Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* RAW TEXT / MARKDOWN EDITOR (visible in 'split' or 'editor' mode) */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className={`flex flex-col h-full overflow-hidden ${
              viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'
            }`}
          >
            <div className="bg-gray-50/80 px-3 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-gray-700">Markdown & Plain Text Editor</span>
              </span>
              <span className="text-gray-400 font-mono text-[11px]">Live Sync • Auto-Saved</span>
            </div>

            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onSelect={handleSelect}
              placeholder="Paste your unarranged document, draft notes, or start typing here..."
              className={`flex-1 w-full p-5 font-mono ${fontConfig.textarea} text-gray-800 leading-relaxed resize-none focus:outline-hidden bg-white selection:bg-indigo-100 overflow-y-auto`}
              spellCheck={true}
            />
          </div>
        )}

        {/* FORMATTED DOCUMENT PREVIEW (visible in 'split' or 'preview' mode) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`flex flex-col h-full overflow-hidden bg-white ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="bg-gray-50/80 px-3 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-gray-700">Formatted Document Output</span>
              </span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                Publication Ready
              </span>
            </div>

            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50/30">
              <article
                className={`${pageWidthClass} mx-auto bg-white p-8 md:p-12 rounded-xl shadow-xs border border-gray-200 prose prose-indigo text-gray-900 leading-relaxed font-sans`}
                style={{
                  fontSize: fontConfig.articleFontSize,
                  lineHeight: fontConfig.articleLineHeight,
                }}
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          </div>
        )}

        {/* TRACK CHANGES & DIFF VIEW (visible only in 'diff' mode) */}
        {viewMode === 'diff' && (
          <div className="w-full flex flex-col h-full overflow-hidden bg-white">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">Tracked Changes</span>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold">
                  +{diffResult.addedCount} additions
                </span>
                <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold">
                  -{diffResult.removedCount} deletions
                </span>
              </div>
              <span className="text-gray-500 text-xs">
                Red: Original text removed or fixed • Green: Corrected text & structure added
              </span>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 font-mono ${fontConfig.diffText} divide-y divide-gray-100`}>
              {diffResult.lines.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No changes detected between the original file and current document.
                </div>
              ) : (
                diffResult.lines.map((line, idx) => {
                  let rowBg = 'bg-white text-gray-700';
                  let symbol = ' ';
                  let badge = '';

                  if (line.type === 'added') {
                    rowBg = 'bg-emerald-50/80 text-emerald-950 font-medium';
                    symbol = '+';
                    badge = 'bg-emerald-200 text-emerald-800';
                  } else if (line.type === 'removed') {
                    rowBg = 'bg-rose-50/80 text-rose-900 line-through opacity-80';
                    symbol = '-';
                    badge = 'bg-rose-200 text-rose-800';
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-start py-1.5 px-3 ${rowBg} transition-colors hover:brightness-95`}
                    >
                      <span className="w-8 text-gray-400 shrink-0 select-none text-[11px]">
                        {line.originalLineNumber || line.modifiedLineNumber || ''}
                      </span>
                      <span className="w-6 font-bold select-none shrink-0 text-center font-mono">
                        {symbol}
                      </span>
                      <pre className={`flex-1 whitespace-pre-wrap font-sans ${fontConfig.diffText} break-words`}>
                        {line.text || '\u00A0'}
                      </pre>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* DOCUMENT STATUS & METRICS FOOTER */}
      <footer className="bg-white border-t border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2 shrink-0">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-gray-400" />
            <strong className="text-gray-700 font-semibold">{metrics.words.toLocaleString()}</strong> words
          </span>
          <span className="hidden sm:inline-block">•</span>
          <span className="hidden sm:flex items-center gap-1">
            <strong className="text-gray-700 font-semibold">{metrics.characters.toLocaleString()}</strong> chars
          </span>
          <span className="hidden md:inline-block">•</span>
          <span className="hidden md:flex items-center gap-1">
            <strong className="text-gray-700 font-semibold">{metrics.paragraphs}</strong> paragraphs
          </span>
          <span className="inline-block">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>~{metrics.readingMinutes} min read</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-400">Readability:</span>
          <span className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded text-[11px]">
            {metrics.readabilityEstimate}
          </span>
        </div>
      </footer>
    </div>
  );
};
