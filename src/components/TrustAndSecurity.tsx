import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, CheckCircle2, AlertTriangle, Key, Building2, FileCheck } from 'lucide-react';
import { GroupSecuritySettings, Stokvel } from '../types';

interface TrustAndSecurityProps {
  stokvel: Stokvel;
  settings: GroupSecuritySettings;
  onUpdateSettings: (newSettings: GroupSecuritySettings) => void;
  onUpdateGroupName: (name: string) => void;
}

export function TrustAndSecurity({ stokvel, settings, onUpdateSettings, onUpdateGroupName }: TrustAndSecurityProps) {
  const [formData, setFormData] = useState<GroupSecuritySettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    onUpdateGroupName(formData.groupName);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-surface via-surface-hover to-surface border border-border/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-48 h-48 text-primary" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Bank-Grade Group Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Trust & Security Center
          </h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            Configure multi-signature approval rules, verify executive administration identities, and view audit security protocols for {stokvel.name}.
          </p>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-textSecondary uppercase tracking-wider">Multi-Approval Rule</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white mb-1">
            Over R{settings.multiSignThreshold.toLocaleString()}
          </p>
          <p className="text-xs text-textSecondary">
            Requires {settings.requiredApprovals} executive signatures before payout release.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-textSecondary uppercase tracking-wider">Admin Verification</span>
            <div className={`p-2 rounded-xl ${settings.isIdVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            {settings.isIdVerified ? 'Verified ID' : 'Pending Verification'}
            {settings.isIdVerified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </p>
          <p className="text-xs text-textSecondary">
            Chairperson: {settings.adminName || 'Not configured'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-textSecondary uppercase tracking-wider">Banking Details</span>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white mb-1">
            {stokvel.bankName}
          </p>
          <p className="text-xs text-textSecondary">
            Acc: •••• {stokvel.accountNumber.slice(-4)}
          </p>
        </div>
      </div>

      {/* Admin Settings & ID Verification Form */}
      <div className="p-6 md:p-8 rounded-3xl bg-surface border border-border shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-primary" />
          <span>Group Security & Executive Setup</span>
        </h3>

        {isSaved && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Group security settings saved successfully to browser storage!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Stokvel / Group Name
              </label>
              <input
                type="text"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white text-sm focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Chairperson / Executive Full Name
              </label>
              <input
                type="text"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white text-sm focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                SA National ID Number
              </label>
              <input
                type="text"
                value={formData.adminIdNumber}
                onChange={(e) => setFormData({ ...formData, adminIdNumber: e.target.value })}
                placeholder="e.g. 8501015800085"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white text-sm focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={formData.adminPhone}
                onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                placeholder="e.g. +27 82 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white text-sm focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Multi-Signature Threshold (ZAR)
              </label>
              <input
                type="number"
                value={formData.multiSignThreshold}
                onChange={(e) => setFormData({ ...formData, multiSignThreshold: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white text-sm focus:outline-none focus:border-primary transition-all"
              />
              <p className="text-[11px] text-textSecondary mt-1">
                Payouts exceeding this amount require dual executive sign-off.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Required Approvals
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.requiredApprovals}
                onChange={(e) => setFormData({ ...formData, requiredApprovals: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="verifyId"
                checked={formData.isIdVerified}
                onChange={(e) => setFormData({ ...formData, isIdVerified: e.target.checked })}
                className="w-4 h-4 rounded accent-primary bg-background border-border"
              />
              <label htmlFor="verifyId" className="text-xs text-textSecondary cursor-pointer">
                Mark Admin Identity verified & Constitution approved
              </label>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all shadow-glow-purple"
            >
              Save Security Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
