import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Settings2,
  FileCheck,
  UserCheck,
  Globe,
} from 'lucide-react';
import { ApprovalStatus, UserProfile, AdminGovernancePolicy } from '../types';

interface AdminApprovalBarProps {
  approvalStatus: ApprovalStatus;
  onToggleApproval: () => void;
  currentUser: UserProfile;
  governancePolicy: AdminGovernancePolicy;
  currentScore?: number;
  hasExecutiveSummary: boolean;
  hasActionItems: boolean;
  detectedBannedTermsCount: number;
  onOpenAdminConsole: () => void;
  onOpenPublisher?: () => void;
  isAdminUnlocked?: boolean;
  onToggleLockAdmin?: () => void;
}

export const AdminApprovalBar: React.FC<AdminApprovalBarProps> = ({
  approvalStatus,
  onToggleApproval,
  currentUser,
  governancePolicy,
  currentScore,
  hasExecutiveSummary,
  hasActionItems,
  detectedBannedTermsCount,
  onOpenAdminConsole,
  onOpenPublisher,
  isAdminUnlocked,
  onToggleLockAdmin,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const scoreMeetsPolicy = currentScore !== undefined && currentScore >= governancePolicy.minHealthScore;
  const execSummaryOk = !governancePolicy.requireExecutiveSummary || hasExecutiveSummary;
  const actionItemsOk = !governancePolicy.requireActionItems || hasActionItems;
  const termsOk = detectedBannedTermsCount === 0;

  const isCompliant = scoreMeetsPolicy && execSummaryOk && actionItemsOk && termsOk;

  return (
    <div className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 shadow-xs shrink-0 select-none">
      {/* Left: Status & Compliance Badges */}
      <div className="flex items-center flex-wrap gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Doc Governance:
          </span>
          {approvalStatus === 'approved' ? (
            <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Certified & Approved</span>
            </span>
          ) : approvalStatus === 'pending_review' ? (
            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pending Administrator Review</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-semibold text-[11px]">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Working Draft</span>
            </span>
          )}
        </div>

        <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

        {/* Policy Check Indicators */}
        <div className="flex items-center space-x-2 text-[11px]">
          <span
            className={`flex items-center gap-1 px-1.5 py-0.2 rounded font-medium ${
              scoreMeetsPolicy ? 'text-emerald-400' : 'text-amber-400'
            }`}
            title={`Required score: ${governancePolicy.minHealthScore}/100`}
          >
            {scoreMeetsPolicy ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            <span>Score: {currentScore ?? 'N/A'}/{governancePolicy.minHealthScore}</span>
          </span>

          {governancePolicy.requireExecutiveSummary && (
            <span
              className={`flex items-center gap-1 px-1.5 py-0.2 rounded font-medium ${
                execSummaryOk ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {execSummaryOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              <span>Exec Summary</span>
            </span>
          )}

          {governancePolicy.requireActionItems && (
            <span
              className={`flex items-center gap-1 px-1.5 py-0.2 rounded font-medium ${
                actionItemsOk ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {actionItemsOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              <span>Action Items</span>
            </span>
          )}

          {detectedBannedTermsCount > 0 && (
            <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/60 border border-rose-800/60 px-1.5 py-0.2 rounded">
              <ShieldAlert className="w-3 h-3" />
              <span>{detectedBannedTermsCount} Banned Word{detectedBannedTermsCount > 1 ? 's' : ''}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Admin Action Buttons */}
      <div className="flex items-center space-x-2">
        {isAdmin ? (
          <>
            <button
              onClick={onToggleApproval}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                approvalStatus === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : isCompliant
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {approvalStatus === 'approved' ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Approved (Click to Revoke)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isCompliant ? 'Approve & Certify Draft' : 'Approve (Override Policy)'}</span>
                </>
              )}
            </button>

            {approvalStatus === 'approved' && onOpenPublisher && (
              <button
                onClick={onOpenPublisher}
                title="Publish this approved document now"
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish Approved Doc</span>
              </button>
            )}

            <button
              onClick={onOpenAdminConsole}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Console</span>
            </button>

            {onToggleLockAdmin && (
              <button
                onClick={onToggleLockAdmin}
                title={isAdminUnlocked ? "Administrator session is Unlocked (Click to Lock with PIN)" : "Administrator is Locked (Click to unlock with PIN)"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isAdminUnlocked
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                }`}
              >
                {isAdminUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
                <span>{isAdminUnlocked ? 'Admin Unlocked' : 'PIN Locked'}</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={onToggleApproval}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{approvalStatus === 'pending_review' ? 'Marked for Review' : 'Submit for Admin Review'}</span>
            </button>

            <button
              onClick={onOpenAdminConsole}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 rounded-lg text-xs"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>View Rules</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
