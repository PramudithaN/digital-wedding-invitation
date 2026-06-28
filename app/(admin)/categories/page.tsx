'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Tag, AlertCircle } from 'lucide-react';
import { Category } from '@/lib/types';

const COLOR_PRESETS = [
  { name: 'Dusty Rose', value: '#E0A899' },
  { name: 'Sage Green', value: '#9CAF88' },
  { name: 'Champagne Gold', value: '#DFBA73' },
  { name: 'Navy Blue', value: '#3B5998' },
  { name: 'Terracotta', value: '#C67A5C' },
  { name: 'Plum Purple', value: '#6E4555' },
  { name: 'Classic Slate', value: '#475569' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [colour, setColour] = useState(COLOR_PRESETS[0].value);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle adding a category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), colour }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create category');
      }

      const newCat = await res.json();
      setCategories((prev) => [...prev, newCat]);
      setName('');
      // Set to first preset by default
      setColour(COLOR_PRESETS[0].value);
    } catch (err: any) {
      setError(err.message || 'Could not add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a category
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setError('');
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete category');
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Could not delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif tracking-wide font-semibold text-slate-100">Guest Categories</h1>
        <p className="text-sm text-slate-400 mt-1">
          Organise your guest list into groups like Family, Friends, or Work and colour-code them.
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Category Form */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit space-y-6">
          <h2 className="text-xl font-serif text-slate-200 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Create Category
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cat-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Category Name
              </label>
              <input
                id="cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groom's Friends"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                maxLength={40}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Color Swatch
              </label>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setColour(preset.value)}
                    style={{ backgroundColor: preset.value }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      colour === preset.value
                        ? 'border-white scale-110 shadow-lg shadow-white/10'
                        : 'border-transparent hover:scale-105'
                    }`}
                    title={preset.name}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-800 bg-transparent p-0 cursor-pointer overflow-hidden"
                  title="Custom Color"
                />
                <span className="text-xs text-slate-400 font-mono uppercase">{colour}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Category
                </>
              )}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-serif text-slate-200 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" /> Active Categories
          </h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-850 rounded-xl">
              No categories created yet. Add your first group above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex items-center justify-between hover:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span 
                      style={{ backgroundColor: cat.colour }} 
                      className="w-4 h-4 rounded-full shadow-inner shrink-0" 
                    />
                    <span className="font-medium text-slate-200 text-sm">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId !== null}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Category"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
