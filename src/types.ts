export type StokvelType = 'Investment' | 'Savings' | 'Grocery' | 'Loan' | 'Burial';

export interface Stokvel {
  id: string;
  name: string;
  code: string;
  type: StokvelType;
  totalBalance: number;
  monthlyContribution: number;
  targetAmount: number;
  cycleDay: number; // e.g. 1st or 25th of the month
  memberCount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  photoUrl: string;
  description: string;
  yieldRate: number; // e.g. 8.5% annual
  createdDate: string;
}

export interface Member {
  id: string;
  stokvelId: string;
  name: string;
  role: 'Chairperson' | 'Treasurer' | 'Secretary' | 'Member';
  avatar: string;
  phone: string;
  email: string;
  totalContributed: number;
  status: 'paid' | 'pending' | 'overdue';
  joinDate: string;
  equityPercentage: number;
  payoutMonth?: string;
  payoutOrder?: number;
}

export interface Contribution {
  id: string;
  stokvelId: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  amount: number;
  date: string;
  cycleMonth: string;
  status: 'verified' | 'pending' | 'flagged';
  paymentMethod: 'EFT' | 'Capitec Pay' | 'Cash Deposit' | 'Debit Order';
  reference: string;
  proofUrl?: string;
}

export interface PayoutSchedule {
  id: string;
  stokvelId: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  month: string;
  amount: number;
  payoutDate: string;
  status: 'completed' | 'upcoming' | 'processing';
  notes: string;
}

export interface Loan {
  id: string;
  stokvelId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerAvatar: string;
  amount: number;
  interestRate: number; // monthly percentage e.g. 5%
  durationMonths: number;
  monthlyRepayment: number;
  status: 'active' | 'requested' | 'repaid' | 'defaulted';
  startDate: string;
  dueDate: string;
  remainingBalance: number;
  purpose: string;
}

export interface Proposal {
  id: string;
  stokvelId: string;
  title: string;
  description: string;
  createdBy: string;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  status: 'active' | 'passed' | 'rejected';
  deadline: string;
  category: 'Investment Strategy' | 'Rules & Penalties' | 'Payout Adjustment' | 'Member Admission';
  userVoted?: 'for' | 'against' | null;
}

export interface Transaction {
  id: string;
  stokvelId: string;
  type: 'deposit' | 'payout' | 'loan_issued' | 'loan_repayment' | 'yield' | 'fee';
  amount: number;
  description: string;
  date: string;
  memberName?: string;
  reference: string;
  category: string;
}
