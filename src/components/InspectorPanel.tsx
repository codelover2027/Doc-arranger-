import React, { useState } from 'react';
import {
  Search,
  Layers,
  Wand2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCheck,
  X,
  FileCheck,
  ListOrdered,
  Table,
  Zap,
  ShieldCheck,
  Send,
  Loader2,
  HeartHandshake,
} from 'lucide-react';
import {
  AnalysisResult,
  DocumentError,
  ErrorCategory,
  ArrangementStrategy,
  ArrangementResult,
  WorkDocumentResult,
  HumanizeTone,
  HumanizeResult,
} from '../types';

interface InspectorPanelProps {
  activeTab: 'errors' | 'humanizer' | 'arranger' | 'workshop';
  onSelectTab: (tab: 'errors' | 'humanizer' | 'arranger' | 'workshop') => void;
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onApplySingleErrorFix: (error: DocumentError) => void;
  onDismissError: (errorId: string) => void;
  onApplyAllErrors: () => void;
  // Humanizer
  onRunHumanize: (tone: HumanizeTone, intensity: 'light' | 'balanced' | 'deep') => void;
  isHumanizing: boolean;
  lastHumanizeResult: HumanizeResult | null;
  onApplyHumanizedContent: () => void;
  // Arranger
  onRunArrangement: (strategy: ArrangementStrategy, customInstructions?: string, preserveHeadings?: boolean) => void;
  isArranging: boolean;
  lastArrangementResult: ArrangementResult | null;
  // Workshop
  onRunWorkAction: (action: string, customPrompt?: string) => void;
  isWorking: boolean;
  lastWorkResult: WorkDocumentResult | null;
  selectedText?: string;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  activeTab,
  onSelectTab,
  analysis,
  isAnalyzing,
  onRunAnalysis,
  onApplySingleErrorFix,
  onDismissError,
  onApplyAllErrors,
  onRunHumanize,
  isHumanizing,
  lastHumanizeResult,
  onApplyHumanizedContent,
  onRunArrangement,
  isArranging,
  lastArrangementResult,
  onRunWorkAction,
  isWorking,
  lastWorkResult,
  selectedText,
}) => {
  // Filter for errors
  const [errorFilter, setErrorFilter] = useState<'all' | ErrorCategory>('all');
  // Humanizer state
  const [selectedHumanizeTone, setSelectedHumanizeTone] = useState<HumanizeTone>('natural');
  const [selectedIntensity, setSelectedIntensity] = useState<'light' | 'balanced' | 'deep'>('balanced');
  // Arranger state
  const [selectedStrategy, setSelectedStrategy] = useState<ArrangementStrategy>('logical_flow');
  const [customArrangementNotes, setCustomArrangementNotes] = useState('');
  const [preserveHeadings, setPreserveHeadings] = useState(false);
  // Workshop custom prompt
  const [customWorkPrompt, setCustomWorkPrompt] = useState('');

  const humanizeTones: { id: HumanizeTone; title: string; desc: string; icon: string }[] = [
    {
      id: 'natural',
      title: 'Natural & Fluid',
      desc: 'Organic human phrasing, balanced transitions, and effortless rhythm.',
      icon: '🌿',
    },
    {
      id: 'conversational',
      title: 'Conversational Colleague',
      desc: 'Warm, relatable, authentic human speech as if explaining directly to a friend.',
      icon: '💬',
    },
    {
      id: 'executive',
      title: 'Executive Authentic',
      desc: 'Confident, direct leadership tone stripped of artificial fluff and repetitive jargon.',
      icon: '💼',
    },
    {
      id: 'storytelling',
      title: 'Engaging Storyteller',
      desc: 'Vivid imagery, strong narrative cadence, and high burstiness.',
      icon: '📖',
    },
    {
      id: 'punchy',
      title: 'Punchy & Direct',
      desc: 'Short, snappy sentences, active verbs, and sharp clarity.',
      icon: '⚡',
    },
  ];

  const strategies: { id: ArrangementStrategy; title: string; desc: string; icon: string }[] = [
    {
      id: 'logical_flow',
      title: 'Logical Flow & Coherence',
      desc: 'Builds smoothly: Problem -> Context -> Analysis -> Solutions -> Next steps.',
      icon: '🔄',
    },
    {
      id: 'executive_brief',
      title: 'Executive Brief (Bottom Line First)',
      desc: 'High-priority takeaways & summary right at the top for busy readers.',
      icon: '💼',
    },
    {
      id: 'clean_outline',
      title: 'Structured Hierarchical Outline',
      desc: 'Groups scattered notes into clear Markdown headings (#, ##, ###) and lists.',
      icon: '📑',
    },
    {
      id: 'business_proposal',
      title: 'Business Proposal Standard',
      desc: 'Executive Summary, Problem, Proposed Solution, Deliverables, Scope & Timeline.',
      icon: '📋',
    },
    {
      id: 'academic_report',
      title: 'Academic / Formal Report',
      desc: 'Abstract, Background, Empirical Findings, Discussion, and Conclusion.',
      icon: '🎓',
    },
    {
      id: 'chronological_process',
      title: 'Chronological & Milestones',
      desc: 'Orders content strictly by timeline, milestone phases, or sequential process.',
      icon: '⏱️',
    },
  ];

  const filteredErrors = (analysis?.errors || []).filter((err) => {
    if (err.applied) return false;
    if (errorFilter === 'all') return true;
    return err.category === errorFilter;
  });

  const remainingErrorCount = (analysis?.errors || []).filter((e) => !e.applied).length;

  return (
    <aside className="w-88 md:w-96 bg-gray-50 border-l border-gray-200 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-200 bg-white p-1">
        <button
          onClick={() => onSelectTab('errors')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-all ${
            activeTab === 'errors'
              ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Search className="w-3 h-3" />
          <span>Errors</span>
          {remainingErrorCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-1 rounded-full font-bold">
              {remainingErrorCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('humanizer')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-all ${
            activeTab === 'humanizer'
              ? 'bg-emerald-50 text-emerald-700 shadow-2xs border border-emerald-200 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Humanize</span>
        </button>

        <button
          onClick={() => onSelectTab('arranger')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-all ${
            activeTab === 'arranger'
              ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>Arrange</span>
        </button>

        <button
          onClick={() => onSelectTab('workshop')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-all ${
            activeTab === 'workshop'
              ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wand2 className="w-3 h-3" />
          <span>Work</span>
        </button>
      </div>

      {/* TAB CONTENT: ERRORS INSPECTOR */}
      {activeTab === 'errors' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header Summary & Health Score */}
          <div className="p-3 bg-white border-b border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Document Health Inspection
                </h3>
                <p className="text-[11px] text-gray-500">
                  {analysis
                    ? `${remainingErrorCount} issues found • Readability: ${analysis.readabilityGrade}`
                    : 'Click scan to inspect document for errors'}
                </p>
              </div>

              <button
                onClick={onRunAnalysis}
                disabled={isAnalyzing}
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                title="Rescan document"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span className="text-[11px]">Scan</span>
              </button>
            </div>

            {/* Score & quick action */}
            {analysis && (
              <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-indigo-200 flex items-center justify-center font-bold text-sm text-indigo-700">
                    {analysis.healthScore}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {analysis.healthScore >= 85
                        ? 'High Quality Document'
                        : analysis.healthScore >= 70
                        ? 'Fair • Needs Polish'
                        : 'Messy Draft • Many Issues'}
                    </p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{analysis.summary}</p>
                  </div>
                </div>

                {remainingErrorCount > 0 && (
                  <button
                    onClick={onApplyAllErrors}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Fix All</span>
                  </button>
                )}
              </div>
            )}

            {/* Category filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {(['all', 'grammar', 'structure', 'clarity', 'formatting', 'placeholder'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setErrorFilter(cat)}
                    className={`px-2 py-0.5 rounded-full capitalize whitespace-nowrap transition-colors ${
                      errorFilter === cat
                        ? 'bg-gray-800 text-white font-medium'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* List of Detected Errors */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {isAnalyzing ? (
              <div className="p-8 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-gray-600 font-medium">Scanning text for typos, grammar, & flow...</p>
              </div>
            ) : !analysis ? (
              <div className="p-6 text-center space-y-3">
                <Search className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500">
                  Ready to inspect. Click the scan button to detect spelling, grammar, structural flaws, and missing placeholders.
                </p>
                <button
                  onClick={onRunAnalysis}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 shadow-2xs"
                >
                  Analyze Document Now
                </button>
              </div>
            ) : filteredErrors.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-white rounded-xl border border-gray-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-gray-900">No active errors in this category!</h4>
                <p className="text-[11px] text-gray-500">
                  All flagged issues have either been accepted, dismissed, or corrected.
                </p>
              </div>
            ) : (
              filteredErrors.map((err) => (
                <div
                  key={err.id}
                  className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-indigo-300 transition-all text-xs"
                >
                  {/* Category & Severity header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        err.category === 'grammar'
                          ? 'bg-rose-100 text-rose-700'
                          : err.category === 'structure'
                          ? 'bg-purple-100 text-purple-700'
                          : err.category === 'clarity'
                          ? 'bg-blue-100 text-blue-700'
                          : err.category === 'placeholder'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {err.category}
                    </span>

                    <button
                      onClick={() => onDismissError(err.id)}
                      title="Dismiss error"
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Problem Snippet -> Fix Snippet */}
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="bg-rose-50 text-rose-900 p-1.5 rounded-md border border-rose-100 line-through">
                      {err.originalSnippet}
                    </div>
                    <div className="bg-emerald-50 text-emerald-950 p-1.5 rounded-md border border-emerald-100 font-semibold flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{err.replacementSnippet}</span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <p className="text-[11px] text-gray-600 font-sans leading-relaxed">
                    {err.explanation}
                  </p>

                  {/* Accept button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onApplySingleErrorFix(err)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-[11px] flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Accept Fix</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI HUMANIZER */}
      {activeTab === 'humanizer' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3 space-y-3">
          {/* Header Card */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              AI Humanizer & Cadence Engine
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Transforms rigid, repetitive, or AI-generated text into authentic human prose with natural voice, dynamic sentence burstiness, and warmth.
            </p>
          </div>

          {/* Authenticity & Burstiness Indicator Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-3 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500">Human Authenticity</span>
                <p className="text-base font-extrabold text-emerald-700">
                  {lastHumanizeResult ? `${lastHumanizeResult.humanScore}%` : '96% Target'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500">Robotic Marker Reduction</span>
                <p className="text-base font-extrabold text-indigo-700">
                  {lastHumanizeResult ? `-${lastHumanizeResult.originalRoboticScore - (100 - lastHumanizeResult.humanScore)}%` : 'Eliminate Clichés'}
                </p>
              </div>
            </div>
            <div className="text-[11px] text-emerald-900 font-medium bg-white/70 p-1.5 rounded border border-emerald-100 flex items-center gap-1">
              <span>⚡ Cadence:</span>
              <span className="truncate">{lastHumanizeResult?.cadenceVariety || 'Varied sentence lengths & natural rhythm'}</span>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Human Voice Persona
            </label>
            <div className="grid grid-cols-1 gap-2">
              {humanizeTones.map((tone) => (
                <div
                  key={tone.id}
                  onClick={() => setSelectedHumanizeTone(tone.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedHumanizeTone === tone.id
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs font-medium'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{tone.icon}</span>
                    <span className="font-semibold text-gray-900">{tone.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 pl-6 leading-relaxed">
                    {tone.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Intensity Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Humanization Depth
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['light', 'balanced', 'deep'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedIntensity(lvl)}
                  className={`py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all ${
                    selectedIntensity === lvl
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Selection indicator if any */}
          {selectedText && (
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-xs">
              <span className="font-semibold text-emerald-900 text-[10px] uppercase">
                Active Selection ({selectedText.split(/\s+/).filter(Boolean).length} words):
              </span>
              <p className="text-[11px] text-emerald-800 line-clamp-2 italic mt-0.5">
                "{selectedText}"
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => onRunHumanize(selectedHumanizeTone, selectedIntensity)}
            disabled={isHumanizing}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isHumanizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Humanizing Flow & Rhythm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{selectedText ? 'Humanize Selection' : 'Humanize Entire Document'}</span>
              </>
            )}
          </button>

          {/* Humanizer Results & Cliches Removed */}
          {lastHumanizeResult && (
            <div className="space-y-2 pt-2 border-t border-gray-200 animate-in fade-in">
              <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Humanization Complete
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {lastHumanizeResult.humanScore}% Human Score
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {lastHumanizeResult.improvementsSummary}
                </p>

                {/* Apply button */}
                <button
                  onClick={onApplyHumanizedContent}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Apply Humanized Text to Document</span>
                </button>
              </div>

              {/* Cliches Removed List */}
              {lastHumanizeResult.clichesRemoved?.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                  <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wider">
                    Robotic Markers Replaced ({lastHumanizeResult.clichesRemoved.length}):
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {lastHumanizeResult.clichesRemoved.map((item, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-lg border border-gray-200 text-[11px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="line-through text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-mono">
                            {item.originalPhrase}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                            {item.humanizedPhrase}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DOCUMENT ARRANGER */}
      {activeTab === 'arranger' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Smart Document Arranger
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Select an organizational architecture. AI will rearrange paragraphs, unify sections, and establish a natural narrative flow.
            </p>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Arrangement Strategy
            </label>
            <div className="grid grid-cols-1 gap-2">
              {strategies.map((strat) => (
                <div
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedStrategy === strat.id
                      ? 'bg-indigo-50/80 border-indigo-400 shadow-2xs font-medium'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{strat.icon}</span>
                    <span className="font-semibold text-gray-900">{strat.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 pl-6 leading-relaxed">
                    {strat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Custom Arrangement Guidance (Optional)
            </label>
            <textarea
              placeholder="e.g. Move financial numbers to appendix, put action items immediately after the executive summary..."
              value={customArrangementNotes}
              onChange={(e) => setCustomArrangementNotes(e.target.value)}
              rows={2}
              className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Preserve Headings Checkbox */}
          <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={preserveHeadings}
              onChange={(e) => setPreserveHeadings(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Preserve existing section titles as closely as possible</span>
          </label>

          {/* Run Button */}
          <button
            onClick={() => onRunArrangement(selectedStrategy, customArrangementNotes, preserveHeadings)}
            disabled={isArranging}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isArranging ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Reorganizing Document Flow...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Apply Auto-Arrangement</span>
              </>
            )}
          </button>

          {/* Reorganization Change Log */}
          {lastArrangementResult?.reorganizationNotes && (
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs space-y-1.5 animate-in fade-in">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Arrangement Notes:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-emerald-800 text-[11px]">
                {lastArrangementResult.reorganizationNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: WORK DOCUMENT WORKSHOP */}
      {activeTab === 'workshop' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-indigo-600" />
              Document Workshop
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Transform and enrich your document with targeted structural enhancements and synthesis tools.
            </p>
          </div>

          {selectedText && (
            <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 text-xs">
              <span className="font-semibold text-indigo-900 text-[10px] uppercase">
                Active Selection ({selectedText.split(/\s+/).filter(Boolean).length} words):
              </span>
              <p className="text-[11px] text-indigo-800 line-clamp-2 italic mt-0.5">
                "{selectedText}"
              </p>
            </div>
          )}

          {/* Quick Work Actions */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              1-Click Transformations
            </label>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onRunWorkAction('generate_executive_summary')}
                disabled={isWorking}
                className="w-full p-2.5 bg-white hover:bg-indigo-50/60 border border-gray-200 hover:border-indigo-300 rounded-xl text-left transition-all group flex items-start gap-2.5 disabled:opacity-50"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-700">
                    Add Executive Summary
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Synthesizes key takeaways and prepends a clean brief at the top.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onRunWorkAction('extract_action_items')}
                disabled={isWorking}
                className="w-full p-2.5 bg-white hover:bg-indigo-50/60 border border-gray-200 hover:border-indigo-300 rounded-xl text-left transition-all group flex items-start gap-2.5 disabled:opacity-50"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-700">
                    Extract Action Items & Tasks
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Finds all assignments, deliverables, and deadlines into a checklist.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onRunWorkAction('format_tables_and_lists')}
                disabled={isWorking}
                className="w-full p-2.5 bg-white hover:bg-indigo-50/60 border border-gray-200 hover:border-indigo-300 rounded-xl text-left transition-all group flex items-start gap-2.5 disabled:opacity-50"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-700">
                    Convert Data to Markdown Tables
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Structures messy raw metrics, comparisons, and schedules into clean tables.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onRunWorkAction('elevate_professional_tone')}
                disabled={isWorking}
                className="w-full p-2.5 bg-white hover:bg-indigo-50/60 border border-gray-200 hover:border-indigo-300 rounded-xl text-left transition-all group flex items-start gap-2.5 disabled:opacity-50"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-700">
                    Elevate to Executive Tone
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Polishes wording for leadership, clients, or formal publication.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onRunWorkAction('condense_to_brief')}
                disabled={isWorking}
                className="w-full p-2.5 bg-white hover:bg-indigo-50/60 border border-gray-200 hover:border-indigo-300 rounded-xl text-left transition-all group flex items-start gap-2.5 disabled:opacity-50"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-700">
                    Condense to 1-Page Brief
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Distills verbose files down to the essential core arguments and figures.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Instruction Bar */}
          <div className="space-y-1.5 pt-2 border-t border-gray-200">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Custom Polish Instruction
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="e.g. Add 3 bullet points discussing risk mitigation..."
                value={customWorkPrompt}
                onChange={(e) => setCustomWorkPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customWorkPrompt.trim()) {
                    onRunWorkAction('custom_assist', customWorkPrompt.trim());
                    setCustomWorkPrompt('');
                  }
                }}
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-hidden"
              />
              <button
                onClick={() => {
                  if (customWorkPrompt.trim()) {
                    onRunWorkAction('custom_assist', customWorkPrompt.trim());
                    setCustomWorkPrompt('');
                  }
                }}
                disabled={isWorking || !customWorkPrompt.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Last Work Result Banner */}
          {lastWorkResult && (
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs space-y-1.5 animate-in fade-in">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {lastWorkResult.actionSummary}
              </span>
              {lastWorkResult.keyChanges?.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 text-emerald-800 text-[11px]">
                  {lastWorkResult.keyChanges.map((change, idx) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
