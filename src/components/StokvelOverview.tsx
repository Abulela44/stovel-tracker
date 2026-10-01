import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Download, 
  PiggyBank, 
  Landmark, 
  Percent,
  Sparkles
} from 'lucide-react';
import { Stokvel, Member, Contribution, Transaction } from '../types';

interface StokvelOverviewProps {
  stokvel: Stokvel;
  members: Member[];
  contributions: Contribution[];
  transactions: Transaction[];
  onNavigateTab: (tab: string) => void;
}

export const StokvelOverview: React.FC<StokvelOverviewProps> = ({
  stokvel,
  members,
  contributions,
  transactions,
  onNavigateTab,
}) => {
  const paidCount = members.filter(m => m.status === 'paid').length;
  const pendingCount = members.filter(m => m.status === 'pending').length;
  const overdueCount = members.filter(m => m.status === 'overdue').length;

  const collectionPercentage = Math.round((paidCount / members.length) * 100) || 0;

  // Simple visual SVG Chart mock curve
  const chartPoints = [220000, 260000, 310000, 380000, 420000, 485000];
  const maxVal = Math.max(...chartPoints);
  const minVal = Math.min(...chartPoints);
  const chartHeight = 120;
  const chartWidth = 500;

  const pointsSvg = chartPoints.map((val, idx) => {
    const x = (idx / (chartPoints.length - 1)) * chartWidth;
    const y = chartHeight - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8">
      
      {/* 3 Metric High-Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Bank Treasury Details */}
        <div className="glass-panel p-6 rounded-3xl border border-border relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Bank Vault Account</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white mb-1">{stokvel.bankName}</p>
          <p className="text-sm font-mono text-textSecondary mb-4">Acc: {stokvel.accountNumber}</p>
          <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs">
            <span className="text-textSecondary">Contribution day:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Every {stokvel.cycleDay}th of the month
            </span>
          </div>
        </div>

        {/* Card 2: Current Month Collection Rate */}
        <div className="glass-panel p-6 rounded-3xl border border-border relative overflow-hidden group hover:border-secondary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-textSecondary">May 2025 Contributions</span>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">{collectionPercentage}%</span>
            <span className="text-xs text-textSecondary">collected ({paidCount}/{members.length} members)</span>
          </div>
          <div className="w-full bg-surface h-2 rounded-full overflow-hidden mb-4">
            <div 
              className="bg-gradient-to-r from-secondary to-accent h-full rounded-full transition-all duration-700" 
              style={{ width: `${collectionPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/80">
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {pendingCount} Pending
            </span>
            {overdueCount > 0 && (
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {overdueCount} Overdue
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Rotating Payout Highlight */}
        <div className="glass-panel p-6 rounded-3xl border border-border relative overflow-hidden group hover:border-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Next Rotating Beneficiary</span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200" 
              alt="Nomvula Khumalo"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-accent"
            />
            <div>
              <p className="text-base font-bold text-white">Nomvula Khumalo</p>
              <p className="text-xs text-accent font-medium">May 30, 2025 Payout</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/80">
            <span className="text-xs text-textSecondary">Estimated Cash Out:</span>
            <span className="text-base font-bold text-white font-mono">R 42,000</span>
          </div>
        </div>

      </div>

      {/* Interactive Growth Chart & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visual Fund Growth Chart (SVG) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Group Savings Growth</h3>
              <p className="text-xs text-textSecondary">Cumulative contributions + Interest earned (6 Month View)</p>
            </div>
            <button 
              onClick={() => onNavigateTab('ledger')}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              Full Ledger <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-4 relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9E7FFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#9E7FFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Fill area */}
              <polygon
                points={`0,${chartHeight} ${pointsSvg} ${chartWidth},${chartHeight}`}
                fill="url(#chartGlow)"
              />
              {/* Line path */}
              <polyline
                fill="none"
                stroke="#9E7FFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsSvg}
              />
            </svg>

            <div className="flex justify-between text-[11px] text-textSecondary font-mono mt-2">
              <span>Dec 2024</span>
              <span>Jan 2025</span>
              <span>Feb 2025</span>
              <span>Mar 2025</span>
              <span>Apr 2025</span>
              <span className="text-primary font-bold">May 2025 (Current)</span>
            </div>
          </div>
        </div>

        {/* Recent Ledger Feed */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <span className="text-xs text-textSecondary font-mono">{transactions.length} total</span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="p-3 rounded-2xl bg-surface border border-border/60 flex items-center justify-between hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'loan_repayment' ? 'bg-secondary/10 text-secondary' :
                    tx.type === 'yield' ? 'bg-primary/10 text-primary' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'loan_repayment' || tx.type === 'yield' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white truncate max-w-[180px]">{tx.description}</p>
                    <p className="text-[10px] text-textSecondary">{tx.date} • {tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold font-mono ${
                    tx.type === 'payout' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {tx.type === 'payout' ? '-' : '+'} R {tx.amount.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-textSecondary uppercase font-mono">{tx.reference}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
