import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';

export function AuthGate({ children }: { children: (session: Session) => ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: email.split('@')[0] } } });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === 'signup' && !result.data.session) setMessage('Check your email to confirm your account, then sign in.');
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if (result.error) {
      setMessage(result.error.message);
      setBusy(false);
    }
  };

  if (checking) return <div className="grid min-h-screen place-items-center bg-background"><LoaderCircle className="size-7 animate-spin text-primary" /></div>;
  if (session) return children(session);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-6 shadow-2xl sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary"><ShieldCheck /></div>
          <div><h1 className="text-xl font-extrabold text-foreground">Sisonke</h1><p className="text-xs text-textSecondary">Secure stokvel workspace</p></div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="mb-6 mt-1 text-sm text-textSecondary">Your group records stay private and available on every device.</p>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-foreground">Email
            <span className="relative mt-1.5 block"><Mail className="absolute left-3 top-3 size-4 text-textSecondary" /><input className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></span>
          </label>
          <label className="block text-sm font-medium text-foreground">Password
            <span className="relative mt-1.5 block"><LockKeyhole className="absolute left-3 top-3 size-4 text-textSecondary" /><input className="h-11 w-full rounded-lg border border-border bg-surface px-10 text-sm text-foreground outline-none focus:border-primary" type={showPassword ? 'text' : 'password'} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1.5 grid size-8 place-items-center text-textSecondary">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span>
          </label>
          {message && <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-textSecondary">{message}</p>}
          <Button className="h-11 w-full" disabled={busy}>{busy && <LoaderCircle className="animate-spin" />}{mode === 'signin' ? 'Sign in' : 'Create account'}</Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-textSecondary"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <Button variant="outline" className="h-11 w-full" onClick={signInWithGoogle} disabled={busy}>Continue with Google</Button>
        <button className="mt-5 w-full text-sm text-primary" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }}>{mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
      </section>
    </main>
  );
}