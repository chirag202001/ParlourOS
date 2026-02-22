'use client';

import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Scissors,
  Package,
  Truck,
  UserCog,
  ArrowLeft,
  Loader2,
  Info,
  RotateCcw,
} from 'lucide-react';
import { IMPORT_SCHEMAS, validateImportData, generateCSVTemplate, type ValidationResult, type ColumnDef } from '@/lib/import-utils';
import { validateImport, executeImport, getImportStats, type ImportResult } from './actions';

// ─── Icons for each type ────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, any> = {
  customers: Users,
  services: Scissors,
  products: Package,
  vendors: Truck,
  staff: UserCog,
};

const TYPE_COLORS: Record<string, string> = {
  customers: 'border-blue-200 bg-blue-50 hover:border-blue-400',
  services: 'border-pink-200 bg-pink-50 hover:border-pink-400',
  products: 'border-amber-200 bg-amber-50 hover:border-amber-400',
  vendors: 'border-green-200 bg-green-50 hover:border-green-400',
  staff: 'border-purple-200 bg-purple-50 hover:border-purple-400',
};

const TYPE_ICON_COLORS: Record<string, string> = {
  customers: 'text-blue-600',
  services: 'text-pink-600',
  products: 'text-amber-600',
  vendors: 'text-green-600',
  staff: 'text-purple-600',
};

// ─── Steps ──────────────────────────────────────────────────────────────────────

type Step = 'select' | 'upload' | 'preview' | 'result';

interface ImportStats {
  customers: number;
  services: number;
  products: number;
  vendors: number;
  staff: number;
}

export function ImportClient({ stats }: { stats: ImportStats }) {
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 1: Select import type ──

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setStep('upload');
    setValidation(null);
    setImportResult(null);
    setRawRows([]);
    setFileName('');
  };

  // ── Step 2: Upload & parse CSV ──

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsValidating(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        setRawRows(rows);

        // Client-side validation
        const result = validateImportData(selectedType, rows);
        setValidation(result);
        setIsValidating(false);
        setStep('preview');
      },
      error: (err) => {
        setValidation({
          valid: false,
          errors: [{ row: 0, column: 'File', message: `Failed to parse CSV: ${err.message}` }],
          data: [],
          totalRows: 0,
          validRows: 0,
          skippedRows: 0,
        });
        setIsValidating(false);
        setStep('preview');
      },
    });
  }, [selectedType]);

  // ── Step 3: Execute import ──

  const handleImport = async () => {
    if (!validation || validation.data.length === 0) return;

    setIsImporting(true);
    try {
      const result = await executeImport(selectedType, validation.data);
      setImportResult(result);
      setStep('result');
    } catch (err: any) {
      setImportResult({
        success: false,
        created: 0,
        skipped: 0,
        errors: [err.message || 'Import failed'],
        message: 'Import failed',
      });
      setStep('result');
    } finally {
      setIsImporting(false);
    }
  };

  // ── Download template ──

  const handleDownloadTemplate = (type: string) => {
    const csv = generateCSVTemplate(type);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Reset ──

  const handleReset = () => {
    setStep('select');
    setSelectedType('');
    setFileName('');
    setRawRows([]);
    setValidation(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const schema = selectedType ? IMPORT_SCHEMAS[selectedType] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Data</h1>
          <p className="text-muted-foreground">
            Bulk-import your existing parlour data from CSV files
          </p>
        </div>
        {step !== 'select' && (
          <Button variant="outline" onClick={handleReset}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        )}
      </div>

      {/* Current record counts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(IMPORT_SCHEMAS).map(([key, s]) => {
          const Icon = TYPE_ICONS[key];
          const count = stats[key as keyof ImportStats] ?? 0;
          return (
            <Card key={key} className="py-3">
              <CardContent className="flex items-center gap-3 p-0 px-4">
                <Icon className={`h-5 w-5 ${TYPE_ICON_COLORS[key]}`} />
                <div>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ═══════════════ STEP 1: Select Type ═══════════════ */}
      {step === 'select' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(IMPORT_SCHEMAS).map(([key, s]) => {
            const Icon = TYPE_ICONS[key];
            return (
              <Card
                key={key}
                className={`cursor-pointer border-2 transition-colors ${TYPE_COLORS[key]}`}
                onClick={() => handleSelectType(key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg bg-white p-2 shadow-sm`}>
                      <Icon className={`h-6 w-6 ${TYPE_ICON_COLORS[key]}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{s.label}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadTemplate(key);
                    }}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ═══════════════ STEP 2: Upload ═══════════════ */}
      {step === 'upload' && schema && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Upload {schema.label} CSV
              </CardTitle>
              <CardDescription>
                Upload a CSV file with your {schema.label.toLowerCase()} data. Download the template first to see the expected format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expected columns info */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Info className="h-4 w-4" />
                  Expected Columns
                </h4>
                <div className="grid gap-1 text-sm">
                  {schema.columns.map((col) => (
                    <div key={col.key} className="flex items-center gap-2">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{col.key}</code>
                      {col.required && <Badge variant="destructive" className="text-[10px] px-1 py-0">Required</Badge>}
                      <span className="text-muted-foreground text-xs">— {col.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* File upload zone */}
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10">
                <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">Drop your CSV file here or click to browse</p>
                <p className="mb-4 text-xs text-muted-foreground">Only .csv files are supported</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <div className="flex gap-3">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadTemplate(selectedType)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </div>

              {isValidating && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing and validating...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════ STEP 3: Preview & Validate ═══════════════ */}
      {step === 'preview' && validation && schema && (
        <div className="space-y-6">
          {/* Validation summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="flex items-center gap-3 p-4">
                <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{validation.totalRows}</p>
                  <p className="text-xs text-blue-700">Total Rows</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{validation.validRows}</p>
                  <p className="text-xs text-green-700">Valid Rows</p>
                </div>
              </CardContent>
            </Card>
            <Card className={`border-${validation.errors.length > 0 ? 'red' : 'gray'}-200 bg-${validation.errors.length > 0 ? 'red' : 'gray'}-50`}>
              <CardContent className="flex items-center gap-3 p-4">
                {validation.errors.length > 0 ? (
                  <XCircle className="h-8 w-8 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <p className={`text-2xl font-bold ${validation.errors.length > 0 ? 'text-red-900' : 'text-gray-500'}`}>
                    {validation.errors.length}
                  </p>
                  <p className={`text-xs ${validation.errors.length > 0 ? 'text-red-700' : 'text-gray-500'}`}>Errors</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  📄 {fileName}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setStep('upload'); setValidation(null); }}>
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Re-upload
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Data Preview</TabsTrigger>
              {validation.errors.length > 0 && (
                <TabsTrigger value="errors">
                  Errors ({validation.errors.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Data Preview Table */}
            <TabsContent value="preview">
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          {schema.columns.map((col) => (
                            <TableHead key={col.key}>{col.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validation.data.slice(0, 50).map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                            {schema.columns.map((col) => (
                              <TableCell key={col.key} className="max-w-[200px] truncate">
                                {row[col.key] instanceof Date
                                  ? (row[col.key] as Date).toLocaleDateString()
                                  : String(row[col.key] ?? '—')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        {validation.data.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={schema.columns.length + 1} className="py-8 text-center text-muted-foreground">
                              No valid rows found. Check the errors tab for details.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {validation.data.length > 50 && (
                    <p className="border-t p-3 text-center text-xs text-muted-foreground">
                      Showing first 50 of {validation.data.length} valid rows
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Errors Table */}
            {validation.errors.length > 0 && (
              <TabsContent value="errors">
                <Card>
                  <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Row</TableHead>
                            <TableHead className="w-40">Column</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validation.errors.slice(0, 100).map((err, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Badge variant="outline">{err.row}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">{err.column}</TableCell>
                              <TableCell className="text-red-600">{err.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {validation.errors.length > 100 && (
                      <p className="border-t p-3 text-center text-xs text-muted-foreground">
                        Showing first 100 of {validation.errors.length} errors
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Import Actions */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div className="text-sm">
              {validation.validRows > 0 ? (
                <p>
                  <span className="font-medium text-green-700">{validation.validRows} valid rows</span> ready to import
                  {validation.errors.length > 0 && (
                    <span className="text-muted-foreground"> ({validation.skippedRows} rows with errors will be skipped)</span>
                  )}
                </p>
              ) : (
                <p className="text-red-600">No valid rows to import. Please fix the errors and re-upload.</p>
              )}
              {selectedType === 'staff' && validation.validRows > 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ Default password for all imported staff: <code className="rounded bg-amber-100 px-1 font-mono">Welcome@123</code>
                </p>
              )}
            </div>
            <Button
              onClick={handleImport}
              disabled={validation.validRows === 0 || isImporting}
              className="min-w-[140px]"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {validation.validRows} Rows
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP 4: Result ═══════════════ */}
      {step === 'result' && importResult && (
        <div className="space-y-6">
          <Card className={`border-2 ${importResult.success ? 'border-green-300 bg-green-50' : importResult.created > 0 ? 'border-amber-300 bg-amber-50' : 'border-red-300 bg-red-50'}`}>
            <CardContent className="flex flex-col items-center p-8 text-center">
              {importResult.success ? (
                <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
              ) : importResult.created > 0 ? (
                <AlertTriangle className="mb-4 h-16 w-16 text-amber-600" />
              ) : (
                <XCircle className="mb-4 h-16 w-16 text-red-600" />
              )}

              <h2 className="mb-2 text-xl font-bold">
                {importResult.success
                  ? 'Import Successful! 🎉'
                  : importResult.created > 0
                    ? 'Partially Imported'
                    : 'Import Failed'}
              </h2>

              <p className="mb-6 text-muted-foreground">{importResult.message}</p>

              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700">{importResult.created}</p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">{importResult.skipped}</p>
                  <p className="text-xs text-muted-foreground">Skipped (duplicates)</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{importResult.errors.length}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Show errors if any */}
          {importResult.errors.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-700">Import Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[200px] overflow-auto space-y-1">
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-sm text-red-600">• {err}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Import More Data
            </Button>
            <Button variant="outline" onClick={() => handleSelectType(selectedType)}>
              <Upload className="mr-2 h-4 w-4" />
              Import More {schema?.label}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
