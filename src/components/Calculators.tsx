import React, { useState } from 'react';
import { Calculator, TrendingUp, Sparkles, HelpCircle } from 'lucide-react';

export const Calculators: React.FC = () => {
  const [monthlyContribution, setMonthlyContribution] = useState<number>(2500);
  const [membersCount, setMembersCount] = useState<number>(12);
  const [annualYield, setAnnualYield] = useState<number>(9.5);
  const [years, setYears] = useState<number>(3);

  // Calculation logic
  const totalMonthlyPool = monthlyContribution * membersCount;
  const totalPrincipal = totalMonthlyPool * 12 * years;
  
  // Compound interest approximation
  const monthlyRate = annualYield / 100 / 12;
  const totalMonths = years * 12;
  const futureValue = totalMonthlyPool * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate));
  const interestEarned = futureValue - totalPrincipal;
  const sharePerMember = futureValue / membersCount;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-border">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30 inline-block mb-2">
          Stokvel Growth Estimator
        </span>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" /> Compound Wealth & Yield Calculator
        </h2>
        <p className="text-xs text-textSecondary mt-1">
          Estimate long-term group capital growth, annual yield returns, and individual member dividends.
        </p>
      </div>

      {/* Interactive Controls & Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-border space-y-6">
          
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-textSecondary">Monthly Contribution per Member</span>
              <span className="text-white font-mono">R {monthlyContribution.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-primary bg-surface h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-textSecondary">Total Active Members</span>
              <span className="text-white font-mono">{membersCount} Members</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={membersCount}
              onChange={(e) => setMembersCount(Number(e.target.value))}
              className="w-full accent-secondary bg-surface h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-textSecondary">Annual Expected Return / Interest Yield (% p.a)</span>
              <span className="text-emerald-400 font-mono">{annualYield}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="0.5"
              value={annualYield}
              onChange={(e) => setAnnualYield(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-surface h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-textSecondary">Investment Horizon</span>
              <span className="text-accent font-mono">{years} Year(s)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-accent bg-surface h-2 rounded-lg cursor-pointer"
            />
          </div>

        </div>

        {/* Dynamic Display Output */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-border bg-gradient-to-b from-surface-card to-background flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-textSecondary font-medium">Projected Treasury Wealth</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1">
              R {Math.round(futureValue).toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
              <Sparkles className="w-4 h-4" /> Includes R {Math.round(interestEarned).toLocaleString()} in Compound Yield!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface border border-border/80">
            <div>
              <span className="text-[11px] text-textSecondary block">Total Direct Capital Deposit</span>
              <span className="text-base font-bold text-white font-mono">R {Math.round(totalPrincipal).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[11px] text-textSecondary block">Payout Share per Member</span>
              <span className="text-base font-bold text-primary font-mono">R {Math.round(sharePerMember).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-textSecondary">
            <p className="flex items-center gap-1.5 font-semibold text-primary mb-1">
              <HelpCircle className="w-4 h-4" /> Stokvel Power Insight:
            </p>
            By pooling R {totalMonthlyPool.toLocaleString()} monthly together, your group unlocks institutional interest rates that individual savings accounts cannot match.
          </div>
        </div>

      </div>

    </div>
  );
};
