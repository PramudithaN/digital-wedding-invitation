'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  User, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Eye,
  MessageSquare,
  UtensilsCrossed,
  UserPlus
} from 'lucide-react';
import { GuestWithDetails, Category } from '@/lib/types';

export default function EditGuestPage() {
  const router = useRouter();
  const routerParams = useParams();
  const id = routerParams.id as string;

  const [guest, setGuest] = useState<GuestWithDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [side, setSide] = useState<'bride' | 'groom'>('bride');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [guestRes, catsRes] = await Promise.all([
          fetch(`/api/guests/${id}`),
          fetch('/api/categories')
        ]);

        if (guestRes.status === 404) {
          throw new Error('Guest not found');
        }
        if (!guestRes.ok || !catsRes.ok) {
          throw new Error('Failed to load guest details');
        }

        const guestData: GuestWithDetails = await guestRes.json();
        const catsData = await catsRes.json();

        setGuest(guestData);
        setCategories(catsData);

        // Pre-fill form
        setName(guestData.name);
        setPhone(guestData.phone || '');
        setEmail(guestData.email || '');
        setSide(guestData.side || 'bride');
        setCategoryId(guestData.category_id || '');
        setNotes(guestData.notes || '');
      } catch (err: any) {
        setError(err.message || 'Error loading guest');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      const res = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          side,
          category_id: categoryId || null,
          notes: notes.trim()
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update guest');
      }

      router.push('/guests');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Could not update guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this guest record?')) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete guest');
      router.push('/guests');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Could not delete guest');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm">Loading guest dossier...</p>
      </div>
    );
  }

  if (!guest && error) {
    return (
      <div className="space-y-6">
        <Link href="/guests" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to guest list
        </Link>
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-sm p-6 rounded-2xl flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 text-rose-455" />
          <h2 className="text-lg font-semibold">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back navigation */}
      <Link href="/guests" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Guest List
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-serif tracking-wide font-semibold text-slate-100">Edit Guest Dossier</h1>
        <p className="text-sm text-slate-400 mt-1">Review guest card logs, personal messages, and modify details.</p>
      </div>

      {error && (
        <div className="bg-rose-955/40 border border-rose-900/50 text-rose-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Edit Form */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 h-fit">
          <h2 className="text-xl font-serif text-slate-200 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> Guest Details
          </h2>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="edit-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Full Name *
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="edit-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Phone Number (WhatsApp)
              </label>
              <input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94771234567"
                className="w-full bg-slate-955 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="edit-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Side */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Wedding Side *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSide('bride')}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    side === 'bride'
                      ? 'bg-rose-955/20 text-rose-300 border-rose-500/70 shadow-lg shadow-rose-900/5'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Bride's Side
                </button>
                <button
                  type="button"
                  onClick={() => setSide('groom')}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    side === 'groom'
                      ? 'bg-indigo-950/20 text-indigo-300 border-indigo-500/70 shadow-lg shadow-indigo-900/5'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Groom's Side
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="edit-cat" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Category Group
              </label>
              <select
                id="edit-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label htmlFor="edit-notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Private Admin Notes
              </label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="bg-rose-955/20 border border-rose-900/40 text-rose-400 hover:bg-rose-900/20 rounded-xl py-3 px-5 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Guest
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="bg-gradient-to-r from-indigo-600 to-rose-500 hover:from-indigo-500 hover:to-rose-400 text-white rounded-xl py-3 px-6 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tracking & RSVP Summary Sidebar */}
        <div className="space-y-8">
          {/* Invitation Tracking */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-serif text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Invite Tracking
            </h2>

            <div className="space-y-4 text-sm pt-2">
              {/* Short URL / Token */}
              <div>
                <span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Invite Link
                </span>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/invite/${guest?.invite_token}`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-indigo-400 font-mono focus:outline-none cursor-pointer"
                  title="Click to select and copy"
                />
              </div>

              {/* Status Timestamps */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-850">
                  <span className="text-slate-400">Invite Created:</span>
                  <span className="text-slate-200 font-mono">
                    {guest?.created_at ? new Date(guest.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-850">
                  <span className="text-slate-400">Sent via WhatsApp:</span>
                  {guest?.invite_link?.sent_at ? (
                    <span className="text-indigo-400 font-medium">
                      {new Date(guest.invite_link.sent_at).toLocaleDateString()} at{' '}
                      {new Date(guest.invite_link.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Not Sent Yet</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-850">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-sky-400" /> Opened Link:
                  </span>
                  {guest?.invite_link?.opened_at ? (
                    <span className="text-sky-400 font-medium">
                      {new Date(guest.invite_link.opened_at).toLocaleDateString()} at{' '}
                      {new Date(guest.invite_link.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Not Opened Yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RSVP Status */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-serif text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" /> RSVP Status
            </h2>

            {guest?.rsvp ? (
              <div className="space-y-4 pt-2">
                {/* RSVP Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status:</span>
                  {guest.rsvp.status === 'attending' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-900/50">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-955/60 text-rose-400 border border-rose-900/50">
                      <XCircle className="w-3.5 h-3.5" /> Declined
                    </span>
                  )}
                </div>

                <div className="border-t border-slate-850 pt-4 space-y-4">
                  {/* Plus One Details */}
                  {guest.rsvp.plus_one && (
                    <div className="flex gap-2.5 text-sm text-slate-300">
                      <UserPlus className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Plus One guest
                        </span>
                        <span className="font-semibold text-slate-200">
                          {guest.rsvp.plus_one_name || 'Anonymous Guest'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Meal Selection */}
                  {guest.rsvp.meal_choice && (
                    <div className="flex gap-2.5 text-sm text-slate-300">
                      <UtensilsCrossed className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Meal Choice
                        </span>
                        <span className="font-medium text-slate-200 capitalize">
                          {guest.rsvp.meal_choice}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dietary Restrictions */}
                  {guest.rsvp.dietary_notes && (
                    <div className="text-xs bg-slate-950/60 border border-slate-850 p-3 rounded-xl space-y-1">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Dietary notes
                      </span>
                      <p className="text-slate-300">{guest.rsvp.dietary_notes}</p>
                    </div>
                  )}

                  {/* Message from Guest */}
                  {guest.rsvp.message && (
                    <div className="text-xs bg-indigo-950/20 border border-indigo-900/25 p-3 rounded-xl space-y-1">
                      <span className="block text-[10px] text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Guest Message
                      </span>
                      <p className="text-slate-300 italic">"{guest.rsvp.message}"</p>
                    </div>
                  )}

                  {/* Response date */}
                  <div className="text-[10px] text-slate-550 text-right pt-2">
                    Responded:{' '}
                    {guest.rsvp.responded_at
                      ? new Date(guest.rsvp.responded_at).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 italic">
                No RSVP response recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
