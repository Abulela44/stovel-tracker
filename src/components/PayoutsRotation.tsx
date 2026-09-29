import React from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  DollarSign, 
  Users, 
  Coins,
  ChevronRight
} from 'lucide-react';
import { PayoutSchedule, Stokvel } from '../types';

interface PayoutsRotationProps {
  payouts: PayoutSchedule[];
  stokvel: Stokvel;
}

export const PayoutsRotation: React.FC<PayoutsRotationProps> = ({ payouts, stokvel }) => {
  return (
    <div className="space-y-8">
      
      {/* Dynamic Planner Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border bg-gradient-to-r from-surface via-surface-card to-background relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30 inline-block mb-3">
            Rotation Schedule 2025
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Rotating Payouts & Dividends
          </h2>
          <p className="text-sm text-textSecondary mt-2">
            Each month, pooled contributions and earned yields are disbursed to assigned group members in transparent rotation order.
          </p>
        </div>
      </div>

      {/* Payout Schedule Cards / Timeline */}
      <div className="space-y-4">
        {payouts.map((pay, idx) => (
          <div
            key={pay.id}
            className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              pay.status === 'upcoming' ? 'border-primary/50 shadow-glow-purple bg-surface-card' : 'border-border'
            }`}
          >
            {/* Left Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={pay.memberAvatar}
                  alt={pay.memberName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-primary"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-surface border border-border text-[10px] font-mono font-bold text-white flex items-center justify-center">
                  #{idx + 1}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{pay.memberName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    pay.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    pay.status === 'upcoming' ? 'bg-primary/20 text-primary border border-primary/30' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {pay.status}
                  </span>
                </div>
                <p className="text-xs text-textSecondary mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-secondary" /> Scheduled Date: <strong className="text-white">{pay.payoutDate}</strong> ({pay.month})
                </p>
                <p className="text-xs text-textSecondary italic mt-1">{pay.notes}</p>
              </div>
            </div>

            {/* Right Financial Value & Actions */}
            <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-border">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-textSecondary">Disbursement Payout</span>
                <span className="text-2xl font-extrabold text-white font-mono">
                  R {pay.amount.toLocaleString()}
                </span>
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-white transition-all flex items-center gap-1.5">
                Receipt Details <ChevronRight className="w-4 h-4 text-textSecondary" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
