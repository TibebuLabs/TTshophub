'use client';
import { useState } from 'react';
import Guard from '@/components/Guard';
import { api } from '@/lib/api';
import { useAuth, useToast } from '@/lib/store';
import type { User } from '@/lib/types';
import { LogOut } from 'lucide-react';

export default function AccountPage() { return <Guard><Account /></Guard>; }

function Account() {
  const { user, setUser, logout } = useAuth(), toast = useToast((s) => s.show);
  const [p, setP] = useState({ name: user!.name, phone: user!.phone }), [pw, setPw] = useState({ current: '', next: '' }), [e1, setE1] = useState(''), [e2, setE2] = useState('');
  const save = async () => { setE1(''); try { setUser(await api<User>('/auth/profile', { method: 'PATCH', json: p })); toast('Profile updated ✓'); } catch (e: any) { setE1(e.message); } };
  const change = async () => { setE2(''); try { await api('/auth/password', { method: 'PATCH', json: pw }); setPw({ current: '', next: '' }); toast('Password updated ✓'); } catch (e: any) { setE2(e.message); } };
  return (
    <div className="mx-auto grid max-w-3xl gap-4 pb-8 md:grid-cols-2">
      <h1 className="text-2xl font-extrabold md:col-span-2">Account settings</h1>
      <section className="card p-4"><h2 className="font-extrabold">Profile</h2>
        <label className="label">Full name</label><input className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
        <label className="label">Phone</label><input className="input" inputMode="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} />
        <label className="label">Email</label><input className="input opacity-60" value={user!.email} disabled />
        {e1 && <p className="mt-2 text-sm text-red-500">{e1}</p>}<button className="btn btn-primary mt-4 w-full" onClick={save}>Save profile</button></section>
      <section className="card p-4"><h2 className="font-extrabold">Change password</h2>
        <label className="label">Current password</label><input className="input" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
        <label className="label">New password</label><input className="input" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /><p className="mt-1 text-xs text-mute">8+ characters with a letter and a number</p>
        {e2 && <p className="mt-2 text-sm text-red-500">{e2}</p>}<button className="btn btn-dark mt-4 w-full" onClick={change}>Update password</button></section>
      <button className="btn btn-outline md:col-span-2" onClick={() => { logout(); location.href = '/'; }}><LogOut aria-hidden="true" className="mr-1.5 inline h-4 w-4" />Log out</button>
    </div>
  );
}
