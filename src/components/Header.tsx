import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Layers,
  Search,
  Download,
  RotateCcw,
  CheckCircle2,
  Wand2,
  FileCheck,
  ChevronDown,
  Printer,
  Copy,
  FileCode,
  ShieldCheck,
  Gauge,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Globe,
  Send,
  Lock,
  Unlock,
} from 'lucide-react';
import { AppZoomLevel, PublishedEdition } from '../types';

interface HeaderProps {
  documentTitle: string;
  onTitleChange: (newTitle: string) => void;
  onFixAll: () => void;
  onAutoArrange: () => void;
  onAnalyze: () => void;
  onOpenWorkshop: () => void;
  onResetOriginal: () => void;
  onExport: (format: 'markdown' | 'text' | 'html' | 'print' | 'copy') => void;
  isProcessing: boolean;
  processingLabel?: string;
  healthScore?: number;
  hasChangesFromOriginal: boolean;
  activeInspectorTab: 'errors' | 'humanizer' | 'arranger' | 'workshop';
  onSelectInspectorTab: (tab: 'errors' | 'humanizer' | 'arranger' | 'workshop') => void;
  currentUser?: { name: string; email: string; role: string };
  onOpenAdminConsole?: () => void;
  onOpenSpeedTest?: () => void;
  onOpenPublisher?: () => void;
  publishedEdition?: PublishedEdition | null;
  isAdminUnlocked?: boolean;
  zoom: AppZoomLevel;
  onZoomChange: (zoom: AppZoomLevel) => void;
}

export const Header: React.FC<HeaderProps> = ({
  documentTitle,
  onTitleChange,
  onFixAll,
  onAutoArrange,
  onAnalyze,
  onOpenWorkshop,
  onResetOriginal,
  onExport,
  isProcessing,
  processingLabel,
  healthScore,
  hasChangesFromOriginal,
  activeInspectorTab,
  onSelectInspectorTab,
  currentUser,
  onOpenAdminConsole,
  onOpenSpeedTest,
  onOpenPublisher,
  publishedEdition,
  isAdminUnlocked,
  zoom = 100,
  onZoomChange,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const zoomLevels: AppZoomLevel[] = [90, 100, 110, 120, 130, 140, 150];

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'bg-gray-100 text-gray-700';
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 70) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  const handleCopy = () => {
    onExport('copy');
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
    setExportMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs sticky top-0 z-30">
      {/* Left: Branding & Document Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white shadow-xs">
          <FileCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
              Auto Fix File or Draft
            </span>
            <span className="text-gray-300 font-normal hidden sm:inline">|</span>
            {isEditingTitle ? (
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                autoFocus
                className="text-sm font-semibold text-gray-900 border-b border-indigo-500 focus:outline-hidden px-1 py-0.5 bg-indigo-50/50 rounded"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename active draft"
                className="text-sm font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors flex items-center gap-1 group text-left max-w-xs"
              >
                <span className="truncate">{documentTitle || 'Untitled Draft'}</span>
                <span className="text-[10px] text-gray-400 group-hover:text-indigo-500 font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                  (edit)
                </span>
              </button>
            )}

            {healthScore !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${getScoreColor(
                  healthScore
                )}`}
                title={`Document Health Score: ${healthScore}/100`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {healthScore}/100 Score
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 hidden sm:block">
            Auto Fix File or Draft • Arrange structure, organize flow, & fix errors
          </p>
        </div>
      </div>

      {/* Middle: Feature Quick Mode Tabs */}
      <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
        <button
          onClick={() => {
            onSelectInspectorTab('errors');
            onAnalyze();
          }}
          disabled={isProcessing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeInspectorTab === 'errors'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Error Scanner</span>
        </button>

        <button
          onClick={() => onSelectInspectorTab('humanizer')}
          disabled={isProcessing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeInspectorTab === 'humanizer'
              ? 'bg-white text-emerald-700 shadow-xs font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Humanizer</span>
        </button>

        <button
          onClick={() => onSelectInspectorTab('arranger')}
          disabled={isProcessing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeInspectorTab === 'arranger'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Auto-Arranger</span>
        </button>

        <button
          onClick={() => onSelectInspectorTab('workshop')}
          disabled={isProcessing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeInspectorTab === 'workshop'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Work Doc</span>
        </button>
      </div>

      {/* Right: Quick Action Buttons & Export */}
      <div className="flex items-center space-x-2">
        {/* Fix All Button */}
        <button
          onClick={onFixAll}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fix All Errors</span>
        </button>

        {/* Auto Arrange Button */}
        <button
          onClick={onAutoArrange}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Arrange File</span>
        </button>

        {/* Undo/Reset if changed */}
        {hasChangesFromOriginal && (
          <button
            onClick={onResetOriginal}
            title="Revert back to original document"
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Speed Test Button */}
        {onOpenSpeedTest && (
          <button
            onClick={onOpenSpeedTest}
            title="Run App Speed Test & Performance Benchmark"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-all hover:border-emerald-300 shadow-2xs"
          >
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Speed Test</span>
          </button>
        )}

        {/* Publisher Studio Button */}
        {onOpenPublisher && (
          <button
            onClick={onOpenPublisher}
            title="Open Document Publisher (Web Article, Newsletter, Social, CMS)"
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all shadow-2xs ${
              publishedEdition
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {publishedEdition ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : (
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>{publishedEdition ? `Published v${publishedEdition.version}` : 'Publisher'}</span>
          </button>
        )}

        {/* App Size & Zoom Controller */}
        <div className="relative">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => {
                const idx = zoomLevels.indexOf(zoom);
                if (idx > 0) onZoomChange(zoomLevels[idx - 1]);
              }}
              disabled={zoom <= 90}
              title="Decrease overall app size"
              className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-white rounded disabled:opacity-30 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
              title="Change App Size Scale"
              className="px-2 py-0.5 text-xs font-semibold text-gray-700 hover:text-indigo-600 hover:bg-white rounded transition-colors flex items-center gap-1 select-none"
            >
              <span>{zoom}%</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <button
              onClick={() => {
                const idx = zoomLevels.indexOf(zoom);
                if (idx < zoomLevels.length - 1) onZoomChange(zoomLevels[idx + 1]);
              }}
              disabled={zoom >= 150}
              title="Increase overall app size"
              className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-white rounded disabled:opacity-30 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {zoomMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                App Size & Zoom
              </div>
              {zoomLevels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    onZoomChange(lvl);
                    setZoomMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50 hover:text-indigo-700 ${
                    zoom === lvl ? 'font-bold text-indigo-700 bg-indigo-50/50' : 'text-gray-700'
                  }`}
                >
                  <span>
                    {lvl}%{' '}
                    {lvl === 100
                      ? '(Default)'
                      : lvl === 120
                      ? '(Comfortable)'
                      : lvl === 130
                      ? '(Large)'
                      : lvl === 150
                      ? '(Max)'
                      : ''}
                  </span>
                  {zoom === lvl && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    onZoomChange(100);
                    setZoomMenuOpen(false);
                  }}
                  className="w-full px-3 py-1 text-left text-[11px] text-gray-500 hover:text-indigo-600 hover:bg-gray-50"
                >
                  Reset to 100%
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onExport('markdown');
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
              >
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span>Download Markdown (.md)</span>
              </button>
              <button
                onClick={() => {
                  onExport('text');
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-gray-500" />
                <span>Download Plain Text (.txt)</span>
              </button>
              <button
                onClick={() => {
                  onExport('html');
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
              >
                <FileCode className="w-4 h-4 text-amber-500" />
                <span>Download HTML (.html)</span>
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button
                onClick={() => {
                  onExport('print');
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-blue-500" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                onClick={handleCopy}
                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4 text-emerald-500" />
                <span>{copiedNotice ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
              </button>
              {onOpenPublisher && (
                <>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      onOpenPublisher();
                      setExportMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>Open Publisher Studio...</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Administrator Console Button */}
        {onOpenAdminConsole && (
          <button
            onClick={onOpenAdminConsole}
            title={
              isAdminUnlocked
                ? "Open Administrator Console (Authenticated Session)"
                : "Open Administrator Console (PIN Required)"
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all border ${
              isAdminUnlocked
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-900 border-indigo-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Admin</span>
            <span className="text-[10px] uppercase font-extrabold bg-indigo-600 text-white px-1.5 py-0.2 rounded flex items-center gap-1">
              <span>{currentUser?.role || 'Admin'}</span>
              {isAdminUnlocked ? (
                <Unlock className="w-2.5 h-2.5 text-emerald-300" />
              ) : (
                <Lock className="w-2.5 h-2.5 text-amber-300" />
              )}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
