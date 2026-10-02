import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { FileText, Landmark, LayoutDashboard, LoaderCircle, MoreHorizontal, ShieldCheck, Sparkles, KeyRound, Users, Vote, Wallet, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { AuthGate } from './AuthGate';
import { InstallPrompt } from './InstallPrompt';
import { AccessActivity } from './AccessActivity';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from './Navbar';
import { HeaderHero } from './HeaderHero';
import { StokvelOverview } from './StokvelOverview';
import { MemberTracker } from './MemberTracker';
import { PayoutsRotation } from './PayoutsRotation';
import { LoansManager } from './LoansManager';
import { GovernanceVoting } from './GovernanceVoting';
import { FinancialLedger } from './FinancialLedger';
import { TrustAndSecurity } from './TrustAndSecurity';
import { AddContributionModal } from './modals/AddContributionModal';
import { WhatsAppReminderModal } from './modals/WhatsAppReminderModal';
import { NewLoanModal } from './modals/NewLoanModal';
import { AddMemberModal } from './modals/AddMemberModal';
import { NewProposalModal } from './modals/NewProposalModal';
import { INITIAL_CONTRIBUTIONS, INITIAL_LOANS, INITIAL_MEMBERS, INITIAL_PAYOUTS, INITIAL_PROPOSALS, INITIAL_STOKVELS, INITIAL_TRANSACTIONS } from '../mockData';
import type { AppNotification, Contribution, GroupSecuritySettings, Loan, Member, PayoutSchedule, Proposal, Stokvel, StokvelWorkspace, Transaction } from '../types';

const DEFAULT_SECURITY_SETTINGS: GroupSecuritySettings = { groupName: 'Sisonke Family Savings Club', adminName: 'Sipho Ndlovu', adminIdNumber: '', adminPhone: '+27 82 555 1234', isIdVerified: true, multiSignThreshold: 1000, requiredApprovals: 2, constitutionAgreed: true, bankAccountVerified: true };
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  { id: 'overdue', title: 'Contribution overdue', message: 'Zanele Naidoo still has an outstanding monthly contribution.', kind: 'warning', read: false },
  { id: 'loan', title: 'Loan needs approval', message: 'Sipho Dlamini has a pending group loan request.', kind: 'info', read: false },
  { id: 'payout', title: 'Payout approaching', message: 'Nomvula Khumalo is next in the rotation schedule.', kind: 'success', read: false },
];
const DEFAULT_WORKSPACE: StokvelWorkspace = { stokvels: INITIAL_STOKVELS, members: INITIAL_MEMBERS, contributions: INITIAL_CONTRIBUTIONS, payouts: INITIAL_PAYOUTS, loans: INITIAL_LOANS, proposals: INITIAL_PROPOSALS, transactions: INITIAL_TRANSACTIONS, notifications: DEFAULT_NOTIFICATIONS, securitySettings: DEFAULT_SECURITY_SETTINGS };

const tabs = [
  { id: 'overview', label: 'Overview', short: 'Home', icon: LayoutDashboard }, { id: 'members', label: 'Members & Payments', short: 'Members', icon: Users },
  { id: 'payouts', label: 'Rotation Schedule', short: 'Payouts', icon: Sparkles }, { id: 'loans', label: 'Group Loans', short: 'Loans', icon: Landmark },
  { id: 'governance', label: 'Voting & Motions', short: 'Voting', icon: Vote }, { id: 'ledger', label: 'Audit Ledger', short: 'Ledger', icon: FileText },
  { id: 'trust', label: 'Trust & Security', short: 'Security', icon: ShieldCheck }, { id: 'access', label: 'People & Activity', short: 'Access', icon: KeyRound },
];

export function StokvelApp() { return <AuthGate>{(session) => <AuthenticatedApp session={session} />}</AuthGate>; }

function AuthenticatedApp({ session }: { session: Session }) {
  const [workspace, setWorkspaceRaw] = useState<StokvelWorkspace>(DEFAULT_WORKSPACE);
  const [workspaceId, setWorkspaceId] = useState(''); const [role, setRole] = useState<'admin' | 'officer' | 'member'>('member');
  const canEdit = role !== 'member';
  const setWorkspace: typeof setWorkspaceRaw = (v) => { if (!canEdit) { toast.error('You have view-only access. Ask an admin for permission.'); return; } setWorkspaceRaw(v); };
  const [loaded, setLoaded] = useState(false); const [saving, setSaving] = useState(false); const initialLoad = useRef(true);
  const [activeStokvelId, setActiveStokvelId] = useState(INITIAL_STOKVELS[0]?.id ?? ''); const [activeTab, setActiveTab] = useState('overview');
  const [contribOpen, setContribOpen] = useState(false); const [loanOpen, setLoanOpen] = useState(false); const [memberOpen, setMemberOpen] = useState(false); const [proposalOpen, setProposalOpen] = useState(false); const [moreOpen, setMoreOpen] = useState(false);
  const [reminderMember, setReminderMember] = useState<Member | null>(null);
  const activeStokvel = workspace.stokvels.find((item) => item.id === activeStokvelId) ?? workspace.stokvels[0] ?? INITIAL_STOKVELS[0];

  useEffect(() => { void (async () => {
    const key = `signin-logged-${session.access_token.slice(-16)}`;
    if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); await supabase.rpc('record_sign_in'); }
    const { data: memberships } = await supabase.from('workspace_members').select('workspace_id, role').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1);
    const membership = memberships?.[0];
    if (membership) {
      setRole(membership.role); setWorkspaceId(membership.workspace_id);
      const { data } = await supabase.from('stokvel_workspaces').select('*').eq('id', membership.workspace_id).maybeSingle();
      if (data) setWorkspaceRaw({ stokvels: data.stokvels as unknown as Stokvel[], members: data.members as unknown as Member[], contributions: data.contributions as unknown as Contribution[], payouts: data.payouts as unknown as PayoutSchedule[], loans: data.loans as unknown as Loan[], proposals: data.proposals as unknown as Proposal[], transactions: data.transactions as unknown as Transaction[], notifications: data.notifications as unknown as AppNotification[], securitySettings: data.security_settings as unknown as GroupSecuritySettings });
    }
    setLoaded(true); initialLoad.current = false;
  })(); }, [session.user.id, session.access_token]);
  useEffect(() => { if (!loaded || initialLoad.current || !workspaceId || !canEdit) return; setSaving(true); const timer = window.setTimeout(() => { void supabase.from('stokvel_workspaces').update({ stokvels: workspace.stokvels as unknown as Json, members: workspace.members as unknown as Json, contributions: workspace.contributions as unknown as Json, payouts: workspace.payouts as unknown as Json, loans: workspace.loans as unknown as Json, proposals: workspace.proposals as unknown as Json, transactions: workspace.transactions as unknown as Json, notifications: workspace.notifications as unknown as Json, ...(role === 'admin' ? { security_settings: workspace.securitySettings as unknown as Json } : {}) }).eq('id', workspaceId).then(({ error }) => { setSaving(false); if (error) toast.error(`Not saved: ${error.message}`); }); }, 450); return () => window.clearTimeout(timer); }, [workspace, loaded, workspaceId, canEdit, role]);

  const unread = useMemo(() => workspace.notifications.filter((n) => !n.read).length, [workspace.notifications]);
  if (!loaded || !activeStokvel) return <div className="grid min-h-screen place-items-center bg-background"><LoaderCircle className="size-7 animate-spin text-primary" /></div>;
  const patch = (changes: Partial<StokvelWorkspace>) => setWorkspace((current) => ({ ...current, ...changes }));
  const updateActive = (updater: (stokvel: Stokvel) => Stokvel) => patch({ stokvels: workspace.stokvels.map((s) => s.id === activeStokvel.id ? updater(s) : s) });
  const addNotice = (title: string, message: string, kind: AppNotification['kind'] = 'success') => patch({ notifications: [{ id: crypto.randomUUID(), title, message, kind, read: false }, ...workspace.notifications] });
  const navigate = (id: string) => { setActiveTab(id); setMoreOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const verifyPayment = (memberId: string) => { const member = workspace.members.find((m) => m.id === memberId); if (!member) return; const amount = activeStokvel.monthlyContribution; const tx: Transaction = { id: crypto.randomUUID(), stokvelId: activeStokvel.id, type: 'deposit', amount, description: `Monthly Contribution - ${member.name}`, date: new Date().toISOString().slice(0, 10), memberName: member.name, reference: `STK-${member.name.split(' ')[0]}-VERIFIED`, category: 'Contribution' }; setWorkspace((w) => ({ ...w, members: w.members.map((m) => m.id === memberId ? { ...m, status: 'paid', totalContributed: m.totalContributed + amount } : m), transactions: [tx, ...w.transactions], stokvels: w.stokvels.map((s) => s.id === activeStokvel.id ? { ...s, totalBalance: s.totalBalance + amount } : s), notifications: [{ id: crypto.randomUUID(), title: 'Payment verified', message: `${member.name}'s contribution was added.`, kind: 'success', read: false }, ...w.notifications] })); };
  const recordContribution = (memberId: string, amount: number, method: string, reference: string) => { const member = workspace.members.find((m) => m.id === memberId); if (!member) return; const contribution: Contribution = { id: crypto.randomUUID(), stokvelId: activeStokvel.id, memberId, memberName: member.name, memberAvatar: member.avatar, amount, date: new Date().toISOString().slice(0, 10), cycleMonth: new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }), status: 'verified', paymentMethod: method as Contribution['paymentMethod'], reference }; const tx: Transaction = { id: crypto.randomUUID(), stokvelId: activeStokvel.id, type: 'deposit', amount, description: `Contribution via ${method} - ${member.name}`, date: contribution.date, memberName: member.name, reference, category: 'Contribution' }; setWorkspace((w) => ({ ...w, contributions: [contribution, ...w.contributions], transactions: [tx, ...w.transactions], members: w.members.map((m) => m.id === memberId ? { ...m, status: 'paid', totalContributed: m.totalContributed + amount } : m), stokvels: w.stokvels.map((s) => s.id === activeStokvel.id ? { ...s, totalBalance: s.totalBalance + amount } : s) })); };
  const applyLoan = (borrowerId: string, amount: number, durationMonths: number, purpose: string) => { const member = workspace.members.find((m) => m.id === borrowerId); if (!member) return; const rate = 4.5; patch({ loans: [{ id: crypto.randomUUID(), stokvelId: activeStokvel.id, borrowerId, borrowerName: member.name, borrowerAvatar: member.avatar, amount, interestRate: rate, durationMonths, monthlyRepayment: Math.round((amount * (1 + rate / 100 * durationMonths)) / durationMonths), status: 'requested', startDate: new Date().toISOString().slice(0, 10), dueDate: new Date(Date.now() + durationMonths * 2592000000).toISOString().slice(0, 10), remainingBalance: amount, purpose }, ...workspace.loans] }); };
  const approveLoan = (loanId: string) => { const loan = workspace.loans.find((l) => l.id === loanId); if (!loan) return; const tx: Transaction = { id: crypto.randomUUID(), stokvelId: activeStokvel.id, type: 'loan_issued', amount: loan.amount, description: `Disbursed group loan to ${loan.borrowerName}`, date: new Date().toISOString().slice(0, 10), memberName: loan.borrowerName, reference: `LOAN-${loan.id.slice(0, 8)}`, category: 'Group Financing' }; setWorkspace((w) => ({ ...w, loans: w.loans.map((l) => l.id === loanId ? { ...l, status: 'active' } : l), transactions: [tx, ...w.transactions], stokvels: w.stokvels.map((s) => s.id === activeStokvel.id ? { ...s, totalBalance: s.totalBalance - loan.amount } : s) })); };
  const castVote = (proposalId: string, vote: 'for' | 'against') => patch({ proposals: workspace.proposals.map((p) => p.id === proposalId ? { ...p, votesFor: p.votesFor + (vote === 'for' ? 1 : 0), votesAgainst: p.votesAgainst + (vote === 'against' ? 1 : 0), userVoted: vote } : p) });

  return <div className="min-h-screen bg-background pb-24 text-foreground selection:bg-primary md:pb-0">
    <Navbar stokvels={workspace.stokvels} activeStokvel={activeStokvel} onSelectStokvel={(s) => setActiveStokvelId(s.id)} onOpenCreateModal={() => navigate('trust')} onOpenContributionModal={() => setContribOpen(true)} notifications={workspace.notifications} unreadCount={unread} onMarkNotificationsRead={() => setWorkspaceRaw((w) => ({ ...w, notifications: w.notifications.map((n) => ({ ...n, read: true })) }))} onSignOut={() => void supabase.auth.signOut()} saving={saving} />
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8"><HeaderHero stokvel={activeStokvel} onOpenContributionModal={() => setContribOpen(true)} onOpenLoanModal={() => setLoanOpen(true)} />
      <nav className="mb-8 hidden items-center gap-2 overflow-x-auto border-b border-border pb-4 md:flex">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors ${activeTab === id ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface text-textSecondary hover:text-foreground'}`}><Icon className="size-4" />{label}</button>)}</nav>
      {activeTab === 'overview' && <StokvelOverview stokvel={activeStokvel} members={workspace.members} contributions={workspace.contributions} transactions={workspace.transactions} onNavigateTab={navigate} />}
      {activeTab === 'members' && <MemberTracker members={workspace.members} stokvel={activeStokvel} onOpenAddMemberModal={() => setMemberOpen(true)} onOpenReminderModal={setReminderMember} onVerifyMemberPayment={verifyPayment} />}
      {activeTab === 'payouts' && <PayoutsRotation payouts={workspace.payouts} stokvel={activeStokvel} />}
      {activeTab === 'loans' && <LoansManager loans={workspace.loans} stokvel={activeStokvel} onOpenNewLoanModal={() => setLoanOpen(true)} onApproveLoan={approveLoan} />}
      {activeTab === 'governance' && <GovernanceVoting proposals={workspace.proposals} onOpenNewProposalModal={() => setProposalOpen(true)} onCastVote={castVote} />}
      {activeTab === 'ledger' && <FinancialLedger transactions={workspace.transactions} />}
      {activeTab === 'access' && workspaceId && <AccessActivity workspaceId={workspaceId} role={role} userId={session.user.id} />}
      {!canEdit && activeTab !== 'access' && <p className="mb-4 rounded-lg border border-border bg-surface p-3 text-sm text-textSecondary">You have view-only access to this group.</p>}
      {activeTab === 'trust' && <TrustAndSecurity stokvel={activeStokvel} settings={workspace.securitySettings} onUpdateSettings={(securitySettings) => patch({ securitySettings })} onUpdateGroupName={(name) => { updateActive((s) => ({ ...s, name })); patch({ securitySettings: { ...workspace.securitySettings, groupName: name } }); }} />}

    </main>
    {moreOpen && <div className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 rounded-xl border border-border bg-surface-card p-3 shadow-2xl md:hidden"><div className="mb-2 flex items-center justify-between px-2"><p className="text-sm font-bold">More tools</p><button aria-label="Close more tools" className="grid size-9 place-items-center" onClick={() => setMoreOpen(false)}><X className="size-4" /></button></div><div className="grid grid-cols-2 gap-2">{tabs.slice(2).filter((t) => t.id !== 'loans').map(({ id, short, icon: Icon }) => <button key={id} className="flex min-h-12 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-left text-sm" onClick={() => navigate(id)}><Icon className="size-4 text-primary" />{short}</button>)}</div></div>}
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface-card/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">{[{ id: 'overview', label: 'Home', icon: LayoutDashboard }, { id: 'members', label: 'Members', icon: Users }, { id: 'contribute', label: 'Pay', icon: Wallet }, { id: 'loans', label: 'Loans', icon: Landmark }, { id: 'more', label: 'More', icon: MoreHorizontal }].map(({ id, label, icon: Icon }) => <button key={id} aria-label={label} onClick={() => id === 'contribute' ? setContribOpen(true) : id === 'more' ? setMoreOpen((v) => !v) : navigate(id)} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${activeTab === id ? 'text-primary' : 'text-textSecondary'}`}><Icon className="size-5" />{label}</button>)}</nav>
    <InstallPrompt />
    <Toaster />
    <AddContributionModal isOpen={contribOpen} onClose={() => setContribOpen(false)} members={workspace.members} stokvel={activeStokvel} onSubmit={recordContribution} />
    <WhatsAppReminderModal isOpen={reminderMember !== null} onClose={() => setReminderMember(null)} member={reminderMember} stokvel={activeStokvel} />
    <NewLoanModal isOpen={loanOpen} onClose={() => setLoanOpen(false)} members={workspace.members} stokvel={activeStokvel} onSubmit={applyLoan} />
    <AddMemberModal open={memberOpen} onOpenChange={setMemberOpen} stokvelId={activeStokvel.id} onSubmit={(member) => setWorkspace((w) => ({ ...w, members: [...w.members, member], stokvels: w.stokvels.map((s) => s.id === activeStokvel.id ? { ...s, memberCount: s.memberCount + 1 } : s) }))} />
    <NewProposalModal open={proposalOpen} onOpenChange={setProposalOpen} stokvelId={activeStokvel.id} totalVoters={workspace.members.length} onSubmit={(proposal) => { patch({ proposals: [proposal, ...workspace.proposals] }); addNotice('New motion published', proposal.title, 'info'); }} />
  </div>;
}