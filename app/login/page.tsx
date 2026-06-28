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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md z-10 transition-all duration-300">
        {/* Logo/Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-rose-400 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white fill-white/10" />
          </div>
          <h1 className="text-3xl font-serif tracking-wide bg-gradient-to-r from-slate-100 via-indigo-200 to-rose-100 bg-clip-text text-transparent font-semibold">
            Wedding Manager
          </h1>
          <p className="text-sm text-slate-400 mt-2 tracking-wide">
            Digital Invitation & RSVP Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-medium mb-6 text-slate-200">Admin Sign In</h2>
          
          <form action={formAction} className="space-y-6">
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
              >
                Access Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoFocus
                  placeholder="Enter admin password"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  disabled={isPending}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Hint: Default is <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400">admin123</code>
              </p>
            </div>

            {state?.error && (
              <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-xs px-4 py-3 rounded-xl">
                {state.error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-rose-500 hover:from-indigo-500 hover:to-rose-400 text-white rounded-xl py-3 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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
        <p className="text-center text-xs text-slate-600 mt-8">
          Developed with ❤️ by Pramuditha Nadun
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
