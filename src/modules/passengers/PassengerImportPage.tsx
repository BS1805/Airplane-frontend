import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../auth/AuthContext';

interface PassengerImportResult {
  totalRows: number;
  insertedCount: number;
  skippedDuplicateCount: number;
  skippedInvalidCount: number;
  rowErrors: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export function PassengerImportPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PassengerImportResult | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const downloadTemplate = async () => {
    try {
      setDownloading(true);
      setError(null);
      const res = await apiClient.get('/api/Passengers/import/template', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PassengerImportTemplate.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Could not download template.');
    } finally {
      setDownloading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    setFile(chosen ?? null);
    setError(null);
    setResult(null);
    setApiMessage(null);
  };

  const importCsv = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setApiMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post<ApiResponse<PassengerImportResult>>(
        '/api/Passengers/import',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        }
      );

      const body = res.data;
      setApiMessage(body.message ?? null);

      if (body.data) {
        setResult(body.data);
      }

      if (!body.success && body.message) {
        setError(body.message);
      }
      if (body.errors && body.errors.length > 0) {
        setError(body.errors[0]);
      }
    } catch (e: unknown) {
      const axiosErr = e as {
        response?: { data?: { message?: string; errors?: string[] } };
      };
      const data = axiosErr?.response?.data;
      setError(
        data?.message ??
          (Array.isArray(data?.errors) && data.errors.length
            ? data.errors[0]
            : 'Import failed.')
      );
      setResult(data?.data ?? null);
      setApiMessage(data?.message ?? null);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setError(null);
    setResult(null);
    setApiMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="auth-page flight-search-page">
      <div className="auth-shell">
        <aside className="auth-illustration">
          <div className="flight-search-overlay">
            <div className="flex gap-6 mb-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/')}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </div>

            <div className="auth-hello">
              Passenger<span> Import</span>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="auth-title">Import passengers</h2>
              <p className="auth-subtitle" style={{ marginBottom: 0 }}>
                Upload a CSV file to import passengers in batch.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadTemplate}
              disabled={downloading}
              className="flight-search-button"
              style={{ width: 'auto', paddingInline: '1.75rem' }}
            >
              {downloading ? 'Downloading…' : 'Download template'}
            </button>
          </div>

          <div className="flight-search-form">
            <div className="flight-search-row">
              <div className="w-full">
                <div className="flight-search-label">Upload CSV</div>
                <p className="text-sm text-slate-500 mb-2">
                  Columns: FirstName, LastName, Address, City, Country, ZipCode, Telephone, Email
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={onFileChange}
                  className="flight-search-input"
                  style={{ padding: '0.5rem' }}
                />
                {file && (
                  <div className="flex gap-2 mt-2 items-center">
                    <span className="text-sm text-slate-600">{file.name}</span>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="btn btn-ghost text-sm"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={importCsv}
                  disabled={loading || !file}
                  className="flight-search-button mt-3"
                >
                  {loading ? 'Importing…' : 'Import passengers'}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4 mt-6">
            <h2 className="auth-title" style={{ fontSize: '1.4rem' }}>
              Import result
            </h2>
            <p className="auth-subtitle" style={{ marginBottom: '1rem' }}>
              Summary and row-level errors appear here after upload.
            </p>
          </div>

          {loading && (
            <p className="text-sm text-slate-500 mt-2">Importing…</p>
          )}

          {!loading && error && (
            <div className="sale-preview-invalid">
              <span className="sale-preview-invalid-icon">✕</span>
              <div>
                <div className="sale-preview-invalid-title">Error</div>
                <div className="sale-preview-invalid-msg">{error}</div>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <p className="text-sm text-slate-400 mt-1">
              Once you import a CSV, a detailed summary will appear here.
            </p>
          )}

          {!loading && result && (
            <div className="sale-preview-card">
              <div
                className={
                  result.insertedCount > 0
                    ? 'sale-preview-badge sale-preview-badge--ok'
                    : 'sale-preview-badge sale-preview-badge--fail'
                }
              >
                {result.insertedCount > 0
                  ? `✓ ${result.insertedCount} passenger(s) imported`
                  : 'No passengers imported'}
              </div>

              {apiMessage && (
                <p className="text-sm text-slate-600 mt-2">{apiMessage}</p>
              )}

              <div className="sale-preview-section mt-4">
                <div className="sale-preview-section-title">Summary</div>
                <div className="sale-preview-grid">
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Rows in file</span>
                    <span className="sale-preview-value">{result.totalRows}</span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Inserted</span>
                    <span className="sale-preview-value">{result.insertedCount}</span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Skipped (duplicate)</span>
                    <span className="sale-preview-value">{result.skippedDuplicateCount}</span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Skipped (invalid)</span>
                    <span className="sale-preview-value">{result.skippedInvalidCount}</span>
                  </div>
                </div>
              </div>

              {result.rowErrors.length > 0 && (
                <>
                  <div className="sale-preview-divider" />
                  <div className="sale-preview-section">
                    <div className="sale-preview-section-title">Row errors</div>
                    <ul
                      className="text-sm text-slate-600 list-disc pl-5 space-y-1 max-h-48 overflow-y-auto"
                      style={{ maxHeight: '12rem' }}
                    >
                      {result.rowErrors.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
