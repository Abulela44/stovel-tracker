import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter 
} from 'lucide-react';
import { Transaction } from '../types';

interface FinancialLedgerProps {
  transactions: Transaction[];
}

export const FinancialLedger: React.FC<FinancialLedgerProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTx = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportCSV = () => {
    const headers = "ID,Date,Description,Type,Amount,Reference,Category\n";
    const rows = filteredTx.map(t => `"${t.id}","${t.date}","${t.description}","${t.type}","${t.amount}","${t.reference}","${t.category}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stokvel-Ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Transparent Audit Ledger
          </h2>
          <p className="text-xs text-textSecondary mt-1">
            Complete immutable transaction record of deposits, payouts, loans and repayments.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-white text-xs font-semibold transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-primary" /> Export Statement (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference or note..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface border border-border rounded-xl text-white placeholder-textSecondary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['all', 'deposit', 'payout', 'loan_repayment'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterType === t
                  ? 'bg-primary text-white shadow-glow-purple'
                  : 'bg-surface hover:bg-surface-hover text-textSecondary border border-border'
              }`}
            >
              {t === 'all' ? 'All Ledger' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredTx.length === 0 && <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"><p className="text-lg font-semibold text-foreground">No contributions yet</p><p className="mt-1 text-base text-textSecondary">Every payment, payout and loan will be recorded here automatically.</p></div>}
      {/* Transaction Table */}
      <div className="space-y-3 md:hidden">
        {filteredTx.map((tx) => (
          <article key={tx.id} className="rounded-lg border border-border bg-surface-card p-4">
            <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-2"><div className={`mt-0.5 rounded-lg p-2 ${tx.type === 'payout' || tx.type === 'loan_issued' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{tx.type === 'payout' || tx.type === 'loan_issued' ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}</div><div className="min-w-0"><h3 className="text-sm font-semibold leading-snug text-foreground">{tx.description}</h3><p className="mt-1 text-xs text-textSecondary">{tx.date} · {tx.category}</p></div></div><p className={`shrink-0 font-mono text-sm font-bold ${tx.type === 'payout' || tx.type === 'loan_issued' ? 'text-rose-400' : 'text-emerald-400'}`}>{tx.type === 'payout' || tx.type === 'loan_issued' ? '-' : '+'}R {tx.amount.toLocaleString()}</p></div>
            <p className="mt-3 truncate border-t border-border pt-3 font-mono text-[11px] text-textSecondary">{tx.reference}</p>
          </article>
        ))}
      </div>
      <div className={`${filteredTx.length === 0 ? 'hidden' : 'hidden md:block'} glass-panel rounded-3xl border border-border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-card border-b border-border text-textSecondary uppercase font-mono text-[11px]">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Reference</th>
                <th className="py-4 px-6 text-right">Amount (ZAR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-4 px-6 font-mono text-textSecondary whitespace-nowrap">{tx.date}</td>
                  <td className="py-4 px-6 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        tx.type === 'deposit' || tx.type === 'yield' || tx.type === 'loan_repayment'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.type === 'payout' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <span>{tx.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-textSecondary font-medium">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-textSecondary">{tx.reference}</td>
                  <td className={`py-4 px-6 text-right font-mono font-bold text-sm ${
                    tx.type === 'payout' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {tx.type === 'payout' ? '-' : '+'} R {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
