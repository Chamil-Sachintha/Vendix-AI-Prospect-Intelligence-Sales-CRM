"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import Papa from "papaparse";
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function ImportExportPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update">("skip");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [importResult, setImportResult] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setErrorMsg("");
    setImportResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setParsedRows(results.data);

        // Call preview API
        setLoading(true);
        try {
          const res = await fetch("/api/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "preview",
              records: results.data,
            }),
          });
          const preview = await res.json();
          setPreviewData(preview);
        } catch (err: any) {
          setErrorMsg("Failed to generate import preview.");
        } finally {
          setLoading(false);
        }
      },
      error: () => setErrorMsg("Failed to parse CSV file. Ensure valid CSV format."),
    });
  };

  const handleExecuteImport = async () => {
    if (!parsedRows || parsedRows.length === 0) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "execute",
          records: parsedRows,
          duplicateStrategy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setImportResult(data);
      setPreviewData(null);
      setCsvFile(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          CSV Data Import & Export Hub
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Bulk import prospect companies with duplicate detection, and download structured datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* LEFT: IMPORT WORKFLOW */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
            <Upload className="h-4 w-4 text-[#0033BF]" />
            Import Prospects CSV
          </div>

          <p className="text-xs text-slate-500">
            Upload CSV with columns: Company Name, Industry, Country, City, Field Sales Reps, Current SFA Product, Primary Contact.
          </p>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-200 hover:border-[#0033BF] rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-800">
              {csvFile ? csvFile.name : "Click to select CSV file"}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Maximum 5,000 rows per upload</div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PREVIEW & DUPLICATE STRATEGY */}
          {previewData && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Total Rows Read:</span>
                  <span>{previewData.totalRecords}</span>
                </div>
                <div className="flex items-center justify-between text-amber-700 font-semibold">
                  <span>Potential Duplicates Found:</span>
                  <span>{previewData.duplicatesFound}</span>
                </div>
                <div className="flex items-center justify-between text-rose-700 font-semibold">
                  <span>Validation Errors:</span>
                  <span>{previewData.errorsFound}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duplicate Matching Strategy:
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === "skip"}
                      onChange={() => setDuplicateStrategy("skip")}
                      className="text-[#0033BF]"
                    />
                    <span>Skip Existing Records</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === "update"}
                      onChange={() => setDuplicateStrategy("update")}
                      className="text-[#0033BF]"
                    />
                    <span>Update / Merge Existing</span>
                  </label>
                </div>
              </div>

              {/* Sample Preview Rows */}
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Company</th>
                      <th className="p-2">Country</th>
                      <th className="p-2">Duplicate?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.preview?.map((row: any) => (
                      <tr key={row.index} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-400">{row.index}</td>
                        <td className="p-2 font-semibold text-slate-800">{row.name}</td>
                        <td className="p-2 text-slate-500">{row.country}</td>
                        <td className="p-2">
                          {row.isDuplicate ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                              Existing
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                              New
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleExecuteImport}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {loading ? "Processing Database Import..." : "Execute Bulk Import"}
              </button>
            </div>
          )}

          {/* Import Result Summary */}
          {importResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Import Completed Successfully!
              </div>
              <div>• {importResult.importedCount} new companies added</div>
              <div>• {importResult.updatedCount} existing companies updated</div>
              <div>• {importResult.skippedCount} skipped rows</div>
            </div>
          )}
        </div>

        {/* RIGHT: EXPORT ACTIONS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
            <Download className="h-4 w-4 text-[#0033BF]" />
            Export Database to CSV
          </div>

          <p className="text-xs text-slate-500">
            Download filtered intelligence datasets in standard CSV format for external reporting or spreadsheets.
          </p>

          <div className="space-y-3">
            {[
              {
                entity: "companies",
                title: "Companies & Scale Records",
                desc: "All registered companies, field rep numbers, distribution model & SLRA status.",
              },
              {
                entity: "contacts",
                title: "Contacts & Decision-Makers",
                desc: "All executive contacts, verified phone numbers, and purchasing committee roles.",
              },
              {
                entity: "software",
                title: "Competitor SFA & Tech Stack",
                desc: "All software installations, confidence levels, and renewal dates.",
              },
              {
                entity: "intent",
                title: "Buying Intent Signals",
                desc: "All observed RFP triggers, hiring alerts, and scoring point contributions.",
              },
              {
                entity: "opportunities",
                title: "Pipeline Deals & Opportunities",
                desc: "All open and won opportunities with contract values and sales stages.",
              },
            ].map((exp) => (
              <div
                key={exp.entity}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs">{exp.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{exp.desc}</div>
                </div>

                <a
                  href={`/api/export?entity=${exp.entity}`}
                  download
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
