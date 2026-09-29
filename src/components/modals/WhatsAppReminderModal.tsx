import React, { useState } from 'react';
import { X, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { Member, Stokvel } from '../../types';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  stokvel: Stokvel;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  member,
  stokvel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !member) return null;

  const reminderText = `Dumela/Hello ${member.name}, friendly reminder from ${stokvel.name}. Your monthly Stokvel contribution of R${stokvel.monthlyContribution.toLocaleString()} is due for this cycle. Bank: ${stokvel.bankName}, Acc: ${stokvel.accountNumber}. Reference: ${stokvel.code}-${member.name.split(' ')[0]}. Siyabonga!`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reminderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(reminderText);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
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
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Payment Reminder</h3>
            <p className="text-xs text-textSecondary">Send via WhatsApp or SMS to {member.name}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-white leading-relaxed font-sans">
          {reminderText}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 py-3 rounded-xl bg-surface hover:bg-surface-hover border border-border text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Message' : 'Copy Text'}
          </button>

          <button
            onClick={openWhatsApp}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-purple transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Open WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
