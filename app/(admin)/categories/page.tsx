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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-sans tracking-tight font-semibold text-gray-900">Guest Categories</h1>
        <p className="text-xs text-gray-500 mt-1">
          Organise your guest list into groups like Family, Friends, or Work and colour-code them.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-655 text-xs px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Category Form */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-fit space-y-5">
          <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4.5 h-4.5 text-blue-500" /> Create Category
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="cat-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Category Name
              </label>
              <input
                id="cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groom's Friends"
                className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                maxLength={40}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Color Swatch
              </label>
              <div className="grid grid-cols-7 gap-2 mb-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setColour(preset.value)}
                    style={{ backgroundColor: preset.value }}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      colour === preset.value
                        ? 'border-gray-900 scale-110 shadow-sm'
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
                  className="w-8 h-8 rounded border border-gray-200 bg-transparent p-0 cursor-pointer overflow-hidden"
                  title="Custom Color"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{colour}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-md py-2.5 text-xs font-semibold tracking-wide shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4.5 h-4.5 text-blue-500" /> Active Categories
          </h2>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-gray-450 text-xs border border-dashed border-gray-200 rounded bg-gray-50/50">
              No categories created yet. Add one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="bg-white border border-gray-200 rounded-md p-3.5 flex items-center justify-between hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      style={{ backgroundColor: cat.colour }} 
                      className="w-3 h-3 rounded-full shadow-inner shrink-0" 
                    />
                    <span className="font-semibold text-gray-800 text-xs">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId !== null}
                    className="p-1.5 text-gray-400 hover:text-red-650 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
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
