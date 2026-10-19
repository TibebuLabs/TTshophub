import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Create Account | NileMart Ethiopia',
  description: 'Create a free account to shop authentic Ethiopian coffee, fashion, tech, and gifts.',
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
