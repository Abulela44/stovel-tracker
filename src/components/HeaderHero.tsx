import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Coins, 
  ArrowUpRight, 
  ShieldCheck, 
  Users,
  Award
} from 'lucide-react';
import { Stokvel } from '../types';

interface HeaderHeroProps {
  stokvel: Stokvel;
  onOpenContributionModal: () => void;
  onOpenLoanModal: () => void;
}

export const HeaderHero: React.FC<HeaderHeroProps> = ({
  stokvel,
  onOpenContributionModal,
  onOpenLoanModal,
}) => {
  const targetPercent = Math.min(100, Math.round((stokvel.totalBalance / stokvel.targetAmount) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface via-surface-card to-background border border-border p-6 sm:p-8 mb-8 shadow-2xl">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: stokvel info */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Stokvel Group
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30">
              {stokvel.type} Fund
            </span>
            <span className="text-xs text-textSecondary font-mono">
              Code: <strong className="text-white">{stokvel.code}</strong>
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {stokvel.name}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-textSecondary max-w-2xl">
              {stokvel.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onOpenContributionModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary via-primary-dark to-purple-600 text-white font-semibold text-sm shadow-glow-purple hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <Coins className="w-4 h-4" />
              Deposit Contribution (R {stokvel.monthlyContribution.toLocaleString()})
            </button>
            <button
              onClick={onOpenLoanModal}
              className="px-5 py-3 rounded-xl bg-surface hover:bg-surface-hover border border-border text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              Request Group Loan
              <ArrowUpRight className="w-4 h-4 text-secondary" />
            </button>
          </div>
        </div>

        {/* Right Column: Key metrics card grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          
          <div className="p-4 rounded-2xl glass-card border border-border hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between text-textSecondary mb-2">
              <span className="text-xs font-medium">Total Pool Balance</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              R {stokvel.totalBalance.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{stokvel.yieldRate}% Annual Yield
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-border hover:border-secondary/50 transition-all">
            <div className="flex items-center justify-between text-textSecondary mb-2">
              <span className="text-xs font-medium">Monthly Due</span>
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              R {stokvel.monthlyContribution.toLocaleString()}
            </p>
            <p className="text-xs text-textSecondary mt-1">
              Due on {stokvel.cycleDay}th of month
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-border hover:border-accent/50 transition-all">
            <div className="flex items-center justify-between text-textSecondary mb-2">
              <span className="text-xs font-medium">Group Members</span>
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {stokvel.memberCount} <span className="text-xs font-normal text-textSecondary">Members</span>
            </p>
            <p className="text-xs text-emerald-400 mt-1">
              100% Active Standing
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-border hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between text-textSecondary mb-2">
              <span className="text-xs font-medium">Target Progress</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {targetPercent}%
            </p>
            <div className="w-full bg-surface-hover h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${targetPercent}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
