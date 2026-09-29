import { useEffect, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent); };
    window.addEventListener('beforeinstallprompt', handler);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches;
    setShowIos(ios);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (hidden || (!prompt && !showIos)) return null;
  return <div className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-primary/30 bg-surface-card p-3 shadow-2xl md:bottom-5">
    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">{showIos && !prompt ? <Share2 className="size-5" /> : <Download className="size-5" />}</div>
    <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">Add Sisonke to your phone</p><p className="text-xs text-textSecondary">{showIos && !prompt ? 'Tap Share, then Add to Home Screen.' : 'Open it from your home screen like an app.'}</p></div>
    {prompt && <Button size="sm" onClick={() => { void prompt.prompt(); setHidden(true); }}>Install</Button>}
    <button aria-label="Dismiss install message" onClick={() => setHidden(true)} className="grid size-8 place-items-center text-textSecondary"><X className="size-4" /></button>
  </div>;
}