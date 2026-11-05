import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table,
  Minus,
  Search,
  Replace,
  Columns,
  Eye,
  Edit3,
  GitCompare,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Type,
  Maximize2,
  Minimize2,
  MoveHorizontal,
} from 'lucide-react';
import { EditorFontSize, CanvasPageWidth } from '../types';

export type ViewMode = 'split' | 'editor' | 'preview' | 'diff';

interface EditorToolbarProps {
  onInsertMarkdown: (prefix: string, suffix?: string, defaultPlaceholder?: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFindReplace: (find: string, replaceWith: string, replaceAll: boolean) => void;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  hasOriginalDiff: boolean;
  fontSize: EditorFontSize;
  onFontSizeChange: (size: EditorFontSize) => void;
  pageWidth: CanvasPageWidth;
  onPageWidthChange: (width: CanvasPageWidth) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onInsertMarkdown,
  viewMode,
  onViewModeChange,
  onFindReplace,
  toggleSidebar,
  sidebarOpen,
  hasOriginalDiff,
  fontSize,
  onFontSizeChange,
  pageWidth,
  onPageWidthChange,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleInsertTable = () => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Item 1 | Details | Status |\n| Item 2 | Details | Status |\n`;
    onInsertMarkdown(tableTemplate, '');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2 flex flex-col gap-2 shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Sidebar toggle + Markdown formatting items */}
        <div className="flex items-center flex-wrap gap-1">
          <button
            onClick={toggleSidebar}
            title={sidebarOpen ? 'Hide section arranger sidebar' : 'Show section arranger sidebar'}
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors mr-1"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="h-4 w-px bg-gray-200 mx-0.5" />

          {/* Text Styles */}
          <button
            onClick={() => onInsertMarkdown('**', '**', 'bold text')}
            title="Bold (Ctrl+B)"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => onInsertMarkdown('*', '*', 'italic text')}
            title="Italic (Ctrl+I)"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-0.5" />

          {/* Headings */}
          <button
            onClick={() => onInsertMarkdown('# ', '', 'Document Title')}
            title="Heading 1"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onInsertMarkdown('## ', '', 'Section Heading')}
            title="Heading 2"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onInsertMarkdown('### ', '', 'Subsection')}
            title="Heading 3"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-0.5" />

          {/* Lists & Blocks */}
          <button
            onClick={() => onInsertMarkdown('- ', '', 'List item')}
            title="Bullet list"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onInsertMarkdown('1. ', '', 'Numbered item')}
            title="Numbered list"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => onInsertMarkdown('- [ ] ', '', 'Task to complete')}
            title="Checklist item"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => onInsertMarkdown('> ', '', 'Important note or quote')}
            title="Blockquote"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={handleInsertTable}
            title="Insert Markdown Table"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={() => onInsertMarkdown('\n---\n', '')}
            title="Horizontal Divider"
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-0.5" />

          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            title="Find and Replace"
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
              showFindReplace
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Find/Replace</span>
          </button>
        </div>

        {/* Right: Font Size, Document Width, View Modes, & Focus Mode */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Font Size Stepper */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              onClick={() => {
                const sizes: EditorFontSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];
                const curIdx = sizes.indexOf(fontSize);
                if (curIdx > 0) onFontSizeChange(sizes[curIdx - 1]);
              }}
              title="Decrease Editor & Preview Text Size"
              disabled={fontSize === 'sm'}
              className="px-2 py-1 text-gray-700 hover:text-indigo-600 hover:bg-white rounded disabled:opacity-30 font-bold"
            >
              A-
            </button>
            <span className="px-2 py-0.5 font-semibold text-gray-700 text-[11px] min-w-[50px] text-center select-none">
              {fontSize === 'sm' ? '14px' : fontSize === 'md' ? '16px' : fontSize === 'lg' ? '18px' : fontSize === 'xl' ? '21px' : '24px'}
            </span>
            <button
              onClick={() => {
                const sizes: EditorFontSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];
                const curIdx = sizes.indexOf(fontSize);
                if (curIdx < sizes.length - 1) onFontSizeChange(sizes[curIdx + 1]);
              }}
              title="Increase Editor & Preview Text Size"
              disabled={fontSize === '2xl'}
              className="px-2 py-1 text-gray-700 hover:text-indigo-600 hover:bg-white rounded disabled:opacity-30 font-bold"
            >
              A+
            </button>
          </div>

          {/* Document Width Selector (Standard / Wide / Full) */}
          <div className="hidden lg:flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              onClick={() => onPageWidthChange('standard')}
              title="Standard Reading Column (768px)"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                pageWidth === 'standard' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Std Width
            </button>
            <button
              onClick={() => onPageWidthChange('wide')}
              title="Wide Reading Column (1120px)"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                pageWidth === 'wide' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Wide
            </button>
            <button
              onClick={() => onPageWidthChange('full')}
              title="Full 100% Canvas Width"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                pageWidth === 'full' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Full
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => onViewModeChange('split')}
              title="Split Editor & Formatted Preview"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'split' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => onViewModeChange('editor')}
              title="Editor Only"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'editor' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              onClick={() => onViewModeChange('preview')}
              title="Formatted Document Preview"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'preview' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={() => onViewModeChange('diff')}
              title="Tracked Changes & Diff View"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all relative ${
                viewMode === 'diff' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Track Changes</span>
              {hasOriginalDiff && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
              )}
            </button>
          </div>

          {/* Fullscreen / Focus Mode Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Focus Mode' : 'Focus Mode (Maximize Writing Workspace)'}
              className={`p-1.5 rounded-lg border transition-all ${
                isFullscreen
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:text-indigo-600 hover:border-indigo-400'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showFindReplace && (
        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex flex-wrap items-center gap-2 animate-in fade-in duration-100">
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-2 py-1">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Find text..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="text-xs focus:outline-hidden w-36"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-2 py-1">
            <Replace className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="text-xs focus:outline-hidden w-36"
            />
          </div>

          <button
            onClick={() => onFindReplace(findText, replaceText, false)}
            disabled={!findText}
            className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs rounded font-medium disabled:opacity-40"
          >
            Replace Next
          </button>
          <button
            onClick={() => onFindReplace(findText, replaceText, true)}
            disabled={!findText}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded font-medium disabled:opacity-40"
          >
            Replace All
          </button>

          <button
            onClick={() => setShowFindReplace(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
