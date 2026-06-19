/**
 * BulkCourseImport.tsx
 *
 * Self-contained panel rendered inside Dashboard when activeTab === 'admin-import'.
 * Visible only to users where authUser.is_admin === true.
 *
 * Features:
 *  - Drag-and-drop + click-to-upload file picker (.csv / .xlsx / .json)
 *  - CSV template download (generates a real CSV in the browser, no server needed)
 *  - File validation before upload (type, size)
 *  - Upload progress indicator (indeterminate spinner + "Importing…")
 *  - Results summary: created / skipped / errors counts with colour-coded pills
 *  - Per-row results table: row #, title, status badge, reason
 *  - Filterable results (All / Created / Skipped / Errors)
 *  - Full error handling with inline messages
 *  - Reset to try again
 */

import { useState, useRef, useCallback, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { apiFetch, unwrap } from '../lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RowStatus = 'created' | 'skipped' | 'error';

interface RowResult {
  row:    number;
  title:  string | null;
  status: RowStatus;
  reason: string | null;
}

interface ImportResult {
  total_rows: number;
  created:    number;
  skipped:    number;
  errors:     number;
  results:    RowResult[];
}

type FilterMode = 'all' | RowStatus;

// ---------------------------------------------------------------------------
// CSV template content
// ---------------------------------------------------------------------------

const CSV_TEMPLATE_HEADERS = [
  'title',
  'description',
  'category',
  'price',
  'image',
  'is_published',
  'catalogue_code',
];

const CSV_TEMPLATE_EXAMPLE_ROWS = [
  [
    'Introduction to Biology',
    'A complete overview of biological systems and life sciences',
    'Science',
    '200.00',
    'https://example.com/biology.jpg',
    'false',
    'BIO-1001',
  ],
  [
    'Advanced Mathematics',
    'Calculus, linear algebra, and statistics for university entrance',
    'Mathematics',
    '250.00',
    '',
    'false',
    'MAT-2001',
  ],
];

function downloadCsvTemplate() {
  const rows = [
    CSV_TEMPLATE_HEADERS,
    ...CSV_TEMPLATE_EXAMPLE_ROWS,
  ];
  const csv = rows
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'tilla_course_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: RowStatus }) {
  if (status === 'created') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        Created
      </span>
    );
  }
  if (status === 'skipped') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
        <AlertTriangle className="w-3 h-3" />
        Skipped
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
      <XCircle className="w-3 h-3" />
      Error
    </span>
  );
}

function SummaryCard({
  label,
  count,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${color}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/60 dark:bg-black/20">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black tabular-nums leading-none">{count}</p>
        <p className="text-[11px] font-medium mt-0.5 opacity-80 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function BulkCourseImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [isDragging, setIsDragging]   = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);

  // Result state
  const [result, setResult]           = useState<ImportResult | null>(null);
  const [filterMode, setFilterMode]   = useState<FilterMode>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // ── File selection ──────────────────────────────────────────────────────

  const validateAndSetFile = (file: File) => {
    setUploadError(null);
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.json')) {
      setUploadError('Unsupported file type. Please select a .csv, .xlsx, or .json file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum allowed size is 5 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    // Reset input so the same file can be re-selected after a reset
    e.target.value = '';
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // ── Upload ───────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const form = new FormData();
      form.append('file', selectedFile);

      const res = await apiFetch('/courses/import/', {
        method: 'POST',
        body:   form,
        // Do NOT set Content-Type — browser sets it with boundary automatically
      });

      const body = await res.json();

      if (!res.ok) {
        // Non-2xx — extract error message from envelope or raw body
        const msg =
          (body as any)?.message ||
          (body as any)?.error   ||
          `Server error (${res.status})`;
        setUploadError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        return;
      }

      const data = unwrap<ImportResult>(body);
      setResult(data);
      setFilterMode('all');
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Network error — check your connection.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setUploadError(null);
    setFilterMode('all');
    setExpandedRows(new Set());
  };

  // ── Row expand toggle ─────────────────────────────────────────────────────

  const toggleRow = (row: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(row) ? next.delete(row) : next.add(row);
      return next;
    });
  };

  // ── Filtered results ──────────────────────────────────────────────────────

  const filteredResults = result
    ? filterMode === 'all'
      ? result.results
      : result.results.filter(r => r.status === filterMode)
    : [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      key="admin-import"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bulk Course Import
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Upload a CSV or Excel file to create multiple courses at once.
          </p>
        </div>
        <button
          onClick={downloadCsvTemplate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Column reference card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
          Required Columns
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'title',          required: true,  hint: 'Course title (max 255 chars)' },
            { name: 'description',    required: true,  hint: 'Full course description' },
            { name: 'category',       required: true,  hint: 'e.g. Science, Math (max 100 chars)' },
            { name: 'price',          required: false, hint: 'Decimal, e.g. 200.00' },
            { name: 'image',          required: false, hint: 'Full URL starting with https://' },
            { name: 'is_published',   required: false, hint: 'true / false (default: false)' },
            { name: 'catalogue_code', required: false, hint: 'Matches courseCatalogue.ts code' },
          ].map(col => (
            <div
              key={col.name}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-default"
            >
              <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {col.name}
              </code>
              {col.required && (
                <span className="text-[9px] font-black text-mango uppercase tracking-wider">*</span>
              )}
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                {col.hint}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
          <span className="text-mango font-bold">*</span> Required.
          Column headers are case-insensitive. Extra columns are ignored.
        </p>
      </div>

      {/* Upload zone — hidden once we have results */}
      <AnimatePresence>
        {!result && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-all cursor-pointer select-none
                ${isDragging
                  ? 'border-mango bg-mango/5 scale-[1.01]'
                  : selectedFile
                    ? 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10 cursor-default'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-mango/50 hover:bg-mango/5'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.json"
                className="hidden"
                onChange={handleFileInput}
              />

              {selectedFile ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedFile.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedFile(null); setUploadError(null); }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-mango/20 text-mango' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {isDragging ? 'Drop your file here' : 'Drop your file here, or click to browse'}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">CSV or XLSX · Max 5 MB</p>
                  </div>
                </>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                >
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`mt-4 w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
                ${!selectedFile || isUploading
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-mango text-white shadow-lg shadow-mango/20 hover:bg-mango/90 hover:scale-[1.01] active:scale-[0.99]'
                }
              `}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Courses
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard
                label="Total Rows"
                count={result.total_rows}
                icon={FileText}
                color="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              />
              <SummaryCard
                label="Created"
                count={result.created}
                icon={CheckCircle2}
                color="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              />
              <SummaryCard
                label="Skipped"
                count={result.skipped}
                icon={AlertTriangle}
                color="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
              />
              <SummaryCard
                label="Errors"
                count={result.errors}
                icon={XCircle}
                color="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
              />
            </div>

            {/* Filter + Reset row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'created', 'skipped', 'error'] as FilterMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                      ${filterMode === mode
                        ? 'bg-mango text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    {mode === 'all'
                      ? `All (${result.total_rows})`
                      : mode === 'created'
                        ? `Created (${result.created})`
                        : mode === 'skipped'
                          ? `Skipped (${result.skipped})`
                          : `Errors (${result.errors})`
                    }
                  </button>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Import Another File
              </button>
            </div>

            {/* Per-row results table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {filteredResults.length === 0 ? (
                <div className="p-10 text-center text-slate-400 dark:text-slate-600 text-sm">
                  No rows match this filter.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-950 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                    <span className="col-span-1">Row</span>
                    <span className="col-span-5">Title</span>
                    <span className="col-span-2">Status</span>
                    <span className="col-span-4">Reason</span>
                  </div>

                  {filteredResults.map(row => (
                    <div key={`${row.row}-${row.title}`}>
                      <button
                        onClick={() => row.reason ? toggleRow(row.row) : undefined}
                        className={`w-full grid grid-cols-12 gap-3 px-5 py-3.5 text-left transition-colors
                          ${row.reason ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer' : 'cursor-default'}
                        `}
                      >
                        <span className="col-span-1 text-xs font-mono text-slate-400 dark:text-slate-600 self-center">
                          {row.row}
                        </span>
                        <span className="col-span-5 text-sm font-medium text-slate-800 dark:text-slate-200 self-center truncate pr-2">
                          {row.title || <span className="text-slate-400 italic">—</span>}
                        </span>
                        <span className="col-span-2 self-center">
                          <StatusBadge status={row.status} />
                        </span>
                        <span className="col-span-4 self-center flex items-center justify-between gap-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {row.reason
                              ? (expandedRows.has(row.row) ? '' : row.reason)
                              : <span className="text-green-500 dark:text-green-400">—</span>
                            }
                          </span>
                          {row.reason && (
                            expandedRows.has(row.row)
                              ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </span>
                      </button>

                      {/* Expanded reason */}
                      <AnimatePresence>
                        {row.reason && expandedRows.has(row.row) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-3.5 pt-1">
                              <p className={`text-sm px-3 py-2 rounded-lg font-medium
                                ${row.status === 'error'
                                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                }
                              `}>
                                {row.reason}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
