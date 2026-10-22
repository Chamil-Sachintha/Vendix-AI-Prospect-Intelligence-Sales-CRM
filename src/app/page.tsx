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
  Users,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
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

const ROLE_BADGES: Record<string, { label: string; class: string }> = {
  DECISION_MAKER: { label: "Decision-Maker", class: "bg-purple-100 text-purple-800 border-purple-200" },
  INFLUENCER: { label: "Influencer", class: "bg-blue-100 text-blue-800 border-blue-200" },
  TECHNICAL_EVALUATOR: { label: "Technical Evaluator", class: "bg-teal-100 text-teal-800 border-teal-200" },
  EXECUTIVE_SPONSOR: { label: "Executive Sponsor", class: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  PROCUREMENT: { label: "Procurement", class: "bg-amber-100 text-amber-800 border-amber-200" },
  USER: { label: "Champion / User", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

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
    country: false,
    website: true,
    companySize: true,
    currentSfa: true,
    decisionMakers: false,
    prospectStatus: true,
    lastContacted: false,
    nextFollowUp: false,
    notes: false,
    actions: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Drawer Decision-Makers Management State
  const [contactSearch, setContactSearch] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [savingContact, setSavingContact] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    fullName: "",
    jobTitle: "",
    department: "",
    roleInPurchasing: "DECISION_MAKER",
    businessEmail: "",
    businessPhone: "",
    linkedinUrl: "",
    isPrimary: false,
  });

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

  // Contact Handlers for Drawer
  const handleOpenAddContact = () => {
    setEditingContactId(null);
    setContactForm({
      fullName: "",
      jobTitle: "",
      department: "",
      roleInPurchasing: "DECISION_MAKER",
      businessEmail: "",
      businessPhone: "",
      linkedinUrl: "",
      isPrimary: (selectedProspect?.contacts?.length || 0) === 0,
    });
    setIsAddingContact(true);
  };

  const handleOpenEditContact = (ct: any) => {
    setEditingContactId(ct.id);
    setContactForm({
      fullName: ct.fullName || "",
      jobTitle: ct.jobTitle || "",
      department: ct.department || "",
      roleInPurchasing: ct.roleInPurchasing || "DECISION_MAKER",
      businessEmail: ct.businessEmail || "",
      businessPhone: ct.businessPhone || "",
      linkedinUrl: ct.linkedinUrl || "",
      isPrimary: Boolean(ct.isPrimary),
    });
    setIsAddingContact(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProspect || !contactForm.fullName.trim() || !contactForm.jobTitle.trim()) return;

    setSavingContact(true);
    try {
      if (editingContactId) {
        const res = await fetch(`/api/contacts/${editingContactId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactForm),
        });
        if (res.ok) {
          const updatedContact = await res.json();
          setSelectedProspect((prev: any) => {
            const updatedContacts = prev.contacts.map((c: any) => {
              if (c.id === editingContactId) return updatedContact;
              if (contactForm.isPrimary) return { ...c, isPrimary: false };
              return c;
            });
            return { ...prev, contacts: updatedContacts };
          });
          setProspects((prev) =>
            prev.map((p) =>
              p.id === selectedProspect.id
                ? {
                    ...p,
                    contacts: p.contacts.map((c: any) =>
                      c.id === editingContactId
                        ? updatedContact
                        : contactForm.isPrimary
                        ? { ...c, isPrimary: false }
                        : c
                    ),
                  }
                : p
            )
          );
        }
      } else {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId: selectedProspect.id,
            ...contactForm,
          }),
        });
        if (res.ok) {
          const newContact = await res.json();
          setSelectedProspect((prev: any) => {
            const currentContacts = prev.contacts || [];
            const nextContacts = contactForm.isPrimary
              ? [newContact, ...currentContacts.map((c: any) => ({ ...c, isPrimary: false }))]
              : [...currentContacts, newContact];
            return { ...prev, contacts: nextContacts };
          });
          setProspects((prev) =>
            prev.map((p) =>
              p.id === selectedProspect.id
                ? {
                    ...p,
                    contacts: contactForm.isPrimary
                      ? [newContact, ...(p.contacts || []).map((c: any) => ({ ...c, isPrimary: false }))]
                      : [...(p.contacts || []), newContact],
                  }
                : p
            )
          );
        }
      }
      setIsAddingContact(false);
      setEditingContactId(null);
    } catch (err) {
      console.error("Failed to save contact:", err);
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to remove this decision-maker?")) return;
    try {
      const res = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedProspect((prev: any) => ({
          ...prev,
          contacts: (prev.contacts || []).filter((c: any) => c.id !== contactId),
        }));
        setProspects((prev) =>
          prev.map((p) =>
            p.id === selectedProspect?.id
              ? {
                  ...p,
                  contacts: (p.contacts || []).filter((c: any) => c.id !== contactId),
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  const handleSetPrimaryContact = async (contactId: string) => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (res.ok) {
        setSelectedProspect((prev: any) => ({
          ...prev,
          contacts: (prev.contacts || []).map((c: any) => ({
            ...c,
            isPrimary: c.id === contactId,
          })),
        }));
        setProspects((prev) =>
          prev.map((p) =>
            p.id === selectedProspect?.id
              ? {
                  ...p,
                  contacts: (p.contacts || []).map((c: any) => ({
                    ...c,
                    isPrimary: c.id === contactId,
                  })),
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to set primary contact:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
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

      {/* Search & Filter Bar (Single Unified Row) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs mb-4 flex flex-wrap items-center gap-2 text-xs">
        {/* Search bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, industry, country, SFA software, decision-maker, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-xs"
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
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-xs"
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
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-xs"
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
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-xs"
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
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline px-1 shrink-0"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Prospects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                {visibleColumns.logo && (
                  <th className="py-3 px-3 text-center sticky top-0 left-0 z-30 bg-slate-50 border-r border-slate-200/80 w-[64px] min-w-[64px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    Logo
                  </th>
                )}
                {visibleColumns.companyName && <th className="py-3 px-3.5">Company Name</th>}
                {visibleColumns.industry && <th className="py-3 px-3">Industry</th>}
                {visibleColumns.country && <th className="py-3 px-3">Country</th>}
                {visibleColumns.website && <th className="py-3 px-3">Website</th>}
                {visibleColumns.companySize && <th className="py-3 px-3">Size / Scale</th>}
                {visibleColumns.currentSfa && <th className="py-3 px-3.5">Current SFA</th>}
                {visibleColumns.decisionMakers && <th className="py-3 px-3.5">Decision-Makers</th>}
                {visibleColumns.prospectStatus && <th className="py-3 px-3.5">Prospect Status</th>}
                {visibleColumns.lastContacted && <th className="py-3 px-3">Last Contacted</th>}
                {visibleColumns.nextFollowUp && <th className="py-3 px-3.5">Next Follow-up</th>}
                {visibleColumns.notes && <th className="py-3 px-3.5 min-w-[200px]">Notes</th>}
                {visibleColumns.actions && (
                  <th className="py-3 px-3.5 text-right sticky top-0 right-0 bg-slate-50 z-30 border-l border-slate-200/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)]">
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
                      <td className="py-2.5 px-3.5 text-slate-700">
                        {p.currentSfaProvider ? (
                          <span className="font-medium text-slate-800">
                            {p.currentSfaProvider}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {/* 7. Decision-Makers Count / Trigger */}
                    {visibleColumns.decisionMakers && (
                      <td className="py-2.5 px-3.5">
                        <button
                          onClick={() => setSelectedProspect(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-[#0033BF] transition-all text-xs font-semibold text-slate-700 group/pill"
                          title="Click to view and manage all decision-makers"
                        >
                          <Users className="h-3.5 w-3.5 text-slate-400 group-hover/pill:text-[#0033BF]" />
                          <span>
                            {p.contacts?.length
                              ? `${p.contacts.length} Decision-Maker${p.contacts.length > 1 ? "s" : ""}`
                              : "No contacts"}
                          </span>
                        </button>
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
                            title="View Details & Decision-Makers"
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
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Prospect Status:</span>
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
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Next Follow-up:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                        selectedProspect.nextFollowUpDate &&
                        new Date(selectedProspect.nextFollowUpDate) < new Date(new Date().setHours(0, 0, 0, 0)) &&
                        !["Won", "Lost", "Do Not Contact"].includes(selectedProspect.prospectStatus)
                          ? "bg-rose-100 text-rose-700 border border-rose-200 font-bold"
                          : selectedProspect.nextFollowUpDate
                          ? "bg-white border border-slate-200 text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {selectedProspect.nextFollowUpDate
                        ? new Date(selectedProspect.nextFollowUpDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "None scheduled"}
                    </span>
                    {selectedProspect.nextFollowUpDate && (
                      <button
                        onClick={() => handleCompleteFollowUp(selectedProspect.id)}
                        title="Mark follow-up completed"
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Last Contacted:
                  </span>
                  <span className="text-slate-700 font-medium">
                    {selectedProspect.lastContactedAt
                      ? new Date(selectedProspect.lastContactedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Never"}
                  </span>
                </div>
              </div>

              {/* Company Identity & Location */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Location & Scale
                </h4>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      Country:
                    </span>
                    <span className="font-bold text-slate-900">{selectedProspect.country || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Industry:</span>
                    <span className="font-medium text-slate-800">{selectedProspect.industry}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Scale / Employees:</span>
                    <span className="font-medium text-slate-800">
                      {selectedProspect.employeeRange || selectedProspect.sizeCategory || "Not specified"}
                    </span>
                  </div>
                  {selectedProspect.website && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Website:</span>
                      <a
                        href={selectedProspect.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0033BF] hover:underline flex items-center gap-1 font-semibold"
                      >
                        {selectedProspect.website.replace(/^https?:\/\//i, "")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
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

              {/* Decision-Makers & Key Stakeholders */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                      Decision-Makers & Leaders
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0033BF] border border-blue-200">
                      {selectedProspect.contacts?.length || 0}
                    </span>
                  </div>

                  {!isAddingContact && (
                    <button
                      onClick={handleOpenAddContact}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0033BF] hover:bg-[#2768FF] text-white text-[11px] font-semibold shadow-2xs transition-colors"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add Contact
                    </button>
                  )}
                </div>

                {/* Filter / Search contacts when there are more than 2 */}
                {(selectedProspect.contacts?.length || 0) > 2 && !isAddingContact && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter decision-makers by name, title, or email..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="w-full pl-7.5 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:border-[#0033BF] focus:outline-none"
                    />
                  </div>
                )}

                {/* Inline Add / Edit Decision-Maker Form */}
                {isAddingContact && (
                  <form
                    onSubmit={handleSaveContact}
                    className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                      <span className="font-bold text-xs text-[#0033BF] flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5" />
                        {editingContactId ? "Edit Decision-Maker" : "Add New Decision-Maker"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingContact(false);
                          setEditingContactId(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mahesh Jayasinghe"
                          value={contactForm.fullName}
                          onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Job Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Head of Sales Operations"
                          value={contactForm.jobTitle}
                          onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Department
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Commercial / IT"
                          value={contactForm.department}
                          onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Purchasing Role
                        </label>
                        <select
                          value={contactForm.roleInPurchasing}
                          onChange={(e) => setContactForm({ ...contactForm, roleInPurchasing: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                        >
                          <option value="DECISION_MAKER">Decision-Maker (Sign-off)</option>
                          <option value="INFLUENCER">Influencer (Sales/Ops)</option>
                          <option value="TECHNICAL_EVALUATOR">Technical Evaluator (IT/Lead)</option>
                          <option value="EXECUTIVE_SPONSOR">Executive Sponsor (C-Level)</option>
                          <option value="PROCUREMENT">Procurement / Finance</option>
                          <option value="USER">Champion / Field User</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Business Email
                        </label>
                        <input
                          type="email"
                          placeholder="mahesh@example.com"
                          value={contactForm.businessEmail}
                          onChange={(e) => setContactForm({ ...contactForm, businessEmail: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+94 77 123 4567"
                          value={contactForm.businessPhone}
                          onChange={(e) => setContactForm({ ...contactForm, businessPhone: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/..."
                          value={contactForm.linkedinUrl}
                          onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
                          <input
                            type="checkbox"
                            checked={contactForm.isPrimary}
                            onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                            className="rounded text-[#0033BF]"
                          />
                          <span className="font-semibold">Designate as Primary Decision-Maker</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingContact(false);
                          setEditingContactId(null);
                        }}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingContact}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0033BF] hover:bg-[#2768FF] rounded-lg transition-colors shadow-2xs"
                      >
                        {savingContact ? "Saving..." : editingContactId ? "Update Contact" : "Save Contact"}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Decision-Makers */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {(selectedProspect.contacts || [])
                    .filter((ct: any) => {
                      if (!contactSearch.trim()) return true;
                      const q = contactSearch.toLowerCase();
                      return (
                        ct.fullName?.toLowerCase().includes(q) ||
                        ct.jobTitle?.toLowerCase().includes(q) ||
                        ct.department?.toLowerCase().includes(q) ||
                        ct.businessEmail?.toLowerCase().includes(q)
                      );
                    })
                    .map((ct: any) => {
                      const roleConfig = ROLE_BADGES[ct.roleInPurchasing] || {
                        label: ct.roleInPurchasing || "Stakeholder",
                        class: "bg-slate-100 text-slate-700 border-slate-200",
                      };

                      const contactInitials = (ct.fullName || "DM")
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      return (
                        <div
                          key={ct.id}
                          className={`p-3 rounded-xl border transition-all ${
                            ct.isPrimary
                              ? "bg-blue-50/30 border-blue-200 shadow-2xs"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-[#0033BF] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {contactInitials}
                              </div>
                              <div>
                                <div className="flex items-center flex-wrap gap-1.5">
                                  <span className="font-bold text-slate-900 text-xs">{ct.fullName}</span>
                                  {ct.isPrimary && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#0033BF] border border-blue-200">
                                      ★ Primary
                                    </span>
                                  )}
                                  <span
                                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${roleConfig.class}`}
                                  >
                                    {roleConfig.label}
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                                  {ct.jobTitle}
                                  {ct.department && (
                                    <span className="text-slate-400 font-normal"> • {ct.department}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Contact Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEditContact(ct)}
                                title="Edit Decision-Maker"
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(ct.id)}
                                title="Delete Decision-Maker"
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Email, Phone, LinkedIn Links */}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                            {ct.businessEmail && (
                              <div className="flex items-center gap-1 text-slate-600">
                                <a
                                  href={`mailto:${ct.businessEmail}`}
                                  className="text-[#0033BF] hover:underline flex items-center gap-1 font-medium"
                                >
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  {ct.businessEmail}
                                </a>
                                <button
                                  onClick={() => copyToClipboard(ct.businessEmail)}
                                  title="Copy Email"
                                  className="text-slate-400 hover:text-slate-600 ml-0.5"
                                >
                                  {copiedEmail === ct.businessEmail ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            )}

                            {ct.businessPhone && (
                              <a
                                href={`tel:${ct.businessPhone}`}
                                className="text-slate-600 hover:text-[#0033BF] flex items-center gap-1 font-medium"
                              >
                                <Phone className="h-3 w-3 text-slate-400" />
                                {ct.businessPhone}
                              </a>
                            )}

                            {ct.linkedinUrl && (
                              <a
                                href={ct.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#0077B5] hover:underline flex items-center gap-1 font-medium"
                              >
                                <LinkedInIcon className="h-3 w-3 fill-current" />
                                LinkedIn
                              </a>
                            )}

                            {!ct.isPrimary && (
                              <button
                                onClick={() => handleSetPrimaryContact(ct.id)}
                                className="ml-auto text-[10px] font-semibold text-[#0033BF] hover:underline"
                              >
                                Set as primary
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {(!selectedProspect.contacts || selectedProspect.contacts.length === 0) && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                      No decision-makers added yet. Click &ldquo;Add Contact&rdquo; above to log executive contacts.
                    </div>
                  )}
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
