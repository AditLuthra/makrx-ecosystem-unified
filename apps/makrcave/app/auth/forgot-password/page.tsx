'use client';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Reset your password</h1>
        {sent ? (
          <p className="text-green-600">
            If an account exists for {email}, a reset link has been sent.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-3"
          >
            <label className="block text-sm">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border rounded px-3 py-2"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
