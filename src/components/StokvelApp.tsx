import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { HeaderHero } from './HeaderHero';
import { StokvelOverview } from './StokvelOverview';
import { MemberTracker } from './MemberTracker';
import { PayoutsRotation } from './PayoutsRotation';
import { LoansManager } from './LoansManager';
import { GovernanceVoting } from './GovernanceVoting';
import { FinancialLedger } from './FinancialLedger';
import { Calculators } from './Calculators';
import { TrustAndSecurity } from './TrustAndSecurity';

// Modals
import { AddContributionModal } from './modals/AddContributionModal';
import { WhatsAppReminderModal } from './modals/WhatsAppReminderModal';
import { NewLoanModal } from './modals/NewLoanModal';

// Mock initial data
import { 
  INITIAL_STOKVELS, 
  INITIAL_MEMBERS, 
  INITIAL_CONTRIBUTIONS, 
  INITIAL_PAYOUTS, 
  INITIAL_LOANS, 
  INITIAL_PROPOSALS, 
  INITIAL_TRANSACTIONS 
} from '../mockData';

import { Stokvel, Member, Contribution, PayoutSchedule, Loan, Proposal, Transaction, GroupSecuritySettings } from '../types';
import { LayoutDashboard, Users, Sparkles, Landmark, Vote, FileText, Calculator, ShieldCheck } from 'lucide-react';

const DEFAULT_SECURITY_SETTINGS: GroupSecuritySettings = {
  groupName: 'FBI Wealth Accumators Stokvel',
  adminName: 'Sipho Ndlovu',
  adminIdNumber: '8604125800084',
  adminPhone: '+27 82 555 1234',
  isIdVerified: true,
  multiSignThreshold: 1000,
  requiredApprovals: 2,
  constitutionAgreed: true,
  bankAccountVerified: true,
};

export function StokvelApp() {
  const [stokvels, setStokvels] = useState<Stokvel[]>(INITIAL_STOKVELS);
  
  // Load initial settings or fallback to local storage
  const [securitySettings, setSecuritySettings] = useState<GroupSecuritySettings>(DEFAULT_SECURITY_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('stokvel_security_settings');
    if (saved) {
      const parsed: GroupSecuritySettings = JSON.parse(saved);
      setSecuritySettings(parsed);
      if (parsed.groupName) {
        setActiveStokvel(prev => ({ ...prev, name: parsed.groupName }));
      }
    }
  }, []);

  const [activeStokvel, setActiveStokvel] = useState<Stokvel>(INITIAL_STOKVELS[0]!);
  
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [contributions, setContributions] = useState<Contribution[]>(INITIAL_CONTRIBUTIONS);
  const [payouts, setPayouts] = useState<PayoutSchedule[]>(INITIAL_PAYOUTS);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals state
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedMemberForReminder, setSelectedMemberForReminder] = useState<Member | null>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  // Save security settings to local storage
  const handleUpdateSecuritySettings = (newSettings: GroupSecuritySettings) => {
    setSecuritySettings(newSettings);
    localStorage.setItem('stokvel_security_settings', JSON.stringify(newSettings));
  };

  const handleUpdateGroupName = (name: string) => {
    setActiveStokvel(prev => ({ ...prev, name }));
    setStokvels(prev => prev.map(s => s.id === activeStokvel.id ? { ...s, name } : s));
  };

  // Handlers
  const handleVerifyPayment = (memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'paid', totalContributed: m.totalContributed + activeStokvel.monthlyContribution } : m));
    
    const targetMember = members.find(m => m.id === memberId);
    if (targetMember) {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        stokvelId: activeStokvel.id,
        type: 'deposit',
        amount: activeStokvel.monthlyContribution,
        description: `Monthly Contribution - ${targetMember.name}`,
        date: new Date().toISOString().slice(0, 10),
        memberName: targetMember.name,
        reference: `STK-${targetMember.name.split(' ')[0]}-VERIFIED`,
        category: 'Contribution',
      };
      setTransactions(prev => [newTx, ...prev]);
      setActiveStokvel(prev => ({ ...prev, totalBalance: prev.totalBalance + activeStokvel.monthlyContribution }));
    }
  };

  const handleRecordContribution = (memberId: string, amount: number, method: string, reference: string) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'paid', totalContributed: m.totalContributed + amount } : m));
    
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      stokvelId: activeStokvel.id,
      type: 'deposit',
      amount,
      description: `Contribution via ${method} - ${targetMember.name}`,
      date: new Date().toISOString().slice(0, 10),
      memberName: targetMember.name,
      reference,
      category: 'Contribution',
    };

    setTransactions(prev => [newTx, ...prev]);
    setActiveStokvel(prev => ({ ...prev, totalBalance: prev.totalBalance + amount }));
  };

  const handleApplyLoan = (borrowerId: string, amount: number, durationMonths: number, purpose: string) => {
    const borrower = members.find(m => m.id === borrowerId);
    if (!borrower) return;

    const interestRate = 4.5;
    const monthlyRepayment = Math.round((amount * (1 + (interestRate / 100) * durationMonths)) / durationMonths);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      stokvelId: activeStokvel.id,
      borrowerId,
      borrowerName: borrower.name,
      borrowerAvatar: borrower.avatar,
      amount,
      interestRate,
      durationMonths,
      monthlyRepayment,
      status: 'requested',
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      remainingBalance: amount,
      purpose,
    };

    setLoans(prev => [newLoan, ...prev]);
  };

  const handleApproveLoan = (loanId: string) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const approved = { ...l, status: 'active' as const };
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          stokvelId: activeStokvel.id,
          type: 'payout',
          amount: l.amount,
          description: `Disbursed Micro-Loan to ${l.borrowerName}`,
          date: new Date().toISOString().slice(0, 10),
          memberName: l.borrowerName,
          reference: `LOAN-DISBURSED-${l.id}`,
          category: 'Group Financing',
        };
        setTransactions(txs => [newTx, ...txs]);
        setActiveStokvel(s => ({ ...s, totalBalance: s.totalBalance - l.amount }));
        return approved;
      }
      return l;
    }));
  };

  const handleCastVote = (proposalId: string, voteType: 'for' | 'against') => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          votesFor: voteType === 'for' ? p.votesFor + 1 : p.votesFor,
          votesAgainst: voteType === 'against' ? p.votesAgainst + 1 : p.votesAgainst,
          userVoted: voteType,
        };
      }
      return p;
    }));
  };

  const openReminderForMember = (member: Member) => {
    setSelectedMemberForReminder(member);
    setIsReminderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white font-sans">
      
      {/* Top Navigation */}
      <Navbar
        stokvels={stokvels}
        activeStokvel={activeStokvel}
        onSelectStokvel={setActiveStokvel}
        onOpenCreateModal={() => setActiveTab('trust')}
        onOpenContributionModal={() => setIsContribModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Storytelling Header Hero */}
        <HeaderHero
          stokvel={activeStokvel}
          onOpenContributionModal={() => setIsContribModalOpen(true)}
          onOpenLoanModal={() => setIsLoanModalOpen(true)}
        />

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-border">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'members', label: 'Members & Payments', icon: Users },
            { id: 'payouts', label: 'Rotation Schedule', icon: Sparkles },
            { id: 'loans', label: 'Group Loans', icon: Landmark },
            { id: 'governance', label: 'Voting & Motions', icon: Vote },
            { id: 'ledger', label: 'Audit Ledger', icon: FileText },
            { id: 'trust', label: 'Trust & Security', icon: ShieldCheck },
            { id: 'calculators', label: 'Wealth Estimator', icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-glow-purple scale-[1.02]'
                    : 'bg-surface hover:bg-surface-hover text-textSecondary hover:text-white border border-border'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'overview' && (
          <StokvelOverview
            stokvel={activeStokvel}
            members={members}
            contributions={contributions}
            transactions={transactions}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'members' && (
          <MemberTracker
            members={members}
            stokvel={activeStokvel}
            onOpenAddMemberModal={() => alert("Add Member Modal")}
            onOpenReminderModal={openReminderForMember}
            onVerifyMemberPayment={handleVerifyPayment}
          />
        )}

        {activeTab === 'payouts' && (
          <PayoutsRotation
            payouts={payouts}
            stokvel={activeStokvel}
          />
        )}

        {activeTab === 'loans' && (
          <LoansManager
            loans={loans}
            stokvel={activeStokvel}
            onOpenNewLoanModal={() => setIsLoanModalOpen(true)}
            onApproveLoan={handleApproveLoan}
          />
        )}

        {activeTab === 'governance' && (
          <GovernanceVoting
            proposals={proposals}
            onOpenNewProposalModal={() => alert("New Proposal Modal")}
            onCastVote={handleCastVote}
          />
        )}

        {activeTab === 'ledger' && (
          <FinancialLedger
            transactions={transactions}
          />
        )}

        {activeTab === 'trust' && (
          <TrustAndSecurity
            stokvel={activeStokvel}
            settings={securitySettings}
            onUpdateSettings={handleUpdateSecuritySettings}
            onUpdateGroupName={handleUpdateGroupName}
          />
        )}

        {activeTab === 'calculators' && (
          <Calculators />
        )}

      </main>

      {/* Modals */}
      <AddContributionModal
        isOpen={isContribModalOpen}
        onClose={() => setIsContribModalOpen(false)}
        members={members}
        stokvel={activeStokvel}
        onSubmit={handleRecordContribution}
      />

      <WhatsAppReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        member={selectedMemberForReminder}
        stokvel={activeStokvel}
      />

      <NewLoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        members={members}
        stokvel={activeStokvel}
        onSubmit={handleApplyLoan}
      />

    </div>
  );
}
