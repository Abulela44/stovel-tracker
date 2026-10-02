import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { History, ShieldCheck, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

type Role = 'admin' | 'officer' | 'member';
interface MemberRow { user_id: string; email: string; role: Role }
interface InviteRow { id: string; email: string; role: Role; accepted_at: string | null }
interface LogRow { id: string; actor_email: string; action: string; details: Record<string, unknown>; created_at: string }

const ROLE_INFO: Record<Role, string> = {
  admin: 'Full control, including people, roles, security and the activity log',
  officer: 'Can change members, payments, loans and the ledger',
  member: 'Can view everything but change nothing',
};
const ACTION_LABEL: Record<string, string> = {
  signed_in: 'Signed in', records_changed: 'Changed records', member_invited: 'Invited someone',
  invite_accepted: 'Joined the group', role_changed: 'Changed a role', member_removed: 'Removed someone', invite_cancelled: 'Cancelled an invite',
};

export function AccessActivity({ workspaceId, role, userId }: { workspaceId: string; role: Role; userId: string }) {
  const isAdmin = role === 'admin';
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [email, setEmail] = useState(''); const [newRole, setNewRole] = useState<Role>('member');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [m, i, l] = await Promise.all([
      supabase.from('workspace_members').select('user_id,email,role').eq('workspace_id', workspaceId).order('created_at'),
      isAdmin ? supabase.from('workspace_invites').select('id,email,role,accepted_at').eq('workspace_id', workspaceId).is('accepted_at', null) : Promise.resolve({ data: [] }),
      supabase.from('activity_log').select('id,actor_email,action,details,created_at').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(100),
    ]);
    setMembers((m.data ?? []) as MemberRow[]); setInvites((i.data ?? []) as InviteRow[]); setLogs((l.data ?? []) as LogRow[]);
  }, [workspaceId, isAdmin]);
  useEffect(() => { void load(); }, [load]);

  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>) => {
    setBusy(true); setError(''); const { error: e } = await fn(); setBusy(false);
    if (e) setError(e.message); else void load();
  };
  const invite = (e: FormEvent) => { e.preventDefault(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; } void run(() => supabase.rpc('invite_member', { _ws: workspaceId, _email: email.trim(), _role: newRole })).then(() => setEmail('')); };

  const describe = (log: LogRow) => {
    const d = log.details ?? {};
    if (log.action === 'records_changed' && Array.isArray(d['sections'])) return (d['sections'] as string[]).map((s) => s.replace('_', ' ')).join(', ');
    return [d['email'] ?? d['user'], d['role']].filter(Boolean).join(' · ');
  };
  const suspicious = (log: LogRow) => log.action === 'records_changed' && Array.isArray(log.details?.['sections']) && (log.details['sections'] as string[]).some((s) => ['transactions', 'loans', 'security_settings'].includes(s));

  return <div className="space-y-6">
    <section className="glass-panel rounded-2xl border border-border p-5">
      <h2 className="flex items-center gap-2 text-xl font-bold"><ShieldCheck className="size-5 text-primary" /> People & permissions</h2>
      <p className="mt-1 text-sm text-textSecondary">Your role: <strong className="capitalize text-foreground">{role}</strong> — {ROLE_INFO[role]}.</p>
      {isAdmin && <form onSubmit={invite} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} type="email" placeholder="Email to invite" className="h-11 flex-1 rounded-lg border border-border bg-surface px-3 text-sm" />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"><option value="member">Member (view only)</option><option value="officer">Officer</option><option value="admin">Admin</option></select>
        <Button type="submit" disabled={busy} className="h-11"><UserPlus className="size-4" /> Invite</Button>
      </form>}
      {isAdmin && <p className="mt-2 text-xs text-textSecondary">They join this group automatically when they sign up or sign in with that email.</p>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <ul className="mt-4 divide-y divide-border">
        {members.map((m) => <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
          <span className="min-w-0 truncate">{m.email || 'Unknown'}{m.user_id === userId && <span className="text-textSecondary"> (you)</span>}</span>
          {isAdmin && m.user_id !== userId ? <span className="flex items-center gap-2">
            <select value={m.role} onChange={(e) => void run(() => supabase.rpc('set_member_role', { _ws: workspaceId, _user: m.user_id, _role: e.target.value as Role }))} className="h-9 rounded-lg border border-border bg-surface px-2 text-xs"><option value="member">Member</option><option value="officer">Officer</option><option value="admin">Admin</option></select>
            <button aria-label={`Remove ${m.email}`} onClick={() => { if (confirm(`Remove ${m.email} from the group?`)) void run(() => supabase.rpc('remove_member', { _ws: workspaceId, _user: m.user_id })); }} className="grid size-9 place-items-center rounded-lg border border-border text-textSecondary hover:text-destructive"><X className="size-4" /></button>
          </span> : <span className="capitalize text-textSecondary">{m.role}</span>}
        </li>)}
        {invites.map((i) => <li key={i.id} className="flex items-center justify-between gap-2 py-3 text-sm text-textSecondary">
          <span className="truncate">{i.email} · invited as {i.role}</span>
          <button onClick={() => void run(() => supabase.rpc('cancel_invite', { _invite: i.id }))} className="text-xs underline">Cancel</button>
        </li>)}
      </ul>
    </section>

    <section className="glass-panel rounded-2xl border border-border p-5">
      <h2 className="flex items-center gap-2 text-xl font-bold"><History className="size-5 text-primary" /> Security activity log</h2>
      <p className="mt-1 text-sm text-textSecondary">{isAdmin ? 'Sign-ins and changes made by everyone in the group. Changes to money, loans or security are highlighted.' : 'Your own sign-ins and changes.'}</p>
      <ul className="mt-4 space-y-2">
        {logs.length === 0 && <li className="text-sm text-textSecondary">No activity yet.</li>}
        {logs.map((l) => <li key={l.id} className={`rounded-lg border p-3 text-sm ${suspicious(l) ? 'border-amber-500/40 bg-amber-500/5' : 'border-border bg-surface'}`}>
          <div className="flex flex-wrap justify-between gap-2"><strong>{ACTION_LABEL[l.action] ?? l.action}</strong><span className="font-mono text-xs text-textSecondary">{new Date(l.created_at).toLocaleString('en-ZA')}</span></div>
          <p className="mt-1 text-xs text-textSecondary">{l.actor_email || 'Unknown'}{describe(l) ? ` — ${describe(l)}` : ''}</p>
        </li>)}
      </ul>
    </section>
  </div>;
}
