import React from 'react';
import { ArrowDownRight, ArrowUpRight, Clock, Landmark, PiggyBank, ShieldAlert, Sparkles } from 'lucide-react';
import type { Contribution, Member, PayoutSchedule, Stokvel, Transaction } from '../types';

interface StokvelOverviewProps {
  stokvel: Stokvel;
  members: Member[];
  contributions: Contribution[];
  transactions: Transaction[];
  payouts: PayoutSchedule[];
  onNavigateTab: (tab: string) => void;
}

const rand = (n: number) => `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const isOut = (t: Transaction['type']) => t === 'payout' || t === 'loan_issued' || t === 'fee';

function Empty({ title, sub }: { title: string; sub: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center"><p className="text-lg font-semibold text-foreground">{title}</p><p className="mt-1 text-base text-textSecondary">{sub}</p></div>;
}

export const StokvelOverview: React.FC<StokvelOverviewProps> = ({ stokvel, members, contributions, transactions, payouts, onNavigateTab }) => {
  const paidCount = members.filter((m) => m.status === 'paid').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const overdueCount = members.filter((m) => m.status === 'overdue').length;
  const collection = members.length ? Math.round((paidCount / members.length) * 100) : 0;
  const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);
  const monthLabel = new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const nextPayout = payouts.filter((p) => p.status !== 'completed').sort((a, b) => a.payoutDate.localeCompare(b.payoutDate))[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-textSecondary">Group bank account</span><Landmark className="size-5 text-primary" /></div>
          {stokvel.bankName ? <><p className="text-xl font-bold">{stokvel.bankName}</p><p className="font-mono text-base text-textSecondary">Acc: {stokvel.accountNumber}</p></> : <p className="text-base text-textSecondary">No bank account added yet. Add it under Security.</p>}
          <p className="mt-3 border-t border-border pt-3 text-base">Contributions due on the <strong>{stokvel.cycleDay}th</strong> of each month</p>
        </div>

        <div className="glass-panel rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-textSecondary">{monthLabel} payments</span><PiggyBank className="size-5 text-secondary" /></div>
          {members.length === 0 ? <p className="text-base text-textSecondary">No members yet.</p> : <>
            <p className="text-3xl font-extrabold">{paidCount} of {members.length} <span className="text-base font-normal text-textSecondary">have paid</span></p>
            <div className="my-3 h-3 w-full overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-secondary" style={{ width: `${collection}%` }} /></div>
            <div className="flex flex-wrap gap-4 text-base"><span className="flex items-center gap-1 text-amber-400"><Clock className="size-4" /> {pendingCount} waiting</span>{overdueCount > 0 && <span className="flex items-center gap-1 text-rose-400"><ShieldAlert className="size-4" /> {overdueCount} late</span>}</div>
          </>}
          <p className="mt-3 border-t border-border pt-3 text-base">Total contributed: <strong className="font-mono">{rand(totalContributed)}</strong></p>
        </div>

        <div className="glass-panel rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-textSecondary">Next payout</span><Sparkles className="size-5 text-accent" /></div>
          {nextPayout ? <><p className="text-xl font-bold">{nextPayout.memberName}</p><p className="text-base text-textSecondary">{nextPayout.payoutDate}</p><p className="mt-3 border-t border-border pt-3 font-mono text-xl font-bold">{rand(nextPayout.amount)}</p></> : <p className="text-base text-textSecondary">No payouts scheduled yet.</p>}
        </div>
      </div>

      <div className="glass-panel space-y-4 rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-bold">Recent activity</h3>
          {transactions.length > 0 && <button onClick={() => onNavigateTab('ledger')} className="flex min-h-11 items-center gap-1 text-base font-semibold text-primary">See all <ArrowUpRight className="size-4" /></button>}
        </div>
        {transactions.length === 0 ? <Empty title="No contributions yet" sub="When you record a payment, it will appear here." /> : (
          <ul className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`rounded-lg p-2 ${isOut(tx.type) ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{isOut(tx.type) ? <ArrowDownRight className="size-5" /> : <ArrowUpRight className="size-5" />}</span>
                  <div className="min-w-0"><p className="truncate text-base font-semibold">{tx.description}</p><p className="text-sm text-textSecondary">{tx.date}</p></div>
                </div>
                <p className={`shrink-0 font-mono text-base font-bold ${isOut(tx.type) ? 'text-rose-400' : 'text-emerald-400'}`}>{isOut(tx.type) ? '−' : '+'}{rand(tx.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
