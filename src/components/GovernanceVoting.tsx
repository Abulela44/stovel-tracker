import React from 'react';
import { 
  Vote, 
  Plus, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  Users 
} from 'lucide-react';
import { Proposal } from '../types';

interface GovernanceVotingProps {
  proposals: Proposal[];
  onOpenNewProposalModal: () => void;
  onCastVote: (proposalId: string, voteType: 'for' | 'against') => void;
}

export const GovernanceVoting: React.FC<GovernanceVotingProps> = ({
  proposals,
  onOpenNewProposalModal,
  onCastVote,
}) => {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30 inline-block mb-2">
            Stokvel Governance & Voting
          </span>
          <h2 className="text-2xl font-extrabold text-white">Group Motions & Decisions</h2>
          <p className="text-xs text-textSecondary mt-1">
            Democratic decision-making for group rules, constitutional adjustments, and fund disbursements.
          </p>
        </div>

        <button
          onClick={onOpenNewProposalModal}
          className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm shadow-glow-pink transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Motion
        </button>
      </div>

      {/* Motions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proposals.length === 0 && <div className="col-span-full"><div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"><p className="text-lg font-semibold text-foreground">No motions yet</p><p className="mt-1 text-base text-textSecondary">Create a motion when the group needs to vote on something.</p></div></div>}
        {proposals.map((prop) => {
          const totalVotes = prop.votesFor + prop.votesAgainst;
          const forPercent = totalVotes > 0 ? Math.round((prop.votesFor / totalVotes) * 100) : 0;

          return (
            <div
              key={prop.id}
              className="glass-panel p-6 rounded-3xl border border-border space-y-5 hover:border-accent/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-card border border-border text-[11px] font-semibold text-primary">
                    {prop.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    prop.status === 'active' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    prop.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {prop.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{prop.title}</h3>
                <p className="text-xs text-textSecondary leading-relaxed">{prop.description}</p>
                <p className="text-[11px] text-textSecondary">Proposed by: <strong className="text-white">{prop.createdBy}</strong></p>

                {/* Progress Bar */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400">{prop.votesFor} In Favor ({forPercent}%)</span>
                    <span className="text-rose-400">{prop.votesAgainst} Opposed</span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${forPercent}%` }} />
                    <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${100 - forPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Voting Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-textSecondary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-accent" /> Closes: {prop.deadline}
                </span>

                {prop.status === 'active' && !prop.userVoted ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCastVote(prop.id, 'for')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> For
                    </button>
                    <button
                      onClick={() => onCastVote(prop.id, 'against')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Against
                    </button>
                  </div>
                ) : prop.userVoted ? (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                    You voted: {prop.userVoted.toUpperCase()}
                  </span>
                ) : null}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
