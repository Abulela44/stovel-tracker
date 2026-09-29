import React, { useState } from 'react';
import { X, CheckCircle2, Wallet } from 'lucide-react';
import { Member, Stokvel } from '../../types';

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  stokvel: Stokvel;
  onSubmit: (memberId: string, amount: number, method: string, reference: string) => void;
}

export const AddContributionModal: React.FC<AddContributionModalProps> = ({
  isOpen,
  onClose,
  members,
  stokvel,
  onSubmit,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [amount, setAmount] = useState(stokvel.monthlyContribution);
  const [method, setMethod] = useState('EFT');
  const [reference, setReference] = useState(`STK-MAY-${Math.floor(1000 + Math.random() * 9000)}`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedMemberId, amount, method, reference);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-border space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-surface text-textSecondary hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Record Contribution</h3>
            <p className="text-xs text-textSecondary">Deposit for {stokvel.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">Select Member</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-primary"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">Amount (ZAR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white font-mono text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-primary"
            >
              <option value="EFT">EFT Bank Transfer</option>
              <option value="Capitec Pay">Capitec Pay</option>
              <option value="Cash Deposit">Cash Deposit</option>
              <option value="Debit Order">Debit Order</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">Reference / Pop Code</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white font-mono text-xs focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm shadow-glow-purple hover:opacity-95 transition-all mt-4"
          >
            Confirm Deposit & Update Balance
          </button>
        </form>
      </div>
    </div>
  );
};
