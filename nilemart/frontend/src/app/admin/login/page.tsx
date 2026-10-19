import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Admin Portal Sign In | ShopHub',
  description: 'Authorized administrative sign-in portal for ShopHub staff and managers.',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="py-4">
      <AuthForm mode="login" />
    </div>
  );
}
