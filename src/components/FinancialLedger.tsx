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
            Complete immutable transaction record of deposits, payouts, interest yields, and loans.
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
          {(['all', 'deposit', 'payout', 'loan_repayment', 'yield'] as const).map((t) => (
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

      {/* Transaction Table */}
      <div className="glass-panel rounded-3xl border border-border overflow-hidden">
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
