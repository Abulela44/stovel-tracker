import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  UserPlus, 
  Phone, 
  Mail, 
  MoreVertical,
  Send,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { Member, Stokvel, Contribution, Loan, PayoutSchedule } from '../types';
import { MemberBalanceBreakdown } from './MemberBalanceBreakdown';

interface MemberTrackerProps {
  members: Member[];
  stokvel: Stokvel;
  onOpenAddMemberModal: () => void;
  onOpenReminderModal: (member: Member) => void;
  onVerifyMemberPayment: (memberId: string) => void;
  contributions?: Contribution[];
  loans?: Loan[];
  payouts?: PayoutSchedule[];
}

export const MemberTracker: React.FC<MemberTrackerProps> = ({
  members,
  stokvel,
  onOpenAddMemberModal,
  onOpenReminderModal,
  onVerifyMemberPayment,
  contributions = [],
  loans = [],
  payouts = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-border">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Member Roster & Payment Status
          </h2>
          <p className="text-xs text-textSecondary mt-1">
            Track monthly contributions, payout turns and payment checks.
          </p>
        </div>

        <button
          onClick={onOpenAddMemberModal}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-glow-purple transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member by name or phone..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface border border-border rounded-xl text-white placeholder-textSecondary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-primary text-white shadow-glow-purple'
                  : 'bg-surface hover:bg-surface-hover text-textSecondary border border-border'
              }`}
            >
              {status === 'all' ? 'All Members' : status}
            </button>
          ))}
        </div>

      </div>

      {/* Members Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.length === 0 && <div className="col-span-full"><div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"><p className="text-lg font-semibold text-foreground">No members yet</p><p className="mt-1 text-base text-textSecondary">Tap “Add Member” to add the first person in your group.</p></div></div>}
        {filteredMembers.map((m) => (
          <div
            key={m.id}
            className="glass-panel p-6 rounded-3xl border border-border hover:border-primary/50 transition-all flex flex-col justify-between relative group"
          >
            <div>
              
              {/* Member Top Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-border group-hover:border-primary transition-colors"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{m.name}</h3>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-hover border border-border text-textSecondary">
                      {m.role}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  m.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  m.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {m.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                  {m.status === 'pending' && <Clock className="w-3 h-3" />}
                  {m.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                  {m.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-textSecondary mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-secondary" />
                  <span>{m.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  <span className="truncate">{m.email}</span>
                </div>
              </div>

              <MemberBalanceBreakdown member={m} contributions={contributions} loans={loans} payouts={payouts} />

              {/* Contributed & Equity Details */}
              <div className="bg-surface-card p-3 rounded-2xl border border-border/60 space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-textSecondary">Total Contributions:</span>
                  <span className="font-bold text-white font-mono">R {m.totalContributed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-textSecondary">Payout Turn:</span>
                  <span className="font-bold text-primary font-mono">{m.payoutOrder ? `#${m.payoutOrder}` : '—'}</span>
                </div>
                {m.payoutMonth && (
                  <div className="flex justify-between text-xs pt-1 border-t border-border/40">
                    <span className="text-textSecondary">Payout Slot:</span>
                    <span className="font-semibold text-secondary">{m.payoutMonth}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Actions Footer */}
            <div className="pt-2 flex items-center gap-2">
              {m.status !== 'paid' ? (
                <>
                  <button
                    onClick={() => onVerifyMemberPayment(m.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Payment
                  </button>
                  <button
                    onClick={() => onOpenReminderModal(m)}
                    className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-amber-400 transition-colors"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-xs text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> May Contribution Verified
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
