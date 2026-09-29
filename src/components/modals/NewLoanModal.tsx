import React, { useState } from 'react';
import { X, Landmark } from 'lucide-react';
import { Member, Stokvel } from '../../types';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  stokvel: Stokvel;
  onSubmit: (borrowerId: string, amount: number, durationMonths: number, purpose: string) => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen,
  onClose,
  members,
  stokvel,
  onSubmit,
}) => {
  const [borrowerId, setBorrowerId] = useState(members[0]?.id || '');
  const [amount, setAmount] = useState(10000);
  const [durationMonths, setDurationMonths] = useState(3);
  const [purpose, setPurpose] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(borrowerId, amount, durationMonths, purpose);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto p-5 sm:p-6 rounded-xl border border-border space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-surface text-textSecondary hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Apply for Group Loan</h3>
            <p className="text-xs text-textSecondary">Borrow from {stokvel.name} pool</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">Borrowing Member</label>
            <select
              value={borrowerId}
              onChange={(e) => setBorrowerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-secondary"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Equity: {m.equityPercentage}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">Requested Amount (ZAR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white font-mono text-sm focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">Repayment Term (Months)</label>
            <select
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-secondary"
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">Purpose of Funds</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Business stock inventory..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-secondary h-20"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary to-blue-600 text-white font-semibold text-sm shadow-glow-cyan hover:opacity-95 transition-all mt-2"
          >
            Submit Loan Application
          </button>
        </form>
      </div>
    </div>
  );
};
