import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const reduced = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center page-gradient px-4 py-12">
      <motion.div
        className="ln-card w-full max-w-[400px] px-8 py-10"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-7"><Logo /></div>

        <h1 className="text-[1.375rem]">Welcome back</h1>
        <p className="mt-1.5 mb-7 text-sm text-[var(--ink-muted)]">Sign in to your account.</p>

        {serverError && <p className="error-banner mb-6">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="ln-label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="ln-input"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              })}
            />
            {errors.email && <p className="field-err">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="ln-label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="ln-input"
              placeholder="Your password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="field-err">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-1">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[var(--ink-muted)]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-[var(--accent)] hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
