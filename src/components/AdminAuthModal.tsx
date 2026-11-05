import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Delete,
} from 'lucide-react';
import { AdminSecurityConfig } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityConfig: AdminSecurityConfig;
  onSuccess: () => void;
  actionContext?: 'console' | 'approval' | 'role_switch' | 'general';
  adminName?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  securityConfig,
  onSuccess,
  actionContext = 'console',
  adminName = 'Administrator',
}) => {
  const [inputCode, setInputCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputCode('');
      setErrorMessage(null);
      setIsShaking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = (codeToVerify?: string) => {
    const code = (codeToVerify !== undefined ? codeToVerify : inputCode).trim();
    if (!code) {
      setErrorMessage('Please enter the security PIN or password.');
      return;
    }

    if (code === securityConfig.secretCode) {
      setErrorMessage(null);
      onSuccess();
      onClose();
    } else {
      setAttempts((prev) => prev + 1);
      setIsShaking(true);
      setErrorMessage('Incorrect PIN or password. Please try again.');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (inputCode.length < 8) {
      const updated = inputCode + digit;
      setInputCode(updated);
      setErrorMessage(null);
      // If PIN is 4 digits and matched, auto verify
      if (securityConfig.authType === 'pin' && updated.length === securityConfig.secretCode.length) {
        handleVerify(updated);
      }
    }
  };

  const handleBackspace = () => {
    setInputCode((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setInputCode('');
    setErrorMessage(null);
  };

  const getContextTitle = () => {
    switch (actionContext) {
      case 'approval':
        return 'Certify Draft Quality';
      case 'role_switch':
        return 'Grant Administrator Privileges';
      case 'console':
      default:
        return 'Unlock Administrator Console';
    }
  };

  const getContextDescription = () => {
    switch (actionContext) {
      case 'approval':
        return 'Enter your Administrator PIN to officially certify and sign off on this document.';
      case 'role_switch':
        return 'Administrator credentials are required to elevate user role to Administrator.';
      case 'console':
      default:
        return 'Protected area: Governance policies, team permissions, and audit logs require Administrator authorization.';
    }
  };

  const isPin = securityConfig.authType === 'pin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden text-gray-900 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-400 flex items-center justify-center shadow-inner mb-3">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">{getContextTitle()}</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">{getContextDescription()}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Admin: {adminName}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isPin ? (
            /* PIN Mode Display */
            <div>
              {/* Visual Dots */}
              <div className="flex items-center justify-center gap-3 mb-5">
                {Array.from({ length: Math.max(4, securityConfig.secretCode.length) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      i < inputCode.length
                        ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-xs'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  />
                ))}
              </div>

              {/* Hidden text input for keyboard users */}
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={inputCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setInputCode(val);
                  setErrorMessage(null);
                  if (val.length === securityConfig.secretCode.length) {
                    handleVerify(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVerify();
                  }
                }}
                className="opacity-0 absolute -z-10 w-0 h-0"
              />

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-12 rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 text-lg font-bold text-gray-800 transition-all flex items-center justify-center shadow-2xs"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-12 rounded-xl border border-gray-200 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 active:scale-95 text-xs font-semibold text-gray-500 transition-all flex items-center justify-center"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 text-lg font-bold text-gray-800 transition-all flex items-center justify-center shadow-2xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-600 transition-all flex items-center justify-center"
                  title="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Password Mode */
            <div className="space-y-4 mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Administrator Password
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setErrorMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleVerify();
                    }
                  }}
                  placeholder="Enter administrator password..."
                  className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-gray-300 pr-10 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleVerify()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Admin</span>
            </button>
          </div>

          {/* Helper Hint */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                Default PIN is <strong className="font-mono text-gray-800">2026</strong> (can be changed in Security Settings)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
