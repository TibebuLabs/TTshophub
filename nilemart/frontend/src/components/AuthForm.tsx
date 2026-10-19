'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, useToast } from '@/lib/store';
import type { User } from '@/lib/types';

type AuthMode = 'login' | 'register';

interface AuthFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const initialValues: AuthFormValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
}

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const setSession = useAuth((state) => state.setSession);
  const isRegistering = mode === 'register';
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [values, setValues] = useState<AuthFormValues>(initialValues);

  function updateValue(field: keyof AuthFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate(): string | null {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())) {
      return 'Enter a valid email address.';
    }
    if (!values.password) {
      return 'Enter your password.';
    }
    if (!isRegistering) {
      return null;
    }
    if (values.name.trim().length < 3) {
      return 'Enter your full name.';
    }
    if (!/^(\+251|0)?[79]\d{8}$/.test(values.phone.replace(/\s/g, ''))) {
      return 'Enter a valid Ethiopian phone number (09… or +251…).';
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(values.password)) {
      return 'Password needs at least 8 characters, including a letter and a number.';
    }
    if (values.password !== values.confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const body = isRegistering
        ? {
            name: values.name.trim(),
            email: values.email.trim(),
            phone: values.phone.replace(/\s/g, ''),
            password: values.password,
          }
        : {
            email: values.email.trim(),
            password: values.password,
          };
      const session = await api<{ token: string; user: User }>(
        isRegistering ? '/auth/register' : '/auth/login',
        { method: 'POST', json: body },
      );

      setSession(session.token, session.user);
      useToast
        .getState()
        .show(`Welcome, ${session.user.name.split(' ')[0]}!`);

      const next = new URLSearchParams(window.location.search).get('next');
      const destination =
        next?.startsWith('/') && !next.startsWith('//') && !next.includes('\\')
          ? next
          : '/';
      router.push(session.user.role === 'admin' ? '/admin' : destination);
    } catch (submitError: unknown) {
      setError(errorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto my-4 max-w-md">
      <form onSubmit={submit} className="card p-5 sm:p-7" noValidate>
        <div className="text-center text-3xl font-extrabold">
          Shop<span className="text-brand">Hub</span>
        </div>
        <h1 className="mt-1 text-center text-xl font-extrabold text-ink">
          {isRegistering ? 'Create your account' : 'Welcome back'}
        </h1>

        {isRegistering && (
          <>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              className="input"
              value={values.name}
              onChange={(event) => updateValue('name', event.target.value)}
              autoComplete="name"
              required
            />
            <label className="label" htmlFor="phone">
              Phone (09… or +251…)
            </label>
            <input
              id="phone"
              className="input"
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(event) => updateValue('phone', event.target.value)}
              autoComplete="tel"
              required
            />
          </>
        )}

        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="input"
          type="email"
          value={values.email}
          onChange={(event) => updateValue('email', event.target.value)}
          autoComplete="email"
          required
        />

        <label className="label" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            className="input pr-14"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={(event) => updateValue('password', event.target.value)}
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-xs font-bold text-mute"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {isRegistering && (
          <>
            <label className="label" htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={values.confirmPassword}
              onChange={(event) =>
                updateValue('confirmPassword', event.target.value)
              }
              autoComplete="new-password"
              required
            />
          </>
        )}

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-500/10 p-2 text-sm text-red-500"
          >
            {error}
          </p>
        )}
        <button
          className="btn btn-primary mt-4 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Please wait…'
            : isRegistering
              ? 'Create account'
              : 'Sign in'}
        </button>

        <p className="mt-4 text-center text-sm text-mute">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <Link className="font-bold text-brand" href="/login">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link className="font-bold text-brand" href="/register">
                Create an account
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
