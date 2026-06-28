'use client';

import React, { useActionState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction, LoginState } from './actions';
import { Heart, Lock, Loader2 } from 'lucide-react';

const initialState: LoginState = {
  error: '',
  success: false
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state?.success) {
      router.push(callbackUrl);
      router.refresh();
    }
  }, [state?.success, router, callbackUrl]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md animate-fade-in">
        {/* Monogram/Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-blue-500 fill-blue-500/10" />
          </div>
          <h1 className="text-2xl font-sans tracking-tight text-gray-900 font-semibold">
            O & K
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">
            Wedding invitation manager
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-lg font-medium mb-6 text-gray-950">Admin Sign In</h2>
          
          <form action={formAction} className="space-y-6">
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
              >
                Access Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoFocus
                  placeholder="Enter admin password"
                  className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  disabled={isPending}
                />
              </div>
              <p className="text-xs text-gray-450 mt-2">
                Hint: Default is <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">admin123</code>
              </p>
            </div>

            {state?.error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-md">
                {state.error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-md py-2.5 text-sm font-semibold tracking-wide shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Developed by Pramuditha Nadun
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
