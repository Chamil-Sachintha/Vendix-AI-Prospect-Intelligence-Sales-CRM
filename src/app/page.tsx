"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { ProspectModal } from "@/components/modals/ProspectModal";
import Papa from "papaparse";
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  Eye,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  Globe,
  Mail,
  Phone,
  MessageSquarePlus,
  RefreshCw,
} from "lucide-react";
import { PROSPECT_STATUSES } from "@/lib/constants";

function ProspectLogoCell({
  prospect,
  onClick,
  size = "md",
}: {
  prospect: any;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);
  const cleanDomain = prospect.website
    ? prospect.website.trim().replace(/^https?:\/\//i, "").split("/")[0].split(":")[0]
    : null;

  const logoSrc =
    !imgError &&
    (prospect.logoUrl ||
      (cleanDomain ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128` : null));

  const words = (prospect.name || "")
    .replace(/PLC|Ltd|Limited|Inc|Pvt/gi, "")
    .trim()
    .split(/\s+/);
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (prospect.name || "CO").slice(0, 2).toUpperCase();

  const containerSizes = {
    sm: "h-7 w-7 rounded-lg text-[10px]",
    md: "h-9 w-9 rounded-xl text-xs",
    lg: "h-11 w-11 rounded-2xl text-sm",
  };

  const imgSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${prospect.name} (Click to view details)`}
      className={`inline-flex items-center justify-center border border-slate-200/90 bg-white shadow-2xs hover:border-[#0033BF] hover:shadow-sm transition-all overflow-hidden shrink-0 group/logo ${containerSizes[size]}`}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={prospect.name}
          className={`${imgSizes[size]} object-contain p-0.5 rounded-md transition-transform group-hover/logo:scale-110`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-[#0033BF] text-white font-bold tracking-wider">
          {initials}
        </div>
      )}
    </button>
  );
}

function ProspectsContent() {
  const { currentUser, permissions } = useApp();
  const searchParams = useSearchParams();

  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [sfaFilter, setSfaFilter] = useState("ALL");
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [followUpsDueOnly, setFollowUpsDueOnly] = useState(false);

  useEffect(() => {
    const s = searchParams.get("status");
    const f = searchParams.get("followUpsDue");
    if (s) setStatusFilter(s);
    if (f === "true") setFollowUpsDueOnly(true);
  }, [searchParams]);

  // Modals & Panels
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<any | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<any | null>(null); // Detail slide-over
  const [newInteractionNote, setNewInteractionNote] = useState("");
  const [addingNoteId, setAddingNoteId] = useState<string | null>(null);

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  // Column Visibility Toggle
  const [visibleColumns, setVisibleColumns] = useState({
    logo: true,
    companyName: true,
    industry: true,
    country: true,
    website: true,
    companySize: true,
    currentSfa: true,
    decisionMakerName: true,
    decisionMakerTitle: true,
    contactEmail: true,
    contactPhone: true,
    prospectStatus: true,
    lastContacted: true,
    nextFollowUp: true,
    notes: true,
    actions: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProspects = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (industryFilter !== "ALL") params.append("industry", industryFilter);
    if (countryFilter !== "ALL") params.append("country", countryFilter);
    if (sfaFilter !== "ALL") params.append("sfaProvider", sfaFilter);
    if (sizeFilter !== "ALL") params.append("companySize", sizeFilter);
    if (followUpsDueOnly) params.append("followUpsDue", "true");

    fetch(`/api/companies?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.companies) setProspects(data.companies);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProspects();
  }, [search, statusFilter, industryFilter, countryFilter, sfaFilter, sizeFilter, followUpsDueOnly]);

  // Handle direct status change in table
  const handleStatusChange = async (prospectId: string, newStatus: string) => {
    try {
      // Optimistic update
      setProspects((prev) =>
        prev.map((p) => (p.id === prospectId ? { ...p, prospectStatus: newStatus } : p))
      );

      await fetch(`/api/companies/${prospectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectStatus: newStatus,
          actorName: currentUser.name,
        }),
      });
    } catch (err) {
      console.error(err);
      fetchProspects();
    }
  };

  // Mark Follow-up Completed
  const handleCompleteFollowUp = async (prospectId: string) => {
    try {
      await fetch(`/api/companies/${prospectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextFollowUpDate: null,
          lastContactedAt: new Date().toISOString(),
          newDatedNote: `Follow-up completed on ${new Date().toLocaleDateString()} by ${currentUser.name}.`,
          actorName: currentUser.name,
        }),
      });
      fetchProspects();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Add Dated Note
  const handleSaveNote = async (prospectId: string) => {
    if (!newInteractionNote.trim()) return;
    try {
      await fetch(`/api/companies/${prospectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDatedNote: newInteractionNote.trim(),
          lastContactedAt: new Date().toISOString(),
          actorName: currentUser.name,
        }),
      });
      setNewInteractionNote("");
      setAddingNoteId(null);
      fetchProspects();
      if (selectedProspect?.id === prospectId) {
        // reload details
        fetch(`/api/companies/${prospectId}`)
          .then((res) => res.json())
          .then((d) => setSelectedProspect(d));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Prospect
  const handleDeleteProspect = async (prospectId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete prospect "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/companies/${prospectId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedProspect?.id === prospectId) setSelectedProspect(null);
        fetchProspects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Import handler
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportSummary(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              records: results.data,
              duplicateStrategy: "skip",
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setImportSummary(`Imported ${data.importedCount} prospects successfully (${data.skippedCount} duplicates skipped).`);
            fetchProspects();
          } else {
            setImportSummary(`Import failed: ${data.error}`);
          }
        } catch (err: any) {
          setImportSummary("Failed to process CSV file.");
        } finally {
          setIsImporting(false);
        }
      },
      error: () => {
        setImportSummary("Invalid CSV file format.");
        setIsImporting(false);
      },
    });
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setIndustryFilter("ALL");
    setCountryFilter("ALL");
    setSfaFilter("ALL");
    setSizeFilter("ALL");
    setFollowUpsDueOnly(false);
  };

  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (industryFilter !== "ALL") params.append("industry", industryFilter);
    if (countryFilter !== "ALL") params.append("country", countryFilter);
    if (sfaFilter !== "ALL") params.append("sfaProvider", sfaFilter);
    if (sizeFilter !== "ALL") params.append("companySize", sizeFilter);
    if (followUpsDueOnly) params.append("followUpsDue", "true");
    return `/api/export?${params.toString()}`;
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            SFA Prospect Tracking Database
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0033BF] border border-blue-200">
              {prospects.length} accounts
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain accounts, track field sales operations and decision-makers, and manage follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Import */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>{isImporting ? "Importing..." : "Import CSV"}</span>
            <input
              type="file"
              accept=".csv"
              disabled={isImporting}
              onChange={handleCsvImport}
              className="hidden"
            />
          </label>

          {/* CSV Export */}
          <a
            href={getExportUrl()}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Table</span>
          </a>

          {/* Add Prospect Button */}
          <button
            onClick={() => {
              setEditingProspect(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Prospect</span>
          </button>
        </div>
      </div>

      {importSummary && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#0033BF] text-xs flex items-center justify-between">
          <span>{importSummary}</span>
          <button onClick={() => setImportSummary(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs mb-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, industry, country, SFA software, decision-maker, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
            />
          </div>

          {/* Quick Follow-up Due filter button */}
          <button
            onClick={() => setFollowUpsDueOnly(!followUpsDueOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              followUpsDueOnly
                ? "bg-rose-600 text-white shadow-xs"
                : "border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Follow-ups Due Today / Overdue</span>
          </button>

          {/* Column Visibility Menu */}
          <div ref={columnMenuRef} className="relative shrink-0">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              title="Toggle Columns"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>Columns</span>
            </button>

            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="font-bold text-slate-700 px-2 py-1 border-b border-slate-100 text-[11px]">
                  Show / Hide Columns
                </div>
                {Object.entries({
                  logo: "Company Logo",
                  website: "Website",
                  companySize: "Company Size",
                  decisionMakerTitle: "Job Title",
                  contactPhone: "Phone",
                  lastContacted: "Last Contacted",
                  notes: "Notes",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(visibleColumns as any)[key]}
                      onChange={(e) =>
                        setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })
                      }
                      className="rounded text-[#0033BF]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Contacted / Awaiting Response">Contacted / Awaiting Response</option>
            {PROSPECT_STATUSES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Industries</option>
            <option value="FMCG">FMCG & Consumer Goods</option>
            <option value="Beverages">Beverages & Soft Drinks</option>
            <option value="Retail">Retail & Durable Goods</option>
            <option value="Manufacturing">Manufacturing & Distribution</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Countries</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Kenya">Kenya</option>
          </select>

          <select
            value={sfaFilter}
            onChange={(e) => setSfaFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All SFA Software</option>
            <option value="Bizom">Bizom</option>
            <option value="FieldAssist">FieldAssist</option>
            <option value="Repsly">Repsly</option>
            <option value="In-House">Legacy / In-House SFA</option>
          </select>

          {(search ||
            statusFilter !== "ALL" ||
            industryFilter !== "ALL" ||
            countryFilter !== "ALL" ||
            sfaFilter !== "ALL" ||
            sizeFilter !== "ALL" ||
            followUpsDueOnly) && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline px-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Prospects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                {visibleColumns.logo && (
                  <th className="py-3 px-3 text-center sticky left-0 z-30 bg-slate-50 border-r border-slate-200/80 w-[64px] min-w-[64px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    Logo
                  </th>
                )}
                {visibleColumns.companyName && <th className="py-3 px-3.5">Company Name</th>}
                {visibleColumns.industry && <th className="py-3 px-3">Industry</th>}
                {visibleColumns.country && <th className="py-3 px-3">Country</th>}
                {visibleColumns.website && <th className="py-3 px-3">Website</th>}
                {visibleColumns.companySize && <th className="py-3 px-3">Size / Scale</th>}
                {visibleColumns.currentSfa && <th className="py-3 px-3.5">Current SFA</th>}
                {visibleColumns.decisionMakerName && <th className="py-3 px-3.5">Decision-Maker</th>}
                {visibleColumns.decisionMakerTitle && <th className="py-3 px-3">Job Title</th>}
                {visibleColumns.contactEmail && <th className="py-3 px-3">Email</th>}
                {visibleColumns.contactPhone && <th className="py-3 px-3">Phone</th>}
                {visibleColumns.prospectStatus && <th className="py-3 px-3.5">Prospect Status</th>}
                {visibleColumns.lastContacted && <th className="py-3 px-3">Last Contacted</th>}
                {visibleColumns.nextFollowUp && <th className="py-3 px-3.5">Next Follow-up</th>}
                {visibleColumns.notes && <th className="py-3 px-3.5 min-w-[200px]">Notes</th>}
                {visibleColumns.actions && (
                  <th className="py-3 px-3.5 text-right sticky right-0 bg-slate-50 z-30 border-l border-slate-200/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prospects.map((p) => {
                const primaryContact = p.contacts?.find((c: any) => c.isPrimary) || p.contacts?.[0];

                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                const followUpDate = p.nextFollowUpDate ? new Date(p.nextFollowUpDate) : null;
                const isOverdue = followUpDate && followUpDate < startOfToday && !["Won", "Lost", "Do Not Contact"].includes(p.prospectStatus);
                const isDueToday = followUpDate && followUpDate >= startOfToday && followUpDate <= endOfToday;

                const currentStatusObj =
                  PROSPECT_STATUSES.find((s) => s.id === p.prospectStatus) || PROSPECT_STATUSES[0];

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* 0. Company Logo (Sticky on horizontal scroll) */}
                    {visibleColumns.logo && (
                      <td className="py-2 px-2.5 text-center sticky left-0 z-20 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-200/80 w-[64px] min-w-[64px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                        <ProspectLogoCell prospect={p} onClick={() => setSelectedProspect(p)} />
                      </td>
                    )}

                    {/* 1. Company Name */}
                    {visibleColumns.companyName && (
                      <td className="py-2.5 px-3.5">
                        <button
                          onClick={() => setSelectedProspect(p)}
                          className="font-bold text-slate-900 hover:text-[#0033BF] hover:underline text-left text-xs flex items-center gap-1.5"
                        >
                          <span>{p.name}</span>
                          {p.slraMember && (
                            <span className="text-[9px] bg-blue-50 text-[#0033BF] font-bold px-1 rounded border border-blue-200">
                              SLRA
                            </span>
                          )}
                        </button>
                      </td>
                    )}

                    {/* 2. Industry */}
                    {visibleColumns.industry && (
                      <td className="py-2.5 px-3 text-slate-700">{p.industry}</td>
                    )}

                    {/* 3. Country */}
                    {visibleColumns.country && (
                      <td className="py-2.5 px-3 text-slate-600">{p.country}</td>
                    )}

                    {/* 4. Website */}
                    {visibleColumns.website && (
                      <td className="py-2.5 px-3">
                        {p.website ? (
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0033BF] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Globe className="h-3 w-3" />
                            Visit
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {/* 5. Company Size */}
                    {visibleColumns.companySize && (
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {p.employeeRange || p.sizeCategory || p.fieldSalesRepsCount ? (
                          <span>{p.employeeRange || `${p.fieldSalesRepsCount} Reps`}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {/* 6. Current SFA */}
                    {visibleColumns.currentSfa && (
                      <td className="py-2.5 px-3.5">
                        {p.currentSfaProvider ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">
                              {p.currentSfaProvider}
                            </span>
                            {p.currentSfaStatus && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  p.currentSfaStatus === "Confirmed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {p.currentSfaStatus}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {/* 7. Decision-Maker Name */}
                    {visibleColumns.decisionMakerName && (
                      <td className="py-2.5 px-3.5">
                        {primaryContact ? (
                          <span className="font-semibold text-slate-900">
                            {primaryContact.fullName}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">None logged</span>
                        )}
                      </td>
                    )}

                    {/* 8. Decision-Maker Job Title */}
                    {visibleColumns.decisionMakerTitle && (
                      <td className="py-2.5 px-3 text-slate-600">
                        {primaryContact?.jobTitle || "-"}
                      </td>
                    )}

                    {/* 9. Contact Email */}
                    {visibleColumns.contactEmail && (
                      <td className="py-2.5 px-3">
                        {primaryContact?.businessEmail ? (
                          <a
                            href={`mailto:${primaryContact.businessEmail}`}
                            className="text-[#0033BF] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Mail className="h-3 w-3 text-slate-400" />
                            {primaryContact.businessEmail}
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {/* 10. Contact Phone */}
                    {visibleColumns.contactPhone && (
                      <td className="py-2.5 px-3 text-slate-600">
                        {primaryContact?.businessPhone ? (
                          <a href={`tel:${primaryContact.businessPhone}`} className="hover:underline">
                            {primaryContact.businessPhone}
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {/* 11. Prospect Status (Inline Dropdown) */}
                    {visibleColumns.prospectStatus && (
                      <td className="py-2.5 px-3.5">
                        <select
                          value={p.prospectStatus || "New"}
                          onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                            currentStatusObj.color
                          }`}
                        >
                          {PROSPECT_STATUSES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}

                    {/* 12. Last Contacted */}
                    {visibleColumns.lastContacted && (
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {p.lastContactedAt ? (
                          new Date(p.lastContactedAt).toLocaleDateString()
                        ) : (
                          <span className="text-slate-300">Never</span>
                        )}
                      </td>
                    )}

                    {/* 13. Next Follow-up (Overdue & Due Today highlighting) */}
                    {visibleColumns.nextFollowUp && (
                      <td className="py-2.5 px-3.5">
                        {followUpDate ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isOverdue
                                  ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
                                  : isDueToday
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {followUpDate.toLocaleDateString()}
                              {isOverdue ? " (Overdue)" : isDueToday ? " (Today)" : ""}
                            </span>
                            {!p.isCompleted && (
                              <button
                                onClick={() => handleCompleteFollowUp(p.id)}
                                className="text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Mark follow-up done"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {/* 14. Notes */}
                    {visibleColumns.notes && (
                      <td className="py-2.5 px-3.5 max-w-[280px] truncate text-slate-600 text-[11px]">
                        {addingNoteId === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Type interaction note..."
                              value={newInteractionNote}
                              onChange={(e) => setNewInteractionNote(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveNote(p.id);
                                if (e.key === "Escape") setAddingNoteId(null);
                              }}
                              className="w-48 px-2 py-0.5 rounded border border-blue-400 text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveNote(p.id)}
                              className="px-2 py-0.5 rounded bg-[#0033BF] text-white text-[10px] font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setAddingNoteId(null)}
                              className="text-slate-400 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group/note">
                            <span className="truncate">{p.notes || "-"}</span>
                            <button
                              onClick={() => {
                                setAddingNoteId(p.id);
                                setNewInteractionNote("");
                              }}
                              className="opacity-0 group-hover/note:opacity-100 p-1 text-slate-400 hover:text-[#0033BF] transition-opacity shrink-0 ml-1"
                              title="Add dated note"
                            >
                              <MessageSquarePlus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}

                    {/* 15. Actions */}
                    {visibleColumns.actions && (
                      <td className="py-2.5 px-3.5 text-right sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-l border-slate-200/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedProspect(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0033BF] hover:bg-slate-100 transition-colors"
                            title="View Prospect Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProspect(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Edit Prospect"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {permissions.canDeleteCompanies && (
                            <button
                              onClick={() => handleDeleteProspect(p.id, p.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Prospect"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {prospects.length === 0 && !loading && (
            <div className="py-16 text-center text-slate-400 text-xs">
              No matching prospects found. Click "Add Prospect" or adjust search filters.
            </div>
          )}
        </div>
      </div>

      {/* DETAIL SLIDE-OVER DRAWER (Section 8) */}
      {selectedProspect && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <ProspectLogoCell prospect={selectedProspect} size="lg" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedProspect.name}</h3>
                  <div className="text-xs text-slate-500">
                    {selectedProspect.industry} • {selectedProspect.country}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProspect(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Status & Follow-up Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Current Status:</span>
                  <select
                    value={selectedProspect.prospectStatus || "New"}
                    onChange={(e) => handleStatusChange(selectedProspect.id, e.target.value)}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  >
                    {PROSPECT_STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Next Follow-up:</span>
                  <span className="font-bold text-slate-800">
                    {selectedProspect.nextFollowUpDate
                      ? new Date(selectedProspect.nextFollowUpDate).toLocaleDateString()
                      : "None scheduled"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Last Contacted:</span>
                  <span className="text-slate-700">
                    {selectedProspect.lastContactedAt
                      ? new Date(selectedProspect.lastContactedAt).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>

              {/* SFA Software Details */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Current Software & Evidence
                </h4>
                <div className="p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current SFA:</span>
                    <span className="font-bold text-slate-900">
                      {selectedProspect.currentSfaProvider || "None documented"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verification Status:</span>
                    <span>{selectedProspect.currentSfaStatus || "Confirmed"}</span>
                  </div>
                  {selectedProspect.sfaSourceUrl && (
                    <div className="pt-1">
                      <a
                        href={selectedProspect.sfaSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0033BF] hover:underline flex items-center gap-1 font-semibold"
                      >
                        Evidence Source Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Decision-Makers */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Decision-Makers & Leaders ({selectedProspect.contacts?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedProspect.contacts?.map((ct: any) => (
                    <div key={ct.id} className="p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ct.fullName}</span>
                        {ct.isPrimary && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#0033BF]">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500">{ct.jobTitle}</div>
                      {ct.businessEmail && (
                        <div>
                          <a href={`mailto:${ct.businessEmail}`} className="text-[#0033BF] hover:underline">
                            {ct.businessEmail}
                          </a>
                        </div>
                      )}
                      {ct.businessPhone && <div>{ct.businessPhone}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Notes
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 whitespace-pre-wrap">
                  {selectedProspect.notes || "No notes documented yet."}
                </div>
              </div>

              {/* Interaction History & Add Note */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs">
                  Interaction History
                </h4>

                {/* Add Dated Note Input */}
                <div className="space-y-1.5">
                  <textarea
                    rows={2}
                    placeholder="Add dated conversation note (e.g. Spoke to Mahesh, agreed to discovery next Tuesday)..."
                    value={newInteractionNote}
                    onChange={(e) => setNewInteractionNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveNote(selectedProspect.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#0033BF] text-white font-semibold text-xs hover:bg-[#2768FF] transition-colors"
                  >
                    Add Dated Note
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                  {selectedProspect.timelineEvents?.map((ev: any) => (
                    <div key={ev.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700">{ev.actorName}</span>
                        <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-800">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => {
                  setEditingProspect(selectedProspect);
                  setIsModalOpen(true);
                }}
                className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold hover:bg-slate-100 transition-colors text-xs text-slate-700"
              >
                Edit Prospect
              </button>
              <button
                onClick={() => setSelectedProspect(null)}
                className="px-4 py-1.5 rounded-xl bg-[#0033BF] text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Prospect Modal */}
      <ProspectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProspects}
        initialData={editingProspect}
      />
    </AppShell>
  );
}

export default function ProspectsMainPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <RefreshCw className="h-4 w-4 animate-spin text-[#0033BF]" />
              Loading prospects...
            </div>
          </div>
        </AppShell>
      }
    >
      <ProspectsContent />
    </Suspense>
  );
}
