import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Settings2,
  FileCheck2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserPlus,
  X,
  History,
  Lock,
  Unlock,
  Sliders,
  Award,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';
import {
  UserProfile,
  UserRole,
  AdminGovernancePolicy,
  BannedTermRule,
  AuditLogEntry,
  AdminSecurityConfig,
} from '../types';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSwitchRole: (role: UserRole) => void;
  governancePolicy: AdminGovernancePolicy;
  onUpdatePolicy: (policy: AdminGovernancePolicy) => void;
  teamMembers: UserProfile[];
  onAddTeamMember: (name: string, email: string, role: UserRole) => void;
  onUpdateMemberRole: (userId: string, role: UserRole) => void;
  onRemoveTeamMember: (userId: string) => void;
  auditLogs: AuditLogEntry[];
  currentDocScore?: number;
  securityConfig: AdminSecurityConfig;
  onUpdateSecurityConfig: (config: AdminSecurityConfig) => void;
  onLockAdminSession?: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchRole,
  governancePolicy,
  onUpdatePolicy,
  teamMembers,
  onAddTeamMember,
  onUpdateMemberRole,
  onRemoveTeamMember,
  auditLogs,
  currentDocScore,
  securityConfig,
  onUpdateSecurityConfig,
  onLockAdminSession,
}) => {
  const [activeTab, setActiveTab] = useState<'governance' | 'team' | 'audit' | 'security'>('governance');

  // Security Form States
  const [newSecretCode, setNewSecretCode] = useState('');
  const [confirmSecretCode, setConfirmSecretCode] = useState('');
  const [showSecretField, setShowSecretField] = useState(false);
  const [securityStatusMsg, setSecurityStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for adding banned word
  const [newTerm, setNewTerm] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [newReason, setNewReason] = useState('');

  // Form state for adding team member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('editor');

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleAddBannedTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newReplacement.trim()) return;

    const newRule: BannedTermRule = {
      id: `rule-${Date.now()}`,
      term: newTerm.trim(),
      preferredReplacement: newReplacement.trim(),
      reason: newReason.trim() || 'Administrator corporate style policy',
    };

    onUpdatePolicy({
      ...governancePolicy,
      bannedTerms: [...governancePolicy.bannedTerms, newRule],
    });

    setNewTerm('');
    setNewReplacement('');
    setNewReason('');
  };

  const handleRemoveBannedTerm = (id: string) => {
    onUpdatePolicy({
      ...governancePolicy,
      bannedTerms: governancePolicy.bannedTerms.filter((r) => r.id !== id),
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    onAddTeamMember(newMemberName.trim(), newMemberEmail.trim(), newMemberRole);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-700/80 border border-indigo-400/40 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Administrator & Governance Console</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Admin Active
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Manage organization quality rules, corporate style policies, team roles, and audit compliance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Role Switcher Bar */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.charAt(0)}
            </div>
            <span className="text-gray-700">
              Logged in as <strong className="text-indigo-900 font-semibold">{currentUser.name}</strong> ({currentUser.email})
            </span>
          </div>

          {/* Quick RBAC Role Tester */}
          <div className="flex items-center space-x-1.5 bg-white p-1 rounded-lg border border-indigo-200">
            <span className="text-[10px] font-bold text-gray-500 uppercase px-1">Role:</span>
            {(['admin', 'editor', 'reviewer'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => onSwitchRole(role)}
                className={`px-2 py-0.5 rounded text-xs font-semibold capitalize transition-all ${
                  currentUser.role === role
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('governance')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'governance'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Governance & Quality Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'team'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members & Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Logs & Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>PIN & Security Password</span>
          </button>
        </div>

        {/* Tab 1: Governance & Quality Rules */}
        {activeTab === 'governance' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!isAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Viewing as <strong>{currentUser.role}</strong>. Only an <strong>Administrator</strong> can modify organization governance rules.
                </span>
              </div>
            )}

            {/* Quality Thresholds */}
            <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Document Quality Thresholds
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700">
                    Minimum Document Health Score Required for Approval
                  </span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {governancePolicy.minHealthScore}/100
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  disabled={!isAdmin}
                  value={governancePolicy.minHealthScore}
                  onChange={(e) =>
                    onUpdatePolicy({
                      ...governancePolicy,
                      minHealthScore: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer disabled:opacity-50"
                />
                <p className="text-[11px] text-gray-500">
                  Documents scoring below this threshold will be flagged as non-compliant before approval or official export.
                </p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center space-x-2 text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300">
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={governancePolicy.requireExecutiveSummary}
                    onChange={(e) =>
                      onUpdatePolicy({
                        ...governancePolicy,
                        requireExecutiveSummary: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Require Executive Summary</p>
                    <p className="text-[10px] text-gray-500">Flags docs that lack a synthesis section</p>
                  </div>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300">
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={governancePolicy.requireActionItems}
                    onChange={(e) =>
                      onUpdatePolicy({
                        ...governancePolicy,
                        requireActionItems: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Require Action Items</p>
                    <p className="text-[10px] text-gray-500">Enforces clear task/deliverable checklists</p>
                  </div>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 md:col-span-2">
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={governancePolicy.requireAdminApprovalForExport}
                    onChange={(e) =>
                      onUpdatePolicy({
                        ...governancePolicy,
                        requireAdminApprovalForExport: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Enforce Admin Approval Gate for PDF/Print</p>
                    <p className="text-[10px] text-gray-500">
                      Warns team members if a document hasn't received official Administrator sign-off
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Banned / Discouraged Term Dictionary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    Corporate Style Guide & Terminology Enforcement
                  </h3>
                  <p className="text-xs text-gray-500">
                    The Error Scanner will automatically detect and correct these terms.
                  </p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                  {governancePolicy.bannedTerms.length} Rules Active
                </span>
              </div>

              {/* Add new term form */}
              {isAdmin && (
                <form
                  onSubmit={handleAddBannedTerm}
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-wrap items-center gap-2 text-xs"
                >
                  <input
                    type="text"
                    placeholder="Banned phrase (e.g. synergy)..."
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs w-44 focus:outline-hidden focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Preferred replacement (e.g. coordination)..."
                    value={newReplacement}
                    onChange={(e) => setNewReplacement(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs w-52 focus:outline-hidden focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Reason/Policy note..."
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs flex-1 min-w-36 focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </form>
              )}

              {/* List of rules */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {governancePolicy.bannedTerms.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 text-xs hover:border-gray-300"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono bg-rose-50 text-rose-800 line-through px-2 py-0.5 rounded border border-rose-100">
                        {rule.term}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-mono bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-100">
                        {rule.preferredReplacement}
                      </span>
                      <span className="text-gray-500 text-[11px] italic">({rule.reason})</span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveBannedTerm(rule.id)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Team Members & RBAC */}
        {activeTab === 'team' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Organization Team Members & Access Roles
                </h3>
                <p className="text-xs text-gray-500">
                  Assign administrative, editing, or review privileges to team members.
                </p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                {teamMembers.length} Members
              </span>
            </div>

            {/* Add Member Form */}
            {isAdmin && (
              <form
                onSubmit={handleAddMember}
                className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-wrap items-center gap-2 text-xs"
              >
                <input
                  type="text"
                  placeholder="Full Name..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs w-40 focus:outline-hidden focus:border-indigo-500"
                />
                <input
                  type="email"
                  placeholder="Email address..."
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs flex-1 min-w-44 focus:outline-hidden focus:border-indigo-500"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden"
                >
                  <option value="admin">Administrator</option>
                  <option value="editor">Senior Editor</option>
                  <option value="reviewer">Reviewer</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </form>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        member.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : member.role === 'editor'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{member.name}</span>
                        {member.isPrimaryAdmin && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-200">
                            Primary Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAdmin && !member.isPrimaryAdmin ? (
                      <select
                        value={member.role}
                        onChange={(e) => onUpdateMemberRole(member.id, e.target.value as UserRole)}
                        className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-md text-xs font-semibold capitalize"
                      >
                        <option value="admin">Administrator</option>
                        <option value="editor">Senior Editor</option>
                        <option value="reviewer">Reviewer</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {member.role}
                      </span>
                    )}

                    {isAdmin && !member.isPrimaryAdmin && (
                      <button
                        onClick={() => onRemoveTeamMember(member.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 rounded"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Audit Logs & Quality Activity */}
        {activeTab === 'audit' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  Compliance & Quality Audit Trail
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time log of document transformations, error fixes, and administrator certifications.
                </p>
              </div>
            </div>

            {/* Audit log list */}
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No activity recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-gray-50 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{log.action}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-indigo-700">{log.documentTitle}</span>
                      </div>
                      <p className="text-gray-600 text-[11px]">{log.details}</p>
                      <span className="text-[10px] text-gray-400">
                        Executed by {log.userName} ({log.userEmail})
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Administrator PIN & Security Password */}
        {activeTab === 'security' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                Administrator Authentication & Access Control
              </h3>
              <p className="text-xs text-gray-500">
                Protect governance rules, team permissions, and document certifications with a secure PIN or password.
              </p>
            </div>

            {/* Current Security Status Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-indigo-300 border border-white/10">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Administrator Protection Active</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {securityConfig.authType === 'pin' ? 'Numeric PIN' : 'Password'} Mode
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Current Code:{' '}
                      <strong className="font-mono text-indigo-300">
                        {showSecretField ? securityConfig.secretCode : '••••••••'}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setShowSecretField(!showSecretField)}
                        className="ml-2 text-[11px] text-slate-400 hover:text-white underline"
                      >
                        {showSecretField ? 'Hide' : 'Reveal'}
                      </button>
                    </p>
                  </div>
                </div>

                {onLockAdminSession && (
                  <button
                    type="button"
                    onClick={() => {
                      onLockAdminSession();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Admin Session Now</span>
                  </button>
                )}
              </div>
            </div>

            {/* Form to Change PIN / Password */}
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Change Administrator PIN or Password
              </h4>

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Select Authentication Type
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSecurityConfig({
                        ...securityConfig,
                        authType: 'pin',
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      securityConfig.authType === 'pin'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">4-6 Digit Numeric PIN</span>
                      {securityConfig.authType === 'pin' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">Fast, convenient keypad access (e.g. 2026).</p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSecurityConfig({
                        ...securityConfig,
                        authType: 'password',
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      securityConfig.authType === 'password'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">Alphanumeric Password</span>
                      {securityConfig.authType === 'password' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">High-security custom text passphrase.</p>
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {securityConfig.authType === 'pin' ? 'New Numeric PIN' : 'New Password'}
                  </label>
                  <input
                    type={showSecretField ? 'text' : 'password'}
                    value={newSecretCode}
                    onChange={(e) => {
                      const val =
                        securityConfig.authType === 'pin'
                          ? e.target.value.replace(/[^0-9]/g, '').slice(0, 8)
                          : e.target.value;
                      setNewSecretCode(val);
                      setSecurityStatusMsg(null);
                    }}
                    placeholder={securityConfig.authType === 'pin' ? 'e.g. 8492' : 'Enter new password'}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm {securityConfig.authType === 'pin' ? 'PIN' : 'Password'}
                  </label>
                  <input
                    type={showSecretField ? 'text' : 'password'}
                    value={confirmSecretCode}
                    onChange={(e) => {
                      const val =
                        securityConfig.authType === 'pin'
                          ? e.target.value.replace(/[^0-9]/g, '').slice(0, 8)
                          : e.target.value;
                      setConfirmSecretCode(val);
                      setSecurityStatusMsg(null);
                    }}
                    placeholder="Re-type to confirm"
                    className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Status Message */}
              {securityStatusMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    securityStatusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {securityStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{securityStatusMsg.text}</span>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newSecretCode.trim()) {
                      setSecurityStatusMsg({
                        type: 'error',
                        text: 'Please enter a valid PIN or password.',
                      });
                      return;
                    }
                    if (securityConfig.authType === 'pin' && newSecretCode.length < 4) {
                      setSecurityStatusMsg({
                        type: 'error',
                        text: 'PIN must be at least 4 digits.',
                      });
                      return;
                    }
                    if (newSecretCode !== confirmSecretCode) {
                      setSecurityStatusMsg({
                        type: 'error',
                        text: 'Codes do not match. Please verify both fields.',
                      });
                      return;
                    }

                    onUpdateSecurityConfig({
                      ...securityConfig,
                      secretCode: newSecretCode.trim(),
                    });

                    setNewSecretCode('');
                    setConfirmSecretCode('');
                    setSecurityStatusMsg({
                      type: 'success',
                      text: `Administrator ${securityConfig.authType === 'pin' ? 'PIN' : 'password'} updated successfully!`,
                    });
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                >
                  Update {securityConfig.authType === 'pin' ? 'PIN' : 'Password'}
                </button>
              </div>
            </div>

            {/* Access Protection Policies */}
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Security Enforcement Rules
              </h4>

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityConfig.requireForConsole}
                    onChange={(e) =>
                      onUpdateSecurityConfig({
                        ...securityConfig,
                        requireForConsole: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Require PIN/Password to access Administrator Console
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Locks console behind security prompt when clicked from navigation.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityConfig.requireForApproval}
                    onChange={(e) =>
                      onUpdateSecurityConfig({
                        ...securityConfig,
                        requireForApproval: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Require PIN/Password to certify & approve document quality
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Ensures only authorized administrators can stamp an official certification.
                    </span>
                  </div>
                </label>
              </div>

              {/* Auto-Lock timer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Auto-Lock Inactive Session</span>
                  <span className="text-[11px] text-gray-500">
                    Automatically re-prompt for PIN after inactivity.
                  </span>
                </div>

                <select
                  value={securityConfig.autoLockMinutes}
                  onChange={(e) =>
                    onUpdateSecurityConfig({
                      ...securityConfig,
                      autoLockMinutes: Number(e.target.value),
                    })
                  }
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes (Default)</option>
                  <option value={30}>30 minutes</option>
                  <option value={0}>Never (Manual Lock Only)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Current Document Score:{' '}
            <strong className={currentDocScore && currentDocScore >= governancePolicy.minHealthScore ? 'text-emerald-600' : 'text-amber-600'}>
              {currentDocScore ?? 'N/A'}/100
            </strong>{' '}
            (Policy target: {governancePolicy.minHealthScore}+)
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
