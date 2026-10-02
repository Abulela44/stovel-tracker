import React from 'react';
import { 
  Landmark, 
  Plus, 
  Percent, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Coins 
} from 'lucide-react';
import { Loan, Stokvel } from '../types';

interface LoansManagerProps {
  loans: Loan[];
  stokvel: Stokvel;
  onOpenNewLoanModal: () => void;
  onApproveLoan: (loanId: string) => void;
}

export const LoansManager: React.FC<LoansManagerProps> = ({
  loans,
  stokvel,
  onOpenNewLoanModal,
  onApproveLoan,
}) => {
  const activeLoansTotal = loans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  return (
    <div className="space-y-8">
      
      {/* Micro-Lending Header */}
      <div className="glass-panel p-6 rounded-3xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary border border-secondary/30 inline-block mb-2">
            Internal Stokvel Financing
          </span>
          <h2 className="text-2xl font-extrabold text-white">Group Loans</h2>
          <p className="text-xs text-textSecondary mt-1">
            Members can borrow against pooled savings at agreed interest rates. All interest income flows directly into group balance.
          </p>
        </div>

        <button
          onClick={onOpenNewLoanModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-secondary to-blue-600 text-white font-semibold text-sm shadow-glow-cyan hover:scale-[1.02] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Request Member Loan
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-border">
          <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Money Currently Lent Out</span>
          <p className="text-2xl font-bold text-white font-mono mt-1">R {activeLoansTotal.toLocaleString()}</p>
          <span className="text-xs text-emerald-400 mt-1 inline-block">Being repaid to the group</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border">
          <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Group Interest Rate</span>
          <p className="text-2xl font-bold text-secondary font-mono mt-1">4.5% - 5.0% / month</p>
          <span className="text-xs text-textSecondary mt-1 inline-block">Agreed constitution rate</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border">
          <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Active Loans</span>
          <p className="text-2xl font-bold text-white font-mono mt-1">{loans.length} Loan Files</p>
          <span className="text-xs text-emerald-400 mt-1 inline-block">0 Default Rate</span>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {loans.length === 0 && <div className="col-span-full"><div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"><p className="text-lg font-semibold text-foreground">No loans yet</p><p className="mt-1 text-base text-textSecondary">Loan requests from members will appear here.</p></div></div>}
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="glass-panel p-6 rounded-3xl border border-border hover:border-secondary/50 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={loan.borrowerAvatar}
                  alt={loan.borrowerName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-secondary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{loan.borrowerName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      loan.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      loan.status === 'requested' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-surface text-textSecondary'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary mt-0.5">{loan.purpose}</p>
                </div>
              </div>

              {loan.status === 'requested' ? (
                <button
                  onClick={() => onApproveLoan(loan.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Disburse Loan
                </button>
              ) : (
                <div className="text-right">
                  <span className="text-[10px] text-textSecondary uppercase tracking-wider">Remaining Balance</span>
                  <p className="text-lg font-bold text-white font-mono">R {loan.remainingBalance.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-card border border-border/60 text-xs">
              <div>
                <span className="text-textSecondary block">Principal Loan</span>
                <span className="font-bold text-white font-mono">R {loan.amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-textSecondary block">Interest Rate</span>
                <span className="font-bold text-secondary font-mono">{loan.interestRate}% / mo</span>
              </div>
              <div>
                <span className="text-textSecondary block">Monthly Installment</span>
                <span className="font-bold text-white font-mono">R {loan.monthlyRepayment.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-textSecondary block">Term Duration</span>
                <span className="font-bold text-white">{loan.durationMonths} Months</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
