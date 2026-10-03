import React from 'react';
import { Calculator } from 'lucide-react';
import { Contribution, Loan, Member, PayoutSchedule } from '../types';

const rand = (n: number) =>
  `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function computeMemberBalance(member: Member, contributions: Contribution[], loans: Loan[], payouts: PayoutSchedule[]) {
  const mine = contributions.filter((c) => c.memberId === member.id);
  const verified = mine.filter((c) => c.status === 'verified');
  const pending = mine.filter((c) => c.status === 'pending');
  const paidIn = verified.reduce((s, c) => s + c.amount, 0);
  const pendingIn = pending.reduce((s, c) => s + c.amount, 0);
  const received = payouts
    .filter((p) => p.memberId === member.id && p.status === 'completed')
    .reduce((s, p) => s + p.amount, 0);
  const myLoans = loans.filter((l) => l.borrowerId === member.id && l.status !== 'requested');
  const borrowed = myLoans.reduce((s, l) => s + l.amount, 0);
  const toRepay = myLoans.reduce((s, l) => s + (l.monthlyRepayment * l.durationMonths || l.amount), 0);
  const stillOwed = myLoans.reduce((s, l) => s + (l.status === 'repaid' ? 0 : l.remainingBalance), 0);
  const repaid = Math.max(0, toRepay - stillOwed);
  const net = paidIn - received - stillOwed;
  return { verifiedCount: verified.length, pendingCount: pending.length, paidIn, pendingIn, received, borrowed, toRepay, repaid, stillOwed, net, loanCount: myLoans.length };
}

const Row: React.FC<{ label: string; hint?: string; value: string; tone?: string }> = ({ label, hint, value, tone = 'text-foreground' }) => (
  <div className="flex items-start justify-between gap-3 py-1.5">
    <div>
      <p className="text-sm text-foreground">{label}</p>
      {hint && <p className="text-xs text-textSecondary">{hint}</p>}
    </div>
    <span className={`font-mono text-sm font-bold whitespace-nowrap ${tone}`}>{value}</span>
  </div>
);

export const MemberBalanceBreakdown: React.FC<{ member: Member; contributions: Contribution[]; loans: Loan[]; payouts: PayoutSchedule[] }> = ({ member, contributions, loans, payouts }) => {
  const b = computeMemberBalance(member, contributions, loans, payouts);
  return (
    <details className="rounded-2xl border border-border/60 bg-surface-card mb-4 group/bd">
      <summary className="cursor-pointer list-none p-3 flex items-center justify-between gap-2 min-h-11">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calculator className="w-4 h-4 text-primary" /> Balance
        </span>
        <span className={`font-mono font-bold ${b.net < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{rand(b.net)}</span>
      </summary>
      <div className="px-3 pb-3 border-t border-border/40">
        <p className="text-xs text-textSecondary pt-2">How this is worked out:</p>
        <Row label="+ Contributions confirmed" hint={`${b.verifiedCount} payment${b.verifiedCount === 1 ? '' : 's'} checked by the treasurer`} value={rand(b.paidIn)} tone="text-emerald-400" />
        <Row label="− Payouts received" hint="Money this member has already been paid out" value={rand(b.received)} />
        <Row label="− Loan still owed" hint={b.loanCount ? `Borrowed ${rand(b.borrowed)} · to repay ${rand(b.toRepay)} · repaid ${rand(b.repaid)}` : 'No loans taken'} value={rand(b.stillOwed)} tone={b.stillOwed > 0 ? 'text-rose-400' : 'text-foreground'} />
        <div className="border-t border-border/60 mt-1 pt-1">
          <Row label="= Balance" value={rand(b.net)} tone={b.net < 0 ? 'text-rose-400' : 'text-emerald-400'} />
        </div>
        {b.pendingCount > 0 && (
          <p className="text-xs text-amber-400 mt-1">{rand(b.pendingIn)} in {b.pendingCount} payment{b.pendingCount === 1 ? '' : 's'} waiting to be confirmed — not counted yet.</p>
        )}
      </div>
    </details>
  );
};
