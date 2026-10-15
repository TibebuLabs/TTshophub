'use client';
import { useCallback, useEffect, useState } from 'react';
import { Confirm, Empty, Modal, Skeleton } from '@/components/ui';
import { api, useConfig } from '@/lib/api';
import { etb } from '@/lib/format';
import { useToast } from '@/lib/store';
import type { Product } from '@/lib/types';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import ProductArtwork from '@/components/ProductArtwork';
import ImageUpload from '@/components/ImageUpload';

type Form = { id?: string; name: string; nameAm: string; category: string; price: string; oldPrice: string; stock: string; seller: string; description: string; images: string[] };
const blank = (cat: string): Form => ({ name: '', nameAm: '', category: cat, price: '', oldPrice: '', stock: '10', seller: '', description: '', images: [] });

export default function AdminProducts() {
  const cfg = useConfig(), toast = useToast((s) => s.show);
  const [items, setItems] = useState<Product[] | null>(null), [q, setQ] = useState(''), [cat, setCat] = useState(''), [form, setForm] = useState<Form | null>(null), [del, setDel] = useState<Product | null>(null), [err, setErr] = useState(''), [imagesUploading, setImagesUploading] = useState(false);
  const load = useCallback(() => { const p = new URLSearchParams({ sort: 'newest' }); if (q) p.set('q', q); if (cat) p.set('category', cat); return api<Product[]>('/products?' + p).then(setItems); }, [q, cat]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  const stock = async (p: Product, d: number) => { try { await api(`/products/${p.id}`, { method: 'PATCH', json: { stock: Math.max(0, p.stock + d) } }); load(); } catch (e: any) { toast(e.message); } };
  const save = async () => {
    if (!form) return; setErr('');
    const price = +form.price, oldPrice = +form.oldPrice || Math.round(price * 1.25);
    if (form.name.trim().length < 2) return setErr('Enter a product name.');
    if (!(price > 0)) return setErr('Enter a valid price.');
    if (oldPrice < price) return setErr('Old price must be higher than the price.');
    if (!(+form.stock >= 0)) return setErr('Stock cannot be negative.');
    if (form.seller.trim().length < 2) return setErr('Enter the seller name.');
    if (!form.id && form.images.length === 0) return setErr('Upload at least one product image.');
    if (imagesUploading) return setErr('Wait for image uploads to finish.');
    const body = { name: form.name.trim(), nameAm: form.nameAm.trim(), category: form.category, price, oldPrice, stock: Math.floor(+form.stock), seller: form.seller.trim(), description: form.description.trim(), images: form.images };
    try { await api(form.id ? `/products/${form.id}` : '/products', { method: form.id ? 'PATCH' : 'POST', json: body }); toast(form.id ? 'Product updated ✓' : 'Product added ✓'); setForm(null); load(); } catch (e: any) { setErr(e.message); }
  };
  const remove = async (p: Product) => { try { await api(`/products/${p.id}`, { method: 'DELETE' }); toast('Product deleted'); load(); } catch (e: any) { toast(e.message); } };
  const f = (k: keyof Form, v: string) => setForm(form && { ...form, [k]: v });
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2"><label className="relative min-w-[180px] flex-1"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" /><input className="input pl-9" placeholder="Search products or sellers" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products or sellers" /></label><select className="input !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{cfg.categories.map((c) => <option key={c}>{c}</option>)}</select><button className="btn btn-primary" onClick={() => { setErr(''); setForm(blank(cfg.categories[0])); }}><Plus aria-hidden="true" className="mr-1.5 inline h-4 w-4" />Add product</button></div>
      {!items ? <Skeleton className="h-48" /> : !items.length ? <Empty icon={<Package className="h-8 w-8 text-brand" />} title="No products found" /> : (
        <div className="space-y-2">{items.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
            <ProductArtwork product={p} className="h-12 w-12 flex-none rounded-xl bg-brand/10" iconClassName="h-6 w-6 text-brand" />
            <div className="min-w-[160px] flex-1"><b className="text-sm">{p.name}</b><div className="text-xs text-mute">{p.category} · {p.seller}</div></div>
            <b className="text-sm">{etb(p.price)}</b>
            <div className="flex items-center rounded-lg border border-line text-sm"><button className="px-2.5 py-1" onClick={() => stock(p, -5)} aria-label="Decrease stock">−</button><b className={`w-9 text-center ${p.stock <= 3 ? 'text-red-500' : ''}`}>{p.stock}</b><button className="px-2.5 py-1" onClick={() => stock(p, 5)} aria-label="Increase stock">+</button></div>
            <div className="flex gap-2"><button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setForm({ id: p.id, name: p.name, nameAm: p.nameAm, category: p.category, price: String(p.price), oldPrice: String(p.oldPrice), stock: String(p.stock), seller: p.seller, description: p.description, images: p.images ?? [] }); }}><Pencil aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />Edit</button><button className="btn btn-danger btn-sm" onClick={() => setDel(p)} aria-label="Delete"><Trash2 aria-hidden="true" className="h-4 w-4" /></button></div>
          </div>))}</div>)}
      <Modal open={!!form} onClose={() => { if (!imagesUploading) setForm(null); }} title={form?.id ? 'Edit product' : 'Add product'}>
        {form && <>
          <label className="label">Name (English)</label><input className="input" value={form.name} onChange={(e) => f('name', e.target.value)} />
          <label className="label">Name (አማርኛ, optional)</label><input className="input" value={form.nameAm} onChange={(e) => f('nameAm', e.target.value)} />
          <label className="label">Category icon is selected automatically</label><select className="input" value={form.category} onChange={(e) => f('category', e.target.value)}>{cfg.categories.map((c) => <option key={c}>{c}</option>)}</select>
          <div className="grid grid-cols-3 gap-2"><div><label className="label">Price (ETB)</label><input className="input" type="number" min="1" value={form.price} onChange={(e) => f('price', e.target.value)} /></div><div><label className="label">Old price</label><input className="input" type="number" value={form.oldPrice} onChange={(e) => f('oldPrice', e.target.value)} /></div><div><label className="label">Stock</label><input className="input" type="number" min="0" value={form.stock} onChange={(e) => f('stock', e.target.value)} /></div></div>
          <label className="label">Seller</label><input className="input" value={form.seller} onChange={(e) => f('seller', e.target.value)} />
          <label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => f('description', e.target.value)} />
          <ImageUpload images={form.images} onChange={(images) => setForm((current) => current && { ...current, images })} onUploadingChange={setImagesUploading} required={!form.id} />
          {err && <p role="alert" className="mt-2 text-sm text-red-500">{err}</p>}<button className="btn btn-primary mt-4 w-full" onClick={save} disabled={imagesUploading}>{form.id ? 'Save changes' : 'Add product'}</button>
        </>}
      </Modal>
      <Confirm open={!!del} text={`Delete “${del?.name}” permanently?`} onClose={() => setDel(null)} onYes={() => del && remove(del)} />
    </div>
  );
}
