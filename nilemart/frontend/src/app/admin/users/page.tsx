'use client';
import { useCallback, useEffect, useState } from 'react';
import { Confirm, Empty, Modal, Skeleton } from '@/components/ui';
import { api } from '@/lib/api';
import { etb } from '@/lib/format';
import { useAuth, useToast } from '@/lib/store';
import type { User } from '@/lib/types';
import { KeyRound, Pencil, Play, Plus, Search, ShieldBan, Trash2, Users } from 'lucide-react';

type Form = { id?: string; name: string; email: string; phone: string; role: 'customer' | 'admin'; password: string };
const tmp = () => 'Shop' + Math.floor(1000 + Math.random() * 9000);

export default function AdminUsers() {
  const me = useAuth((s) => s.user)!, toast = useToast((s) => s.show);
  const [users, setUsers] = useState<User[] | null>(null), [q, setQ] = useState(''), [role, setRole] = useState(''), [form, setForm] = useState<Form | null>(null), [err, setErr] = useState(''), [del, setDel] = useState<User | null>(null), [reset, setReset] = useState<User | null>(null), [shown, setShown] = useState<{ email: string; pw: string } | null>(null);
  const load = useCallback(() => api<User[]>('/users').then(setUsers).catch((e) => toast(e.message)), [toast]);
  useEffect(() => { load(); }, [load]);
  const list = (users || []).filter((u) => (!role || u.role === role) && (u.name + u.email + u.phone).toLowerCase().includes(q.toLowerCase()));
  const save = async () => {
    if (!form) return; setErr('');
    if (form.name.trim().length < 3) return setErr('Enter the full name.');
    if (!/^(\+251|0)?[79]\d{8}$/.test(form.phone.replace(/\s/g, ''))) return setErr('Enter a valid Ethiopian phone number.');
    try {
      const phone = form.phone.replace(/\s/g, '');
      if (form.id) await api(`/users/${form.id}`, { method: 'PATCH', json: { name: form.name.trim(), phone, role: form.role } });
      else { if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setErr('Enter a valid email.'); await api('/users', { method: 'POST', json: { name: form.name.trim(), email: form.email.trim(), phone, role: form.role, password: form.password } }); setShown({ email: form.email, pw: form.password }); }
      toast(form.id ? 'User updated ✓' : 'User created ✓'); setForm(null); load();
    } catch (e: any) { setErr(e.message); }
  };
  const suspend = async (u: User) => { try { await api(`/users/${u.id}/suspend`, { method: 'PATCH', json: { suspended: !u.suspended } }); toast(`${u.name} ${u.suspended ? 'activated' : 'suspended'}`); load(); } catch (e: any) { toast(e.message); } };
  const doReset = async (u: User) => { try { const r = await api<{ tempPassword: string }>(`/users/${u.id}/reset-password`, { method: 'POST' }); setShown({ email: u.email, pw: r.tempPassword }); } catch (e: any) { toast(e.message); } };
  const doDel = async (u: User) => { try { await api(`/users/${u.id}`, { method: 'DELETE' }); toast('User deleted'); load(); } catch (e: any) { toast(e.message); } };
  const f = (k: keyof Form, v: string) => setForm(form && { ...form, [k]: v });
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2"><label className="relative min-w-[180px] flex-1"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" /><input className="input pl-9" placeholder="Name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" /></label><select className="input !w-auto" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option><option value="customer">Customers</option><option value="admin">Admins</option></select><button className="btn btn-primary" onClick={() => { setErr(''); setForm({ name: '', email: '', phone: '', role: 'customer', password: tmp() }); }}><Plus aria-hidden="true" className="mr-1.5 inline h-4 w-4" />Add user</button></div>
      {!users ? <Skeleton className="h-48" /> : !list.length ? <Empty icon={<Users className="h-8 w-8 text-brand" />} title="No users found" /> : (
        <div className="space-y-2">{list.map((u) => { const self = u.id === me.id; return (
          <div key={u.id} className="card flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand text-sm font-extrabold text-white">{u.name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()}</span>
            <div className="min-w-[170px] flex-1"><b className="text-sm">{u.name}</b> {self && <span className="pill">You</span>}<div className="break-all text-xs text-mute">{u.email} · {u.phone}</div></div>
            <div className="text-xs"><span className={`pill ${u.role === 'admin' ? 'pill-green' : ''}`}>{u.role}</span> <span className={`pill ${u.suspended ? 'pill-red' : 'pill-green'}`}>{u.suspended ? 'Suspended' : 'Active'}</span><div className="mt-1 text-mute">{u.orders ?? 0} orders · {etb(u.spent ?? 0)}</div></div>
            {!self && <div className="flex flex-wrap gap-1.5"><button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setForm({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, password: '' }); }}><Pencil aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />Edit</button><button className="btn btn-outline btn-sm" onClick={() => suspend(u)}>{u.suspended ? <><Play aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />Activate</> : <><ShieldBan aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />Suspend</>}</button><button className="btn btn-outline btn-sm" title="Reset password" aria-label="Reset password" onClick={() => setReset(u)}><KeyRound aria-hidden="true" className="h-4 w-4" /></button><button className="btn btn-danger btn-sm" onClick={() => setDel(u)} aria-label="Delete"><Trash2 aria-hidden="true" className="h-4 w-4" /></button></div>}
          </div>); })}</div>)}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit user' : 'Add user'}>
        {form && <>
          <label className="label">Full name</label><input className="input" value={form.name} onChange={(e) => f('name', e.target.value)} />
          <label className="label">Email</label><input className="input" value={form.email} disabled={!!form.id} onChange={(e) => f('email', e.target.value)} />
          <label className="label">Phone</label><input className="input" inputMode="tel" value={form.phone} onChange={(e) => f('phone', e.target.value)} />
          <label className="label">Role</label><select className="input" value={form.role} onChange={(e) => f('role', e.target.value)}><option value="customer">Customer</option><option value="admin">Admin</option></select>
          {!form.id && <><label className="label">Temporary password</label><input className="input" value={form.password} onChange={(e) => f('password', e.target.value)} /><p className="mt-1 text-xs text-mute">Share it with the user — they can change it in Settings.</p></>}
          {err && <p role="alert" className="mt-2 text-sm text-red-500">{err}</p>}<button className="btn btn-primary mt-4 w-full" onClick={save}>{form.id ? 'Save changes' : 'Create user'}</button>
        </>}
      </Modal>
      <Confirm open={!!del} text={`Delete the account of ${del?.name}? Their past orders stay on record.`} onClose={() => setDel(null)} onYes={() => del && doDel(del)} />
      <Confirm open={!!reset} label="Reset" text={`Reset the password for ${reset?.name}? A new temporary password will be generated.`} onClose={() => setReset(null)} onYes={() => reset && doReset(reset)} />
      <Modal open={!!shown} onClose={() => setShown(null)} title="Temporary password"><p className="text-sm text-mute">For <b>{shown?.email}</b> — share it securely.</p><div className="card my-3 p-3 text-center font-mono text-2xl font-extrabold tracking-wider">{shown?.pw}</div><button className="btn btn-primary w-full" onClick={() => setShown(null)}>Done</button></Modal>
    </div>
  );
}
