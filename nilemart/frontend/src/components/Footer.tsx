import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-12 bg-navy pb-24 pt-8 text-sm text-white/70 md:pb-8 border-t border-white/10">
      <div className="container-x grid gap-6 sm:grid-cols-4">
        <div>
          <div className="text-xl font-extrabold text-white">
            Shop<span className="text-brand">Hub</span>
          </div>
          <p className="mt-1 text-xs">
            Ethiopia&apos;s smart marketplace — authentic local sellers and fast nationwide delivery.
          </p>
        </div>
        <div>
          <b className="text-white">Delivery Hubs</b>
          <p className="mt-1 text-xs">
            Addis Ababa (Same day) · Adama · Hawassa · Bahir Dar · Dire Dawa · Mekelle · Gondar
          </p>
        </div>
        <div>
          <b className="text-white">Payment Options</b>
          <p className="mt-1 text-xs">
            Telebirr SuperApp · CBE Birr · Debit Cards / Chapa · Cash on Delivery
          </p>
        </div>
        <div>
          <b className="text-white">Portals</b>
          <ul className="mt-1 space-y-1 text-xs">
            <li>
              <Link href="/orders" className="hover:text-white transition">
                Customer Order Tracking
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-white transition">
                Customer Account
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="text-brand hover:underline font-bold">
                Staff Admin Portal →
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x mt-8 border-t border-white/10 pt-4 flex flex-wrap justify-between items-center text-xs text-white/50">
        <p>© {new Date().getFullYear()} ShopHub Ethiopia · Prices in ETB incl. 15% VAT · 14-day Buyer Protection</p>
        <Link href="/admin/login" className="hover:text-white/80 transition">
          Admin Sign In
        </Link>
      </div>
    </footer>
  );
}
