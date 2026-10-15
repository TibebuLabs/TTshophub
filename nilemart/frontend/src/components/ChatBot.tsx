'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { etb } from '@/lib/format';
import { useAuth, useCart, useHydrated, useToast } from '@/lib/store';
import type { Product } from '@/lib/types';
import {
  Bot,
  Coffee,
  Gift,
  MessageCircle,
  Package,
  Send,
  ShieldCheck,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface Msg {
  role: 'user' | 'bot';
  text: string;
  products?: Product[];
}

const CHIPS = [
  { icon: <Coffee aria-hidden="true" className="h-3.5 w-3.5 text-brand" />, label: 'Best Ethiopian Coffee' },
  { icon: <Gift aria-hidden="true" className="h-3.5 w-3.5 text-brand" />, label: 'Gift under 2000' },
  { icon: <Shirt aria-hidden="true" className="h-3.5 w-3.5 text-brand" />, label: 'Habesha Fashion' },
  { icon: <Smartphone aria-hidden="true" className="h-3.5 w-3.5 text-brand" />, label: 'Telebirr & CBE payments' },
  { icon: <Truck aria-hidden="true" className="h-3.5 w-3.5 text-brand" />, label: 'Delivery time to Addis' },
  { icon: <Package aria-hidden="true" className="h-3.5 w-3.5 text-brand" />, label: 'Where is my order?' },
];

export default function ChatBot() {
  const h = useHydrated();
  const user = useAuth((s) => s.user);
  const lines = useCart((s) => s.lines);
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.show);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'bot',
      text: "ሰላም! I'm **Hub**, your smart Ethiopian AI shopping assistant. Ask me for recommendations, deals, delivery schedules, Telebirr/CBE payments, or order status — in English or አማርኛ.",
    },
  ]);

  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  if (!h || user?.role === 'admin') return null;

  const speak = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* ignore audio error */
    }
  };

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;

    const next: Msg[] = [...msgs, { role: 'user', text: t }];
    setMsgs(next);
    setInput('');
    setBusy(true);

    try {
      let orders: unknown[] = [];
      if (user) {
        orders = await api<{ code: string; status: string; total: number; city: string }[]>('/orders/mine').catch(
          () => [],
        );
      }

      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(-8).map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          cart: lines.map((l) => `${l.product.name} x${l.qty}`),
          user: user?.name || null,
          orders: (orders as any[]).slice(0, 5),
        }),
      });

      const d = await r.json();
      const botReply = d.reply || 'Sorry, I could not answer that.';
      setMsgs([...next, { role: 'bot', text: botReply, products: d.products }]);
      speak(botReply);
    } catch {
      setMsgs([...next, { role: 'bot', text: 'I am having trouble connecting. Please try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  const fmt = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : p));

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-brand px-4 py-3 font-extrabold text-white shadow-xl shadow-brand/40 transition hover:scale-105 md:bottom-6 md:right-6 border border-white/20"
        aria-label={open ? 'Close assistant' : 'Open smart AI assistant'}
      >
        {open ? (
          <X aria-hidden="true" className="h-5 w-5" />
        ) : (
          <>
            <Bot aria-hidden="true" className="h-5 w-5" />
            <span className="hidden sm:inline">Ask Hub AI</span>
          </>
        )}
      </button>

      {open && (
        <div className="card fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-40 flex h-[76vh] animate-up flex-col overflow-hidden rounded-b-none shadow-2xl md:inset-x-auto md:bottom-20 md:right-6 md:h-[560px] md:w-[410px] md:rounded-3xl bg-card border-line">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand/20 border border-brand/40 text-brand">
                <Bot aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <b className="text-sm">Hub AI 2.0</b>
                  <span className="rounded bg-brand/30 px-1.5 py-0.2 text-[9px] font-bold text-brand uppercase">
                    Smart
                  </span>
                </div>
                <div className="text-[11px] text-white/70">Shopping Assistant · English &amp; አማርኛ</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setTtsEnabled(!ttsEnabled);
                  toast(ttsEnabled ? 'Speech reader disabled' : 'Speech reader enabled 🔊');
                }}
                className={`grid h-8 w-8 place-items-center rounded-full transition ${
                  ttsEnabled ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/10'
                }`}
                title={ttsEnabled ? 'Disable voice read-aloud' : 'Enable voice read-aloud'}
              >
                {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10 transition"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Conversation history */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 bg-bg/40">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-soft ${
                  m.role === 'user'
                    ? 'ml-auto bg-brand text-white'
                    : 'bg-card text-ink border border-line'
                }`}
              >
                <div className="whitespace-pre-wrap">{fmt(m.text)}</div>

                {/* In-chat interactive product cards */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    {m.products.map((p) => (
                      <div
                        key={p.id}
                        className="card flex items-center gap-2.5 p-2 bg-bg/60 border-line hover:border-brand/40 transition"
                      >
                        <CategoryIcon category={p.category} className="h-6 w-6 flex-none text-brand" />
                        <Link
                          href={`/products/${p.id}`}
                          onClick={() => setOpen(false)}
                          className="min-w-0 flex-1 hover:text-brand"
                        >
                          <b className="line-clamp-1 text-xs text-ink">{p.name}</b>
                          <div className="flex items-center gap-1.5 text-[11px] text-mute">
                            <span className="font-bold text-brand">{etb(p.price)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                              <Star aria-hidden="true" className="h-3 w-3 fill-current" />
                              {p.rating.toFixed(1)}
                            </span>
                          </div>
                        </Link>
                        <button
                          className="btn btn-primary btn-sm !py-1 text-[11px] font-bold"
                          disabled={p.stock <= 0}
                          onClick={() => toast(add(p) ? 'Added to cart' : 'Not enough stock')}
                        >
                          <ShoppingCart aria-hidden="true" className="mr-1 inline h-3 w-3" />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-1.5 w-16 rounded-2xl bg-card border border-line px-3 py-2 text-xs font-bold text-mute">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            )}
            <div ref={end} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-line/60 bg-card px-3 py-2">
            {CHIPS.map(({ icon, label }) => (
              <button
                key={label}
                className="flex flex-none items-center gap-1.5 rounded-full border border-line bg-bg/80 px-2.5 py-1 text-[11px] font-medium text-mute hover:border-brand hover:text-brand transition"
                onClick={() => send(label)}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            className="flex gap-2 border-t border-line bg-card p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              className="input !py-2 text-xs"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about coffee, tech deals, delivery to Addis…"
              aria-label="Message"
            />
            <button
              className="btn btn-primary !px-4"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
