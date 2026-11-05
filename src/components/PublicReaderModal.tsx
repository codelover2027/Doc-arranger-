import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Clock,
  Calendar,
  User,
  BookOpen,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Sun,
  Moon,
  Coffee,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { marked } from 'marked';
import { PublishedEdition } from '../types';

interface PublicReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  edition: PublishedEdition | null;
  onShare?: () => void;
}

export const PublicReaderModal: React.FC<PublicReaderModalProps> = ({
  isOpen,
  onClose,
  edition,
  onShare,
}) => {
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      if (!container) return;
      const total = container.scrollHeight - container.clientHeight;
      if (total > 0) {
        setScrollProgress((container.scrollTop / total) * 100);
      }
    };

    const readerEl = document.getElementById('public-reader-scroll');
    if (readerEl) {
      readerEl.addEventListener('scroll', handleScroll);
      return () => readerEl.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  if (!isOpen || !edition) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(edition.shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#fbf7ee] text-[#433422] border-[#ebdcc7]';
      case 'dark':
        return 'bg-gray-950 text-gray-100 border-gray-800';
      case 'light':
      default:
        return 'bg-white text-gray-900 border-gray-200';
    }
  };

  const getThemeHeaderClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#f4ebd9]/90 border-[#ebdcc7] text-[#433422]';
      case 'dark':
        return 'bg-gray-900/90 border-gray-800 text-gray-100';
      case 'light':
      default:
        return 'bg-white/90 border-gray-200 text-gray-900';
    }
  };

  const getCoverGradient = (coverTheme: string) => {
    switch (coverTheme) {
      case 'midnight':
        return 'from-slate-900 via-indigo-950 to-slate-900 text-white';
      case 'emerald':
        return 'from-emerald-800 via-teal-900 to-emerald-950 text-white';
      case 'amber':
        return 'from-amber-600 via-orange-700 to-stone-900 text-white';
      case 'minimal':
        return 'from-gray-100 via-gray-200 to-gray-100 text-gray-900 border-b border-gray-200';
      case 'ocean':
      default:
        return 'from-blue-600 via-indigo-700 to-violet-800 text-white';
    }
  };

  const renderedHtml = marked.parse(edition.contentSnapshot);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-4xl h-[94vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-colors ${getThemeClasses()}`}
      >
        {/* Reading Progress Bar */}
        <div className="w-full bg-gray-200/40 h-1">
          <div
            className="h-full bg-indigo-600 transition-all duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Top Floating Reader Bar */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-b backdrop-blur-md sticky top-0 z-20 transition-colors ${getThemeHeaderClasses()}`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Studio</span>
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Public Reader View
            </span>
            <span className="text-xs text-gray-500 truncate hidden md:inline">
              {edition.slug}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Theme Selectors */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5 border border-black/10 dark:border-white/10">
              <button
                onClick={() => setTheme('light')}
                title="Light mode"
                className={`p-1.5 rounded ${theme === 'light' ? 'bg-white shadow-xs text-amber-600' : 'text-gray-500'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                title="Sepia warm mode"
                className={`p-1.5 rounded ${theme === 'sepia' ? 'bg-[#ebdcc7] shadow-xs text-[#82542a]' : 'text-gray-500'}`}
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark mode"
                className={`p-1.5 rounded ${theme === 'dark' ? 'bg-gray-800 shadow-xs text-indigo-400' : 'text-gray-500'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font Size Adjuster */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setReaderFontSize('sm')}
                className={`px-2 py-1 rounded ${readerFontSize === 'sm' ? 'bg-white dark:bg-gray-800 shadow-xs' : 'text-gray-500'}`}
              >
                A-
              </button>
              <button
                onClick={() => setReaderFontSize('md')}
                className={`px-2 py-1 rounded ${readerFontSize === 'md' ? 'bg-white dark:bg-gray-800 shadow-xs' : 'text-gray-500'}`}
              >
                A
              </button>
              <button
                onClick={() => setReaderFontSize('lg')}
                className={`px-2 py-1 rounded ${readerFontSize === 'lg' ? 'bg-white dark:bg-gray-800 shadow-xs' : 'text-gray-500'}`}
              >
                A+
              </button>
            </div>

            {/* Share / Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Content */}
        <div
          id="public-reader-scroll"
          className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-100"
        >
          {/* Cover Hero Banner */}
          <div
            className={`px-8 sm:px-14 py-12 bg-gradient-to-br ${getCoverGradient(
              edition.coverTheme
            )}`}
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs border border-white/30">
                  {edition.category || 'General'}
                </span>
                <span className="text-xs opacity-80 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {edition.readingTimeMinutes} min read
                </span>
                <span className="text-xs opacity-80">•</span>
                <span className="text-xs opacity-80 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(edition.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
                {edition.title}
              </h1>

              {edition.subtitle && (
                <p className="text-base sm:text-lg opacity-90 font-normal leading-relaxed">
                  {edition.subtitle}
                </p>
              )}

              {/* Author info */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/20">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                  {edition.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{edition.author}</div>
                  <div className="text-xs opacity-75">
                    Published Edition v{edition.version} • {edition.wordCount} words
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formatted Article Body */}
          <div className="px-6 sm:px-14 py-10 max-w-2xl mx-auto">
            <article
              className={`prose max-w-none transition-all leading-relaxed ${
                readerFontSize === 'sm'
                  ? 'text-sm'
                  : readerFontSize === 'lg'
                  ? 'text-lg leading-loose'
                  : 'text-base'
              } ${
                theme === 'dark'
                  ? 'prose-invert'
                  : theme === 'sepia'
                  ? 'text-[#433422]'
                  : 'text-gray-800'
              }`}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            {/* Tags and Metadata Footer */}
            {edition.tags && edition.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-2">
                {edition.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-black/5 dark:bg-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Publication Signature & Share Footer */}
            <div className="mt-10 p-6 rounded-xl border border-black/10 dark:border-white/10 bg-black/2 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Auto Fix File or Draft
                  </h4>
                  <p className="text-xs text-gray-500">
                    Quality-checked & verified publication.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-black/15 dark:border-white/20 hover:bg-black/5 transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Article</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
