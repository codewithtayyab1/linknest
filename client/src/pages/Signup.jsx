import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const reduced = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ username, email, password }) => {
    setServerError('');
    try {
      await signup(username, email, password);
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

        <h1 className="text-[1.375rem]">Create account</h1>
        <p className="mt-1.5 mb-7 text-sm text-[var(--ink-muted)]">Start sharing your links in minutes.</p>

        {serverError && <p className="error-banner mb-6">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="username" className="ln-label">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="ln-input"
              placeholder="yourname"
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'At least 3 characters' },
                maxLength: { value: 20, message: 'Max 20 characters' },
                pattern: { value: /^[a-z0-9_-]+$/i, message: 'Only letters, numbers, _ and - allowed' },
              })}
            />
            {errors.username && <p className="field-err">{errors.username.message}</p>}
          </div>

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
              autoComplete="new-password"
              className="ln-input"
              placeholder="Min. 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            {errors.password && <p className="field-err">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-1">
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[var(--ink-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
