import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Home</h1>
      <div className="flex gap-3">
        <Link
          to="/login"
          className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
