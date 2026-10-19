import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Admin Registration | ShopHub',
  description: 'Register staff administrator account with invite code.',
  robots: { index: false, follow: false },
};

export default function AdminRegisterPage() {
  return (
    <div className="py-4">
      <AuthForm mode="register" />
    </div>
  );
}
