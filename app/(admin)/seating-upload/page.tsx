'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Download
} from 'lucide-react';

export default function SeatingUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<{
    updatedCount: number;
    totalRowsProcessed: number;
    totalErrors: number;
    errors: string[] | null;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        setSuccessResult(null);
      } else {
        setError('Please upload a .csv file only.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        setSuccessResult(null);
      } else {
        setError('Please select a .csv file only.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');
      setSuccessResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/guests/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload and parse seating CSV.');
      }

      setSuccessResult(data);
      setFile(null); // Reset file input
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight font-semibold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-500" /> Import Seating Assignments
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Upload an edited guest CSV sheet containing table number assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/rsvp" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:border-gray-400 bg-white text-xs font-semibold text-gray-700 rounded-md transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download RSVPs
          </Link>
          <Link 
            href="/find-table" 
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white rounded-md transition-colors shadow-xs"
          >
            Seating Lookup View
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: File Dropzone & Results */}
        <div className="lg:col-span-2 space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-150 text-red-705 text-xs px-4 py-3.5 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <span className="font-bold text-sm">Seating updated successfully!</span>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-y border-emerald-150/50 text-center font-medium">
                <div>
                  <span className="block text-xl font-bold text-emerald-700">{successResult.updatedCount}</span>
                  <span className="text-[10px] text-emerald-605 uppercase tracking-wide">Guests Updated</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-emerald-700">{successResult.totalRowsProcessed}</span>
                  <span className="text-[10px] text-emerald-605 uppercase tracking-wide">Processed Rows</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-emerald-700">{successResult.totalErrors}</span>
                  <span className="text-[10px] text-emerald-605 uppercase tracking-wide">Unmatched Rows</span>
                </div>
              </div>
              
              {successResult.totalErrors > 0 && successResult.errors && (
                <div className="pt-2 space-y-1.5 text-amber-800">
                  <p className="font-semibold text-[11px] uppercase tracking-wider">Unmatched Row Warnings (Top 10 shown):</p>
                  <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] bg-white/40 p-2.5 rounded-md">
                    {successResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  <p className="text-[9px] italic text-amber-705">
                    💡 Unmatched guests might have spelling discrepancies. Make sure the 'Guest ID' column is preserved.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dropzone area */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'
              }`}
            >
              <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-150 text-gray-400'} transition-colors`}>
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-gray-800">
                  Drag & drop your edited CSV here, or{' '}
                  <label className="text-blue-500 hover:text-blue-600 cursor-pointer font-bold underline">
                    browse files
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleFileChange}
                    />
                  </label>
                </p>
                <p className="text-[10px] text-gray-500 max-w-sm mx-auto">
                  Only `.csv` spreadsheets are supported. Ensure a column named `Table No` exists in the uploaded file.
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-xs text-gray-700 font-medium font-mono max-w-xs truncate">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
              )}

              {isUploading && (
                <div className="text-xs text-blue-500 font-semibold flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing assignments...
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-150 pt-4">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-450 disabled:cursor-not-allowed text-white rounded-md py-2.5 px-6 text-xs font-semibold tracking-wide shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Seating Assignments
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Instructions Sidebar */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
            <HelpCircle className="w-4 h-4 text-gray-400" /> Upload Instructions
          </h2>
          
          <div className="space-y-4 text-xs leading-relaxed text-gray-650">
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
              <div>
                <p className="font-semibold text-gray-800">Download Guest RSVPs</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Go to the RSVP Tracker page and download the registry as a CSV file.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
              <div>
                <p className="font-semibold text-gray-800">Add the Seating Column</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Open the file in Excel or Numbers. We have automatically pre-added a <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">Table No</code> column for you. Fill in the values (e.g. "Table 4" or "VVIP Table").</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
              <div>
                <p className="font-semibold text-gray-800">Save as CSV</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Ensure you save the spreadsheet back as a `.csv` file (Comma Separated Values).</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
              <div>
                <p className="font-semibold text-gray-800">Upload & Verify</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Drop the file here. The system will look up guests based on Guest ID, falling back to Guest Name if ID is missing.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
