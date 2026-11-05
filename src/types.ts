export type ErrorCategory = 'grammar' | 'structure' | 'clarity' | 'formatting' | 'placeholder';
export type ErrorSeverity = 'critical' | 'warning' | 'suggestion';

export interface DocumentError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  originalSnippet: string;
  replacementSnippet: string;
  explanation: string;
  applied?: boolean;
}

export interface AnalysisResult {
  healthScore: number;
  readabilityGrade: string;
  summary: string;
  errors: DocumentError[];
  structuralSuggestions: string[];
  policyViolations?: string[];
}

export interface DocumentSection {
  id: string;
  title: string;
  level: number;
  summary: string;
  startIndex?: number;
}

export interface ArrangementResult {
  arrangedContent: string;
  reorganizationNotes: string[];
  sections: DocumentSection[];
  tableOfContents?: string;
}

export interface FixAllResult {
  fixedContent: string;
  fixedErrorsCount: number;
  qualitySummary: string;
  highlights: {
    original: string;
    correction: string;
    reason: string;
  }[];
}

export interface WorkDocumentResult {
  resultContent: string;
  actionSummary: string;
  keyChanges: string[];
}

export type ArrangementStrategy =
  | 'logical_flow'
  | 'executive_brief'
  | 'chronological_process'
  | 'business_proposal'
  | 'academic_report'
  | 'clean_outline';

export interface DocumentHistoryEntry {
  timestamp: number;
  label: string;
  content: string;
}

// Humanizer Types
export type HumanizeTone = 'natural' | 'conversational' | 'executive' | 'storytelling' | 'punchy';

export interface HumanizeResult {
  humanizedContent: string;
  humanScore: number;
  originalRoboticScore: number;
  cadenceVariety: string;
  clichesRemoved: {
    originalPhrase: string;
    humanizedPhrase: string;
    reason: string;
  }[];
  improvementsSummary: string;
}

// Administrator & RBAC types
export type UserRole = 'admin' | 'editor' | 'reviewer' | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isPrimaryAdmin?: boolean;
  avatarColor?: string;
}

export interface BannedTermRule {
  id: string;
  term: string;
  preferredReplacement: string;
  reason: string;
}

export interface AdminGovernancePolicy {
  minHealthScore: number; // e.g. 85
  requireExecutiveSummary: boolean;
  requireActionItems: boolean;
  enforceTone: 'executive' | 'formal' | 'plain_english' | 'any';
  bannedTerms: BannedTermRule[];
  requireAdminApprovalForExport: boolean;
}

export interface AdminSecurityConfig {
  enabled: boolean;
  authType: 'pin' | 'password';
  secretCode: string; // PIN or Password (default '2026')
  requireForApproval: boolean;
  requireForConsole: boolean;
  autoLockMinutes: number; // e.g. 15, 30, or 0 (manual only)
}

export type ApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userEmail: string;
  userName: string;
  action: string;
  documentTitle: string;
  details: string;
}

export type AppZoomLevel = 90 | 100 | 110 | 120 | 130 | 140 | 150;
export type EditorFontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type CanvasPageWidth = 'standard' | 'wide' | 'full';

export interface DisplaySettings {
  zoom: AppZoomLevel;
  fontSize: EditorFontSize;
  pageWidth: CanvasPageWidth;
  isFullscreen: boolean;
}

// Publisher Types
export type PublicationVisibility = 'public' | 'unlisted' | 'password';
export type PublishingStatus = 'draft' | 'scheduled' | 'published';
export type PublicationChannel = 'web_reader' | 'newsletter' | 'social_thread' | 'cms_webhook' | 'markdown_export';

export interface SocialSnippetPost {
  platform: 'twitter' | 'linkedin' | 'slack_digest';
  title: string;
  content: string;
  charCount: number;
}

export interface PublicationMetadata {
  slug: string;
  customTitle: string;
  subtitle: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  coverTheme: 'ocean' | 'midnight' | 'emerald' | 'amber' | 'minimal' | 'gradient';
  coverImageUrl?: string;
  visibility: PublicationVisibility;
  password?: string;
  scheduledDate?: string;
  metaDescription: string;
  canonicalUrl?: string;
  allowComments: boolean;
  showReadingTime: boolean;
}

export interface PublishedEdition {
  id: string;
  version: number;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publishedAt: number;
  status: PublishingStatus;
  viewCount: number;
  wordCount: number;
  readingTimeMinutes: number;
  shareableUrl: string;
  visibility: PublicationVisibility;
  contentSnapshot: string;
  category: string;
  tags: string[];
  coverTheme: string;
}

export interface PublishResult {
  edition: PublishedEdition;
  htmlReader: string;
  newsletterHtml: string;
  frontmatterMarkdown: string;
  socialSnippets: SocialSnippetPost[];
}

