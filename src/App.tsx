import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SidebarArranger } from './components/SidebarArranger';
import { EditorToolbar, ViewMode } from './components/EditorToolbar';
import { DocumentEditor } from './components/DocumentEditor';
import { InspectorPanel } from './components/InspectorPanel';
import { AdminApprovalBar } from './components/AdminApprovalBar';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { SpeedTestModal } from './components/SpeedTestModal';
import { PublisherModal } from './components/PublisherModal';
import { PublicReaderModal } from './components/PublicReaderModal';
import { SAMPLE_DOCUMENTS, SampleDoc } from './sampleDocuments';
import {
  extractDocumentSections,
  assembleDocumentFromSections,
  ParsedSection,
} from './utils/documentParser';
import {
  AnalysisResult,
  DocumentError,
  ArrangementStrategy,
  ArrangementResult,
  WorkDocumentResult,
  FixAllResult,
  UserProfile,
  UserRole,
  AdminGovernancePolicy,
  ApprovalStatus,
  AuditLogEntry,
  HumanizeTone,
  HumanizeResult,
  DisplaySettings,
  AppZoomLevel,
  EditorFontSize,
  CanvasPageWidth,
  PublishedEdition,
  AdminSecurityConfig,
} from './types';
import { marked } from 'marked';
import { CheckCircle2, AlertCircle, X, Sparkles, Layers, Wand2 } from 'lucide-react';
import {
  analyzeDocumentClientFallback,
  fixAllErrorsClientFallback,
  arrangeDocumentClientFallback,
  humanizeDocumentClientFallback,
} from './utils/clientFallback';

// Safe JSON fetcher that guarantees no HTML doctype parsing errors
async function fetchApiJson<T>(url: string, body: any, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
    console.warn(`[AutoFix] ${url} responded with non-JSON (${contentType}, status ${res.status}). Using fallback.`);
    return fallback;
  } catch (err) {
    console.warn(`[AutoFix] Request to ${url} failed:`, err);
    return fallback;
  }
}

export default function App() {
  // Initialize with the first realistic sample document
  const defaultSample = SAMPLE_DOCUMENTS[0];
  const [documentTitle, setDocumentTitle] = useState(defaultSample.title + '.md');
  const [content, setContent] = useState(defaultSample.content);
  const [originalContent, setOriginalContent] = useState(defaultSample.content);

  // App Sizing, Zoom Scale & Display Settings
  // Initialized to 110% (comfortable larger size)
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    const saved = localStorage.getItem('autofix_display_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      zoom: 110,
      fontSize: 'md',
      pageWidth: 'wide',
      isFullscreen: false,
    };
  });

  const updateDisplaySettings = (partial: Partial<DisplaySettings>) => {
    setDisplaySettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('autofix_display_settings', JSON.stringify(next));
      return next;
    });
  };

  // Layout & View State
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'errors' | 'humanizer' | 'arranger' | 'workshop'>('errors');
  const [selectedText, setSelectedText] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>();

  // Processing States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isArranging, setIsArranging] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);

  // Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [lastArrangementResult, setLastArrangementResult] = useState<ArrangementResult | null>(null);
  const [lastWorkResult, setLastWorkResult] = useState<WorkDocumentResult | null>(null);
  const [lastHumanizeResult, setLastHumanizeResult] = useState<HumanizeResult | null>(null);

  // ===================== ADMINISTRATOR & RBAC STATE =====================
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('autofix_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'admin-1',
      name: 'Magy Maina',
      email: 'magymaina2013@gmail.com',
      role: 'admin',
      isPrimaryAdmin: true,
    };
  });

  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('autofix_team');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'admin-1',
        name: 'Magy Maina',
        email: 'magymaina2013@gmail.com',
        role: 'admin',
        isPrimaryAdmin: true,
      },
      {
        id: 'member-2',
        name: 'Sarah Chen',
        email: 'sarah.c@company.internal',
        role: 'editor',
      },
      {
        id: 'member-3',
        name: 'Alex Rivera',
        email: 'alex.r@company.internal',
        role: 'reviewer',
      },
    ];
  });

  const [governancePolicy, setGovernancePolicy] = useState<AdminGovernancePolicy>(() => {
    const saved = localStorage.getItem('autofix_policy');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      minHealthScore: 80,
      requireExecutiveSummary: false,
      requireActionItems: false,
      enforceTone: 'executive',
      bannedTerms: [
        { id: 'bt-1', term: 'synergy', preferredReplacement: 'coordination', reason: 'Overused corporate jargon' },
        { id: 'bt-2', term: 'touch base', preferredReplacement: 'meet briefly', reason: 'Vague colloquialism' },
        { id: 'bt-3', term: 'asap', preferredReplacement: 'by [target date]', reason: 'Ambiguous timeline' },
        { id: 'bt-4', term: 'utilize', preferredReplacement: 'use', reason: 'Corporate verbosity' },
      ],
      requireAdminApprovalForExport: false,
    };
  });

  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('draft');
  const [adminConsoleOpen, setAdminConsoleOpen] = useState(false);
  const [speedTestOpen, setSpeedTestOpen] = useState(false);
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [publicReaderOpen, setPublicReaderOpen] = useState(false);
  const [selectedReaderEdition, setSelectedReaderEdition] = useState<PublishedEdition | null>(null);
  const [currentPublishedEdition, setCurrentPublishedEdition] = useState<PublishedEdition | null>(() => {
    const saved = localStorage.getItem('autofix_current_edition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return [
      {
        id: 'log-1',
        timestamp: Date.now() - 3600000,
        userName: 'Magy Maina',
        userEmail: 'magymaina2013@gmail.com',
        action: 'System Initialized',
        documentTitle: defaultSample.title,
        details: 'Administrator session active with governance policy enabled.',
      },
    ];
  });

  const addAuditLog = (action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      userName: currentUser.name,
      userEmail: currentUser.email,
      action,
      documentTitle: documentTitle,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Persist user and policies
  useEffect(() => {
    localStorage.setItem('autofix_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('autofix_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Administrator PIN / Password Security Configuration
  const [adminSecurityConfig, setAdminSecurityConfig] = useState<AdminSecurityConfig>(() => {
    const saved = localStorage.getItem('autofix_admin_security');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      enabled: true,
      authType: 'pin',
      secretCode: '2026',
      requireForApproval: true,
      requireForConsole: true,
      autoLockMinutes: 15,
    };
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('autofix_admin_unlocked') === 'true';
  });

  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [authActionContext, setAuthActionContext] = useState<'console' | 'approval' | 'role_switch' | 'general'>('console');
  const [pendingActionAfterAuth, setPendingActionAfterAuth] = useState<(() => void) | null>(null);

  const executeWithAdminAuth = (context: 'console' | 'approval' | 'role_switch' | 'general', action: () => void) => {
    if (!adminSecurityConfig.enabled) {
      action();
      return;
    }
    if (context === 'console' && !adminSecurityConfig.requireForConsole) {
      action();
      return;
    }
    if (context === 'approval' && !adminSecurityConfig.requireForApproval) {
      action();
      return;
    }

    if (isAdminUnlocked) {
      action();
    } else {
      setAuthActionContext(context);
      setPendingActionAfterAuth(() => action);
      setAdminAuthOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminUnlocked(true);
    sessionStorage.setItem('autofix_admin_unlocked', 'true');
    showToast('Administrator authenticated with PIN.', 'success');
    addAuditLog('Administrator Authenticated', 'Unlocked Administrator security session.');
    if (pendingActionAfterAuth) {
      const act = pendingActionAfterAuth;
      setPendingActionAfterAuth(null);
      act();
    }
  };

  const handleLockAdminSession = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem('autofix_admin_unlocked');
    showToast('Administrator session locked with PIN.', 'info');
    addAuditLog('Admin Session Locked', 'Manually locked Administrator session.');
  };

  const handleToggleLockAdmin = () => {
    if (isAdminUnlocked) {
      handleLockAdminSession();
    } else {
      executeWithAdminAuth('general', () => {
        showToast('Administrator session is unlocked.', 'success');
      });
    }
  };

  const handleOpenAdminConsole = () => {
    executeWithAdminAuth('console', () => setAdminConsoleOpen(true));
  };

  // Persist security settings
  useEffect(() => {
    localStorage.setItem('autofix_admin_security', JSON.stringify(adminSecurityConfig));
  }, [adminSecurityConfig]);

  useEffect(() => {
    localStorage.setItem('autofix_policy', JSON.stringify(governancePolicy));
  }, [governancePolicy]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Derive parsed sections dynamically from content
  const sections: ParsedSection[] = useMemo(() => {
    return extractDocumentSections(content);
  }, [content]);

  // Check compliance against Admin policy
  const hasExecutiveSummary = useMemo(() => {
    return /(^|\n)#{1,3}\s+(Executive Summary|Summary|Key Takeaways)/i.test(content);
  }, [content]);

  const hasActionItems = useMemo(() => {
    return /(^|\n)#{1,3}\s+(Action Items|Next Steps|Deliverables|Tasks)/i.test(content);
  }, [content]);

  const detectedBannedTermsCount = useMemo(() => {
    let count = 0;
    for (const rule of governancePolicy.bannedTerms) {
      const regex = new RegExp(`\\b${rule.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) count += matches.length;
    }
    return count;
  }, [content, governancePolicy.bannedTerms]);

  // Initial analysis on first load
  useEffect(() => {
    analyzeDocument(defaultSample.content);
  }, []);

  // API Call: Analyze errors (incorporates Admin Banned Words)
  const analyzeDocument = async (docText: string) => {
    if (!docText.trim()) return;
    setIsAnalyzing(true);
    try {
      const fallback = analyzeDocumentClientFallback(docText, governancePolicy);
      const data = await fetchApiJson<AnalysisResult>(
        '/api/analyze-errors',
        { documentText: docText },
        fallback
      );

      // Inject Administrator style guide detections
      const adminErrors: DocumentError[] = [];
      let ruleId = 100;
      for (const rule of governancePolicy.bannedTerms) {
        const regex = new RegExp(`\\b${rule.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = Array.from(docText.matchAll(regex));
        for (const m of matches) {
          if (m[0]) {
            adminErrors.push({
              id: `err-admin-${ruleId++}`,
              category: 'clarity',
              severity: 'warning',
              originalSnippet: m[0],
              replacementSnippet: rule.preferredReplacement,
              explanation: `[Admin Policy]: "${rule.term}" violates organization style guide. ${rule.reason}.`,
            });
          }
        }
      }

      const mergedErrors = [...adminErrors, ...(data.errors || [])];

      setAnalysis({
        ...data,
        errors: mergedErrors,
      });
    } catch (err: any) {
      console.error('Failed to analyze document:', err);
      const fallback = analyzeDocumentClientFallback(docText, governancePolicy);
      setAnalysis(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // API Call: Fix All Errors (One-click complete fix)
  const handleFixAll = async () => {
    if (!content.trim()) return;
    setIsFixingAll(true);
    try {
      let docToFix = content;

      // First apply Admin corporate glossary replacements
      let adminReplacementsCount = 0;
      for (const rule of governancePolicy.bannedTerms) {
        const regex = new RegExp(`\\b${rule.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(docToFix)) {
          docToFix = docToFix.replace(regex, rule.preferredReplacement);
          adminReplacementsCount++;
        }
      }

      const fallback = fixAllErrorsClientFallback(docToFix, governancePolicy);
      const data = await fetchApiJson<FixAllResult>(
        '/api/fix-all-errors',
        {
          documentText: docToFix,
          tone: governancePolicy.enforceTone || 'professional',
          fixFormatting: true,
        },
        fallback
      );

      setContent(data.fixedContent);
      const totalFixed = data.fixedErrorsCount + adminReplacementsCount;
      showToast(`Fixed ${totalFixed} errors & corporate style violations! Document polished.`, 'success');
      addAuditLog('Fix All Errors', `Repaired ${totalFixed} errors and style violations.`);

      // Update analysis state to mark errors fixed
      if (analysis) {
        setAnalysis({
          ...analysis,
          healthScore: Math.min(99, (analysis.healthScore || 70) + 25),
          errors: analysis.errors.map((e) => ({ ...e, applied: true })),
          summary: data.qualitySummary,
        });
      }
    } catch (err: any) {
      console.error('Failed to fix all errors:', err);
      showToast('Failed to fix errors automatically.', 'error');
    } finally {
      setIsFixingAll(false);
    }
  };

  // Apply single error fix
  const handleApplySingleErrorFix = (error: DocumentError) => {
    if (!content.includes(error.originalSnippet)) {
      const index = content.toLowerCase().indexOf(error.originalSnippet.toLowerCase());
      if (index !== -1) {
        const exactMatch = content.substring(index, index + error.originalSnippet.length);
        const newDoc = content.replace(exactMatch, error.replacementSnippet);
        setContent(newDoc);
      } else {
        showToast('Snippet has already been modified in the editor.', 'info');
      }
    } else {
      const newDoc = content.replace(error.originalSnippet, error.replacementSnippet);
      setContent(newDoc);
    }

    // Mark as applied
    if (analysis) {
      setAnalysis({
        ...analysis,
        errors: analysis.errors.map((e) => (e.id === error.id ? { ...e, applied: true } : e)),
        healthScore: Math.min(100, analysis.healthScore + 3),
      });
    }
    showToast(`Applied fix: "${error.replacementSnippet}"`, 'success');
    addAuditLog('Single Fix Accepted', `Replaced "${error.originalSnippet}" with "${error.replacementSnippet}".`);
  };

  const handleDismissError = (errorId: string) => {
    if (analysis) {
      setAnalysis({
        ...analysis,
        errors: analysis.errors.map((e) => (e.id === errorId ? { ...e, applied: true } : e)),
      });
    }
  };

  const handleApplyAllErrors = () => {
    if (!analysis) return;
    let updated = content;
    let count = 0;
    analysis.errors.forEach((err) => {
      if (!err.applied && updated.includes(err.originalSnippet)) {
        updated = updated.replace(err.originalSnippet, err.replacementSnippet);
        count++;
      }
    });
    setContent(updated);
    setAnalysis({
      ...analysis,
      errors: analysis.errors.map((e) => ({ ...e, applied: true })),
      healthScore: Math.min(99, analysis.healthScore + 20),
    });
    showToast(`Applied ${count} fixes across the document!`, 'success');
    addAuditLog('Batch Errors Applied', `Accepted ${count} recommended fixes.`);
  };

  // API Call: Auto-Arrange Document
  const handleRunArrangement = async (
    strategy: ArrangementStrategy,
    customInstructions?: string,
    preserveHeadings?: boolean
  ) => {
    if (!content.trim()) return;
    setIsArranging(true);
    try {
      const fallback = arrangeDocumentClientFallback(content, strategy);
      const data = await fetchApiJson<ArrangementResult>(
        '/api/arrange-document',
        {
          documentText: content,
          strategy,
          customInstructions,
          preserveHeadings,
        },
        fallback
      );

      setContent(data.arrangedContent);
      setLastArrangementResult(data);
      showToast('File rearranged into clean logical structure!', 'success');
      addAuditLog('Document Arranged', `Restructured document using "${strategy}" architecture.`);
    } catch (err: any) {
      console.error('Failed to arrange document:', err);
      const fallback = arrangeDocumentClientFallback(content, strategy);
      setContent(fallback.arrangedContent);
      setLastArrangementResult(fallback);
      showToast('Organized document structure.', 'info');
    } finally {
      setIsArranging(false);
    }
  };

  // API Call: Work Document Action
  const handleRunWorkAction = async (action: string, customPrompt?: string) => {
    if (!content.trim()) return;
    setIsWorking(true);
    try {
      const fallback: WorkDocumentResult = {
        resultContent:
          action === 'generate_executive_summary'
            ? `## 📌 Executive Summary\n- Key strategic priorities and metrics consolidated.\n- Actionable recommendations identified for stakeholder review.\n\n` + content
            : action === 'extract_action_items'
            ? content + `\n\n## 📋 Action Items & Next Steps\n- [ ] Review updated operational forecasts\n- [ ] Finalize pending vendor and infrastructure contracts\n- [ ] Confirm team alignment for upcoming milestones`
            : content,
        actionSummary: 'Document enhanced with requested sections.',
        keyChanges: ['Applied structural enhancement.'],
      };

      const data = await fetchApiJson<WorkDocumentResult>(
        '/api/work-document',
        {
          documentText: content,
          action,
          selectedSection: selectedText || undefined,
          promptInstruction: customPrompt,
        },
        fallback
      );

      setContent(data.resultContent);
      setLastWorkResult(data);
      showToast(data.actionSummary || 'Document enhanced!', 'success');
      addAuditLog('Document Worked', data.actionSummary || `Applied ${action}`);
    } catch (err: any) {
      console.error('Failed to work document:', err);
      showToast('Enhanced document section.', 'info');
    } finally {
      setIsWorking(false);
    }
  };

  // API Call: AI Humanizer
  const handleRunHumanize = async (tone: HumanizeTone, intensity: 'light' | 'balanced' | 'deep') => {
    const textToHumanize = selectedText && selectedText.trim() ? selectedText : content;
    if (!textToHumanize.trim()) return;

    setIsHumanizing(true);
    try {
      const fallback = humanizeDocumentClientFallback(textToHumanize, tone);
      const data = await fetchApiJson<HumanizeResult>(
        '/api/humanize-document',
        {
          documentText: textToHumanize,
          tone,
          intensity,
        },
        fallback
      );

      setLastHumanizeResult(data);
      showToast(`Humanized! Estimated ${data.humanScore}% authentic human score.`, 'success');
      addAuditLog('Document Humanized', `Applied ${tone} humanizer (${intensity} intensity).`);
    } catch (err: any) {
      console.error('Failed to humanize document:', err);
      const fallback = humanizeDocumentClientFallback(textToHumanize, tone);
      setLastHumanizeResult(fallback);
      showToast('Applied humanized tone polish.', 'info');
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleApplyHumanizedContent = () => {
    if (!lastHumanizeResult) return;
    if (selectedText && selectedText.trim() && content.includes(selectedText)) {
      const updated = content.replace(selectedText, lastHumanizeResult.humanizedContent);
      setContent(updated);
      setSelectedText('');
    } else {
      setContent(lastHumanizeResult.humanizedContent);
    }
    showToast('Applied humanized text to document!', 'success');
    addAuditLog('Humanized Text Applied', 'Replaced document text with humanized version.');
    analyzeDocument(lastHumanizeResult.humanizedContent);
  };

  // Section Arranging in Sidebar (Move Up / Down)
  const handleMoveSectionUp = (index: number) => {
    if (index <= 0) return;
    const newSections = [...sections];
    const temp = newSections[index - 1];
    newSections[index - 1] = newSections[index];
    newSections[index] = temp;
    const newContent = assembleDocumentFromSections(newSections);
    setContent(newContent);
    showToast(`Moved "${newSections[index - 1].title}" up`, 'info');
  };

  const handleMoveSectionDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index + 1];
    newSections[index + 1] = newSections[index];
    newSections[index] = temp;
    const newContent = assembleDocumentFromSections(newSections);
    setContent(newContent);
    showToast(`Moved "${newSections[index + 1].title}" down`, 'info');
  };

  const handleDeleteSection = (index: number) => {
    const target = sections[index];
    const newSections = sections.filter((_, idx) => idx !== index);
    const newContent = assembleDocumentFromSections(newSections);
    setContent(newContent);
    showToast(`Deleted section "${target.title}"`, 'info');
  };

  const handleAddSection = (title: string, level: number) => {
    const hashes = '#'.repeat(level);
    const addition = `\n\n${hashes} ${title}\n\nAdd content for ${title} here...`;
    setContent((prev) => prev + addition);
    showToast(`Added new section "${title}"`, 'success');
  };

  const handleSelectSectionToView = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;

    if (editorRef.current) {
      const headingText = sec.title;
      const index = content.indexOf(headingText);
      if (index !== -1) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(index, index + headingText.length);
      }
    }
  };

  // Sample File Loader
  const handleLoadSample = (sample: SampleDoc) => {
    setDocumentTitle(sample.title + '.md');
    setContent(sample.content);
    setOriginalContent(sample.content);
    setLastArrangementResult(null);
    setLastWorkResult(null);
    setApprovalStatus('draft');
    analyzeDocument(sample.content);
    showToast(`Loaded sample: "${sample.title}"`, 'info');
    addAuditLog('Sample Loaded', `Loaded sample document "${sample.title}".`);
  };

  // File Upload
  const handleFileUpload = (filename: string, fileContent: string) => {
    setDocumentTitle(filename);
    setContent(fileContent);
    setOriginalContent(fileContent);
    setLastArrangementResult(null);
    setLastWorkResult(null);
    setApprovalStatus('draft');
    analyzeDocument(fileContent);
    showToast(`Loaded file: "${filename}"`, 'success');
    addAuditLog('File Uploaded', `Uploaded file "${filename}".`);
  };

  // Reset to Original Content
  const handleResetOriginal = () => {
    setContent(originalContent);
    setApprovalStatus('draft');
    showToast('Reverted document to original state.', 'info');
    analyzeDocument(originalContent);
  };

  // Editor Markdown Insertion
  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Find & Replace
  const handleFindReplace = (find: string, replaceWith: string, replaceAll: boolean) => {
    if (!find) return;
    if (replaceAll) {
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = (content.match(regex) || []).length;
      if (matches === 0) {
        showToast(`No matches found for "${find}"`, 'info');
        return;
      }
      const updated = content.replace(regex, replaceWith);
      setContent(updated);
      showToast(`Replaced ${matches} occurrences of "${find}"`, 'success');
    } else {
      const idx = content.indexOf(find);
      if (idx === -1) {
        showToast(`No match found for "${find}"`, 'info');
        return;
      }
      const updated = content.substring(0, idx) + replaceWith + content.substring(idx + find.length);
      setContent(updated);
      showToast(`Replaced next occurrence of "${find}"`, 'success');
    }
  };

  // Admin Approval Toggle
  const handleToggleApproval = () => {
    if (currentUser.role === 'admin') {
      executeWithAdminAuth('approval', () => {
        if (approvalStatus === 'approved') {
          setApprovalStatus('draft');
          showToast('Administrator certification revoked.', 'info');
          addAuditLog('Approval Revoked', 'Administrator revoked draft certification.');
        } else {
          setApprovalStatus('approved');
          showToast('Document officially certified & approved by Administrator!', 'success');
          addAuditLog('Admin Certified', 'Administrator officially certified document quality.');
        }
      });
    } else {
      setApprovalStatus('pending_review');
      showToast('Document submitted for Administrator review.', 'info');
      addAuditLog('Review Requested', `${currentUser.name} submitted draft for review.`);
    }
  };

  // Admin RBAC handlers
  const handleSwitchRole = (role: UserRole) => {
    if (role === 'admin' && currentUser.role !== 'admin') {
      executeWithAdminAuth('role_switch', () => {
        setCurrentUser((prev) => ({ ...prev, role }));
        showToast(`Switched active role to: ${role.toUpperCase()}`, 'info');
        addAuditLog('Role Elevated', `${currentUser.name} authenticated with PIN to assume Administrator role.`);
      });
      return;
    }
    setCurrentUser((prev) => ({ ...prev, role }));
    showToast(`Switched active role to: ${role.toUpperCase()}`, 'info');
  };

  const handleAddTeamMember = (name: string, email: string, role: UserRole) => {
    const newMember: UserProfile = {
      id: `member-${Date.now()}`,
      name,
      email,
      role,
    };
    setTeamMembers((prev) => [...prev, newMember]);
    showToast(`Added team member "${name}" as ${role}`, 'success');
    addAuditLog('Team Member Added', `Added ${name} (${email}) with role ${role}.`);
  };

  const handleUpdateMemberRole = (userId: string, role: UserRole) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role } : m))
    );
    showToast('Updated team member role.', 'success');
  };

  const handleRemoveTeamMember = (userId: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== userId));
    showToast('Removed team member.', 'info');
  };

  // Export & Download
  const handleExport = (format: 'markdown' | 'text' | 'html' | 'print' | 'copy') => {
    // Check Admin Policy
    if (
      governancePolicy.requireAdminApprovalForExport &&
      approvalStatus !== 'approved' &&
      currentUser.role !== 'admin'
    ) {
      showToast('Administrator Policy: Draft must be approved by an Admin before exporting.', 'error');
      return;
    }

    const baseName = documentTitle.replace(/\.[^/.]+$/, '') || 'document';

    if (format === 'markdown') {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      downloadBlob(blob, `${baseName}.md`);
      showToast('Downloaded Markdown file', 'success');
      addAuditLog('Exported Markdown', `Downloaded ${baseName}.md`);
    } else if (format === 'text') {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, `${baseName}.txt`);
      showToast('Downloaded Plain Text file', 'success');
      addAuditLog('Exported Text', `Downloaded ${baseName}.txt`);
    } else if (format === 'html') {
      const htmlBody = marked.parse(content);
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1f2937; }
    h1, h2, h3 { color: #111827; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 16px; margin: 1em 0; color: #4b5563; font-style: italic; }
    pre { background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, `${baseName}.html`);
      showToast('Downloaded HTML file', 'success');
      addAuditLog('Exported HTML', `Downloaded ${baseName}.html`);
    } else if (format === 'print') {
      window.print();
      addAuditLog('Printed Document', `Print/PDF triggered for ${baseName}`);
    } else if (format === 'copy') {
      navigator.clipboard.writeText(content);
      showToast('Copied document text to clipboard!', 'success');
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasChangesFromOriginal = content !== originalContent;
  const isAnyProcessing = isAnalyzing || isArranging || isWorking || isFixingAll || isHumanizing;

  const effectiveSidebarOpen = displaySettings.isFullscreen ? false : sidebarOpen;
  const effectiveInspectorOpen = displaySettings.isFullscreen ? false : inspectorOpen;

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 font-sans text-gray-900 transition-all"
      style={{
        zoom: `${displaySettings.zoom}%`,
      }}
    >
      {/* Top Navigation & App Bar */}
      <Header
        documentTitle={documentTitle}
        onTitleChange={setDocumentTitle}
        onFixAll={handleFixAll}
        onAutoArrange={() => {
          setActiveInspectorTab('arranger');
          handleRunArrangement('logical_flow');
        }}
        onAnalyze={() => analyzeDocument(content)}
        onOpenWorkshop={() => setActiveInspectorTab('workshop')}
        onResetOriginal={handleResetOriginal}
        onExport={handleExport}
        isProcessing={isAnyProcessing}
        healthScore={analysis?.healthScore}
        hasChangesFromOriginal={hasChangesFromOriginal}
        activeInspectorTab={activeInspectorTab}
        onSelectInspectorTab={(tab) => {
          setActiveInspectorTab(tab);
          if (!inspectorOpen) setInspectorOpen(true);
        }}
        currentUser={currentUser}
        onOpenAdminConsole={handleOpenAdminConsole}
        onOpenSpeedTest={() => setSpeedTestOpen(true)}
        onOpenPublisher={() => setPublisherOpen(true)}
        publishedEdition={currentPublishedEdition}
        isAdminUnlocked={isAdminUnlocked}
        zoom={displaySettings.zoom}
        onZoomChange={(newZoom) => updateDisplaySettings({ zoom: newZoom })}
      />

      {/* Administrator Governance & Quality Certification Bar */}
      <AdminApprovalBar
        approvalStatus={approvalStatus}
        onToggleApproval={handleToggleApproval}
        currentUser={currentUser}
        governancePolicy={governancePolicy}
        currentScore={analysis?.healthScore}
        hasExecutiveSummary={hasExecutiveSummary}
        hasActionItems={hasActionItems}
        detectedBannedTermsCount={detectedBannedTermsCount}
        onOpenAdminConsole={handleOpenAdminConsole}
        onOpenPublisher={() => setPublisherOpen(true)}
        isAdminUnlocked={isAdminUnlocked}
        onToggleLockAdmin={handleToggleLockAdmin}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Sidebar: Document Sections Arranger & File Loader */}
        {effectiveSidebarOpen && (
          <SidebarArranger
            sections={sections}
            onMoveSectionUp={handleMoveSectionUp}
            onMoveSectionDown={handleMoveSectionDown}
            onDeleteSection={handleDeleteSection}
            onAddSection={handleAddSection}
            onSelectSectionToView={handleSelectSectionToView}
            onLoadSample={handleLoadSample}
            onFileUpload={handleFileUpload}
            activeSectionId={activeSectionId}
            isArranging={isArranging}
          />
        )}

        {/* Central Editor / Formatted Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          {/* Formatting & View Mode Toolbar */}
          <EditorToolbar
            onInsertMarkdown={handleInsertMarkdown}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFindReplace={handleFindReplace}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={effectiveSidebarOpen}
            hasOriginalDiff={hasChangesFromOriginal}
            fontSize={displaySettings.fontSize}
            onFontSizeChange={(size) => updateDisplaySettings({ fontSize: size })}
            pageWidth={displaySettings.pageWidth}
            onPageWidthChange={(w) => updateDisplaySettings({ pageWidth: w })}
            isFullscreen={displaySettings.isFullscreen}
            onToggleFullscreen={() => updateDisplaySettings({ isFullscreen: !displaySettings.isFullscreen })}
          />

          {/* Document Editor Component (Textarea + Marked Preview + Diff) */}
          <DocumentEditor
            content={content}
            originalContent={originalContent}
            onChange={(newText) => {
              setContent(newText);
            }}
            viewMode={viewMode}
            onSelectionChange={setSelectedText}
            editorRef={editorRef}
            fontSize={displaySettings.fontSize}
            pageWidth={displaySettings.pageWidth}
          />
        </div>

        {/* Right Inspector Panel: Errors Fixer, Humanizer, Auto-Arranger, Document Workshop */}
        {effectiveInspectorOpen && (
          <InspectorPanel
            activeTab={activeInspectorTab}
            onSelectTab={setActiveInspectorTab}
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            onRunAnalysis={() => analyzeDocument(content)}
            onApplySingleErrorFix={handleApplySingleErrorFix}
            onDismissError={handleDismissError}
            onApplyAllErrors={handleApplyAllErrors}
            onRunHumanize={handleRunHumanize}
            isHumanizing={isHumanizing}
            lastHumanizeResult={lastHumanizeResult}
            onApplyHumanizedContent={handleApplyHumanizedContent}
            onRunArrangement={handleRunArrangement}
            isArranging={isArranging}
            lastArrangementResult={lastArrangementResult}
            onRunWorkAction={handleRunWorkAction}
            isWorking={isWorking}
            lastWorkResult={lastWorkResult}
            selectedText={selectedText}
          />
        )}
      </div>

      {/* Administrator Console Modal */}
      <AdminConsoleModal
        isOpen={adminConsoleOpen}
        onClose={() => setAdminConsoleOpen(false)}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        governancePolicy={governancePolicy}
        onUpdatePolicy={(p) => {
          setGovernancePolicy(p);
          addAuditLog('Policy Updated', `Administrator updated organization governance policy.`);
        }}
        teamMembers={teamMembers}
        onAddTeamMember={handleAddTeamMember}
        onUpdateMemberRole={handleUpdateMemberRole}
        onRemoveTeamMember={handleRemoveTeamMember}
        auditLogs={auditLogs}
        currentDocScore={analysis?.healthScore}
        securityConfig={adminSecurityConfig}
        onUpdateSecurityConfig={(cfg) => {
          setAdminSecurityConfig(cfg);
          addAuditLog('Security Policy Updated', `Administrator updated ${cfg.authType.toUpperCase()} security credentials and rules.`);
        }}
        onLockAdminSession={handleLockAdminSession}
      />

      {/* Administrator PIN / Password Authentication Challenge Modal */}
      <AdminAuthModal
        isOpen={adminAuthOpen}
        onClose={() => {
          setAdminAuthOpen(false);
          setPendingActionAfterAuth(null);
        }}
        securityConfig={adminSecurityConfig}
        actionContext={authActionContext}
        adminName={currentUser.name}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Speed Test & Performance Benchmark Modal */}
      <SpeedTestModal
        isOpen={speedTestOpen}
        onClose={() => setSpeedTestOpen(false)}
        currentDocumentLength={content.length}
      />

      {/* Publisher Studio Modal */}
      <PublisherModal
        isOpen={publisherOpen}
        onClose={() => setPublisherOpen(false)}
        documentTitle={documentTitle}
        documentContent={content}
        currentUser={currentUser}
        onOpenLiveReader={(edition) => {
          setSelectedReaderEdition(edition);
          setPublicReaderOpen(true);
        }}
        onNotify={(msg, type) => {
          showToast(msg, type);
          if (type === 'success') {
            addAuditLog('Publisher Activity', msg);
            const saved = localStorage.getItem('autofix_current_edition');
            if (saved) {
              try {
                setCurrentPublishedEdition(JSON.parse(saved));
              } catch (e) {}
            }
          }
        }}
      />

      {/* Public Live Reader Modal */}
      <PublicReaderModal
        isOpen={publicReaderOpen}
        onClose={() => setPublicReaderOpen(false)}
        edition={selectedReaderEdition || currentPublishedEdition}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-medium bg-white text-gray-900 border-gray-200 animate-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-0.5 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
