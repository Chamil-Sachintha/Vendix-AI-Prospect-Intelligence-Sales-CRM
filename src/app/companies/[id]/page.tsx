"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  ChevronLeft,
  Globe,
  MapPin,
  Calendar,
  Users,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Clock,
  TrendingUp,
  Mail,
  Phone,
  FileText,
  DollarSign,
  AlertTriangle,
  History,
  Check,
} from "lucide-react";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const companyId = resolvedParams.id;

  const { currentUser, permissions, openQuickAddModal } = useApp();

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "software" | "contacts" | "signals" | "opportunities" | "outreach" | "timeline"
  >("software");

  // Inline modal states
  const [showAddSoftware, setShowAddSoftware] = useState(false);
  const [newSoftware, setNewSoftware] = useState({
    category: "SFA",
    productName: "",
    vendorName: "",
    deploymentType: "CLOUD",
    status: "CURRENTLY_USING",
    implementationYear: "",
    renewalDate: "",
    knownLimitations: "",
    evidenceUrl: "",
    evidenceDescription: "",
    confidence: "CONFIRMED",
  });

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    fullName: "",
    jobTitle: "",
    department: "Sales",
    roleInPurchasing: "DECISION_MAKER",
    businessEmail: "",
    businessPhone: "",
    linkedinUrl: "",
    preferredChannel: "EMAIL",
    isPrimary: false,
    isVerified: true,
  });

  const fetchCompany = () => {
    setLoading(true);
    fetch(`/api/companies/${companyId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Company not found");
        return res.json();
      })
      .then((data) => setCompany(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const handleDeleteCompany = async () => {
    if (!permissions.canDeleteCompanies) {
      alert("You do not have permission to delete companies.");
      return;
    }
    if (confirm(`Are you sure you want to delete ${company.name}? This action cannot be undone.`)) {
      try {
        const res = await fetch(`/api/companies/${companyId}`, { method: "DELETE" });
        if (res.ok) {
          router.push("/companies");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/software", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSoftware,
          companyId,
          actorName: currentUser.name,
        }),
      });
      if (res.ok) {
        setShowAddSoftware(false);
        fetchCompany();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSoftware = async (softwareId: string) => {
    if (confirm("Delete this software stack record?")) {
      await fetch(`/api/software/${softwareId}`, { method: "DELETE" });
      fetchCompany();
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newContact,
          companyId,
          actorName: currentUser.name,
        }),
      });
      if (res.ok) {
        setShowAddContact(false);
        fetchCompany();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleContactVerified = async (contactId: string, currentVal: boolean) => {
    await fetch(`/api/contacts/${contactId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !currentVal }),
    });
    fetchCompany();
  };

  const handleUpdateQualificationStatus = async (newStatus: string) => {
    await fetch(`/api/companies/${companyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qualificationStatus: newStatus, actorName: currentUser.name }),
    });
    fetchCompany();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-slate-500 text-sm">
          Loading company profile...
        </div>
      </AppShell>
    );
  }

  if (error || !company) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Company Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">{error || "Record does not exist."}</p>
          <Link
            href="/companies"
            className="px-4 py-2 rounded-xl bg-[#0033BF] text-white text-xs font-semibold"
          >
            Back to Companies
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0033BF] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Companies Database
        </Link>
      </div>

      {/* Main Profile Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {company.name}
              </h1>
              {company.tradingName && (
                <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  "{company.tradingName}"
                </span>
              )}
              {company.slraMember && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0033BF] border border-blue-200">
                  SLRA Member
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{company.industry}</span>
              {company.subIndustry && <span>• {company.subIndustry}</span>}
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {company.city ? `${company.city}, ` : ""}
                {company.country}
              </span>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#0033BF] hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {company.linkedinUrl && (
                <a
                  href={company.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#0033BF] hover:underline"
                >
                  <LinkedInIcon className="h-3.5 w-3.5 text-blue-600" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Right Badges & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Intent Badge */}
            <div className="text-right px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Buying Intent Score
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <Flame
                  className={`h-4 w-4 ${
                    company.intentLevel === "HIGH"
                      ? "text-emerald-500"
                      : company.intentLevel === "MEDIUM"
                      ? "text-amber-500"
                      : "text-slate-400"
                  }`}
                />
                <span className="text-xl font-bold text-slate-900">{company.intentScore}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    company.intentLevel === "HIGH"
                      ? "bg-emerald-100 text-emerald-800"
                      : company.intentLevel === "MEDIUM"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {company.intentLevel}
                </span>
              </div>
            </div>

            {/* Qualification Status Dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Qualification Status
              </label>
              <select
                value={company.qualificationStatus}
                onChange={(e) => handleUpdateQualificationStatus(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0033BF]"
              >
                <option value="UNQUALIFIED">Unqualified</option>
                <option value="RESEARCHING">Researching</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="NURTURING">Nurturing</option>
                <option value="DISQUALIFIED">Disqualified</option>
              </select>
            </div>

            {/* Destructive Delete Button */}
            {permissions.canDeleteCompanies && (
              <button
                onClick={handleDeleteCompany}
                className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Company Record"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Section A, B, C Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
          {/* SECTION A: IDENTITY */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#0033BF]" />
              A. Company Identity
            </h3>
            <div className="space-y-2 text-slate-600">
              <div>
                <span className="text-slate-400">Reg No: </span>
                <span className="font-medium text-slate-800">{company.registrationNo || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400">Parent / Subsidiary: </span>
                <span className="font-medium text-slate-800">
                  {company.parentCompany || "Independent"}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Headquarters Address: </span>
                <span className="font-medium text-slate-800">{company.hqAddress || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400">Established: </span>
                <span className="font-medium text-slate-800">{company.yearEstablished || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400">Account Owner: </span>
                <span className="font-bold text-slate-800">
                  {company.assignedOwner?.name || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Source: </span>
                <span className="font-medium text-slate-800">{company.source}</span>
              </div>
            </div>
          </div>

          {/* SECTION B: SIZE & OPERATIONS */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              B. Size & Distribution Scale
            </h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Field Sales Reps:</span>
                <span className="font-bold text-slate-900">
                  {company.fieldSalesRepsCount || "Not documented"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Distributors / Fleets:</span>
                <span className="font-semibold text-slate-800">
                  {company.distributorsCount || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Employee Range:</span>
                <span className="font-semibold text-slate-800">
                  {company.employeeRange || company.employeeCount || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Distribution Model:</span>
                <span className="font-semibold text-slate-800">
                  {company.distributionModel || "Standard"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Countries Served:</span>
                <span className="font-semibold text-slate-800">
                  {company.countriesServed || 1}
                </span>
              </div>
              {company.isEstimated && (
                <div className="pt-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                  Note: Scale values marked as estimated. Source: {company.estimatesSource || "Research"}.
                </div>
              )}
            </div>
          </div>

          {/* SECTION C: SALES OPERATION PROFILE (VENDIX SFA FIT) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              C. Sales Operation & SFA Fit
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div>
                <span className="text-slate-400">Field Team: </span>
                <span className="font-bold text-slate-800">{company.hasFieldSalesTeam}</span>
              </div>
              <div>
                <span className="text-slate-400">Van / Pre-Sales: </span>
                <span className="font-bold text-slate-800">{company.vanSalesOrPreSales}</span>
              </div>
              <div>
                <span className="text-slate-400">Distributors: </span>
                <span className="font-bold text-slate-800">{company.sellsThroughDistributors}</span>
              </div>
              <div>
                <span className="text-slate-400">Order Taking: </span>
                <span className="font-bold text-slate-800">{company.orderTakingInField}</span>
              </div>
              <div>
                <span className="text-slate-400">Cash Collections: </span>
                <span className="font-bold text-slate-800">{company.managesCollectionsCash}</span>
              </div>
              <div>
                <span className="text-slate-400">Offline Mobile: </span>
                <span className="font-bold text-slate-800">{company.requiresOfflineMobile}</span>
              </div>
            </div>
            {company.operationalChallenges && (
              <div className="mt-2.5 pt-2 border-t border-slate-200 text-slate-700 text-[11px]">
                <span className="font-semibold text-rose-700">Pain Point: </span>
                {company.operationalChallenges}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto text-xs">
        {[
          { id: "software", label: `Software & Competitors (${company.softwareRecords?.length || 0})` },
          { id: "contacts", label: `Contacts & Decision Makers (${company.contacts?.length || 0})` },
          { id: "signals", label: `Buying Intent Signals (${company.intentSignals?.length || 0})` },
          { id: "opportunities", label: `Sales Opportunities (${company.opportunities?.length || 0})` },
          { id: "outreach", label: `Outreach & Activities (${company.outreachActivities?.length || 0})` },
          { id: "timeline", label: `Audit Timeline (${company.timelineEvents?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-[#0033BF] text-[#0033BF]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SOFTWARE & COMPETITOR STACK */}
      {activeTab === "software" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Current Software Stack & Evidence</h2>
            <button
              onClick={() => setShowAddSoftware(!showAddSoftware)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0033BF] text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Software Record
            </button>
          </div>

          {/* Add Software Form Drawer/Card */}
          {showAddSoftware && (
            <form
              onSubmit={handleCreateSoftware}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-100"
            >
              <div className="font-bold text-xs text-slate-900 uppercase">
                Add Discovered Software / Competitor System
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    value={newSoftware.category}
                    onChange={(e) => setNewSoftware({ ...newSoftware, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="SFA">SFA (Sales Force Automation)</option>
                    <option value="CRM">CRM</option>
                    <option value="ERP">ERP</option>
                    <option value="DMS">DMS (Distributor Management)</option>
                    <option value="POS">POS</option>
                    <option value="BI">BI / Analytics</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newSoftware.productName}
                    onChange={(e) => setNewSoftware({ ...newSoftware, productName: e.target.value })}
                    placeholder="e.g. Bizom, SAP, Custom SFA"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={newSoftware.vendorName}
                    onChange={(e) => setNewSoftware({ ...newSoftware, vendorName: e.target.value })}
                    placeholder="e.g. Mobisy Technologies"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Status</label>
                  <select
                    value={newSoftware.status}
                    onChange={(e) => setNewSoftware({ ...newSoftware, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="CURRENTLY_USING">Currently Using</option>
                    <option value="EVALUATING">Evaluating</option>
                    <option value="PREVIOUSLY_USED">Previously Used</option>
                    <option value="REPLACING">Replacing (Hot Opportunity)</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Confidence</label>
                  <select
                    value={newSoftware.confidence}
                    onChange={(e) => setNewSoftware({ ...newSoftware, confidence: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="CONFIRMED">Confirmed Fact</option>
                    <option value="STRONG_EVIDENCE">Strong Evidence</option>
                    <option value="UNVERIFIED">Unverified</option>
                    <option value="SPECULATIVE">Speculative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Evidence Source URL</label>
                  <input
                    type="url"
                    value={newSoftware.evidenceUrl}
                    onChange={(e) => setNewSoftware({ ...newSoftware, evidenceUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Known Limitations / Pain Points
                </label>
                <input
                  type="text"
                  value={newSoftware.knownLimitations}
                  onChange={(e) => setNewSoftware({ ...newSoftware, knownLimitations: e.target.value })}
                  placeholder="e.g. Fails to print invoices offline in remote routes..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSoftware(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0033BF] text-white text-xs font-semibold"
                >
                  Save Software Record
                </button>
              </div>
            </form>
          )}

          {/* Software records grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.softwareRecords?.map((sw: any) => (
              <div
                key={sw.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#0033BF]">
                          {sw.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{sw.productName}</h4>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Vendor: <span className="font-semibold text-slate-700">{sw.vendorName}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        sw.status === "REPLACING"
                          ? "bg-rose-100 text-rose-800"
                          : sw.status === "CURRENTLY_USING"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {sw.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 my-3 text-slate-600">
                    <div>
                      <span className="text-slate-400">Deployment: </span>
                      <span className="font-medium">{sw.deploymentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Evidence Confidence: </span>
                      <span className="font-semibold text-slate-800">{sw.confidence}</span>
                    </div>
                    {sw.knownLimitations && (
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-900 text-[11px] border border-amber-200">
                        <span className="font-semibold">Pain Point: </span>
                        {sw.knownLimitations}
                      </div>
                    )}
                    {sw.evidenceUrl && (
                      <div>
                        <a
                          href={sw.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0033BF] hover:underline flex items-center gap-1 text-[11px]"
                        >
                          View Evidence Source <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Verified:{" "}
                    {sw.lastVerifiedAt
                      ? new Date(sw.lastVerifiedAt).toLocaleDateString()
                      : "Unverified"}
                  </span>
                  <button
                    onClick={() => handleDeleteSoftware(sw.id)}
                    className="text-slate-400 hover:text-rose-600"
                    title="Delete record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONTACTS & DECISION MAKERS */}
      {activeTab === "contacts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Company Leaders & Purchasing Committee
            </h2>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0033BF] text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Contact
            </button>
          </div>

          {/* Add contact form */}
          {showAddContact && (
            <form
              onSubmit={handleCreateContact}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs"
            >
              <div className="font-bold text-slate-900 uppercase">Add Decision-Maker / Contact</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newContact.fullName}
                    onChange={(e) => setNewContact({ ...newContact, fullName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={newContact.jobTitle}
                    onChange={(e) => setNewContact({ ...newContact, jobTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Purchasing Role</label>
                  <select
                    value={newContact.roleInPurchasing}
                    onChange={(e) => setNewContact({ ...newContact, roleInPurchasing: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="DECISION_MAKER">Decision-Maker</option>
                    <option value="INFLUENCER">Influencer</option>
                    <option value="TECHNICAL_EVALUATOR">Technical Evaluator</option>
                    <option value="USER">User</option>
                    <option value="PROCUREMENT">Procurement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Business Email</label>
                  <input
                    type="email"
                    value={newContact.businessEmail}
                    onChange={(e) => setNewContact({ ...newContact, businessEmail: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Business Phone</label>
                  <input
                    type="tel"
                    value={newContact.businessPhone}
                    onChange={(e) => setNewContact({ ...newContact, businessPhone: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={newContact.linkedinUrl}
                    onChange={(e) => setNewContact({ ...newContact, linkedinUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0033BF] text-white font-semibold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {/* Contacts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.contacts?.map((ct: any) => (
              <div
                key={ct.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{ct.fullName}</h4>
                        {ct.isPrimary && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0033BF]">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-600">{ct.jobTitle}</div>
                    </div>

                    <button
                      onClick={() => handleToggleContactVerified(ct.id, ct.isVerified)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        ct.isVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {ct.isVerified ? (
                        <>
                          <Check className="h-3 w-3" /> Verified
                        </>
                      ) : (
                        "Unverified"
                      )}
                    </button>
                  </div>

                  <div className="text-xs space-y-1.5 my-3 text-slate-600">
                    <div>
                      <span className="text-slate-400">Purchasing Role: </span>
                      <span className="font-semibold text-slate-800">
                        {ct.roleInPurchasing.replace("_", " ")}
                      </span>
                    </div>
                    {ct.businessEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <a href={`mailto:${ct.businessEmail}`} className="hover:underline text-[#0033BF]">
                          {ct.businessEmail}
                        </a>
                      </div>
                    )}
                    {ct.businessPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <a href={`tel:${ct.businessPhone}`} className="hover:underline">
                          {ct.businessPhone}
                        </a>
                      </div>
                    )}
                    {ct.linkedinUrl && (
                      <div className="flex items-center gap-1.5">
                        <LinkedInIcon className="h-3.5 w-3.5 text-blue-600" />
                        <a
                          href={ct.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-[#0033BF]"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Preferred: {ct.preferredChannel || "Email"}
                  </span>
                  <button
                    onClick={() => openQuickAddModal("outreach")}
                    className="text-xs font-semibold text-[#0033BF] hover:underline"
                  >
                    Log Outreach →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BUYING INTENT SIGNALS */}
      {activeTab === "signals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Buying Intent Evidence & Scoring</h2>
              <p className="text-xs text-slate-500">
                Calculated dynamically from verified signals and operational replacement triggers
              </p>
            </div>
            <button
              onClick={() => openQuickAddModal("signal")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0033BF] text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Intent Signal
            </button>
          </div>

          <div className="space-y-3">
            {company.intentSignals?.map((sig: any) => (
              <div
                key={sig.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {sig.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0033BF]">
                      +{sig.scoreContribution} pts
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {sig.confidence}
                    </span>
                  </div>
                  <p className="text-slate-700">{sig.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                    <span>Source: {sig.sourceType || "Observation"}</span>
                    <span>• Observed: {new Date(sig.dateObserved).toLocaleDateString()}</span>
                    {sig.sourceUrl && (
                      <a
                        href={sig.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0033BF] hover:underline flex items-center gap-0.5"
                      >
                        Evidence Link <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {sig.followUpRecommendation && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 max-w-xs">
                    <span className="font-bold text-[#0033BF]">Recommendation: </span>
                    {sig.followUpRecommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OPPORTUNITIES & DEALS */}
      {activeTab === "opportunities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Active Sales Opportunities</h2>
            <button
              onClick={() => openQuickAddModal("opportunity")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0033BF] text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Opportunity
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.opportunities?.map((opp: any) => (
              <div
                key={opp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{opp.name}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Product: {opp.productInterest}
                      </div>
                    </div>
                    <span
                      className="font-bold px-2.5 py-1 rounded-full text-white text-[10px]"
                      style={{ backgroundColor: opp.stage?.color || "#2768FF" }}
                    >
                      {opp.stage?.name}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-3 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Estimated ACV:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {opp.currency} {opp.estimatedAcv.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Win Probability:</span>
                      <span className="font-bold text-slate-800">{opp.probability}%</span>
                    </div>
                    {opp.competitorEvaluated && (
                      <div>
                        <span className="text-slate-400">Competitor Evaluated: </span>
                        <span className="font-semibold text-amber-700">
                          {opp.competitorEvaluated}
                        </span>
                      </div>
                    )}
                    {opp.nextAction && (
                      <div className="p-2 rounded-lg bg-blue-50 text-[#0033BF] text-[11px]">
                        <span className="font-bold">Next Action: </span>
                        {opp.nextAction}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Close Date:{" "}
                    {opp.expectedCloseDate
                      ? new Date(opp.expectedCloseDate).toLocaleDateString()
                      : "Open"}
                  </span>
                  <Link href="/pipeline" className="font-bold text-[#0033BF] hover:underline">
                    View in Pipeline →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: OUTREACH & ACTIVITIES */}
      {activeTab === "outreach" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Outreach Activities & Touches</h2>
            <button
              onClick={() => openQuickAddModal("outreach")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0033BF] text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Outreach Touch
            </button>
          </div>

          <div className="space-y-3">
            {company.outreachActivities?.map((act: any) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{act.channel} Outreach</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act.outreachStatus === "POSITIVE_RESPONSE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-[#0033BF]"
                      }`}
                    >
                      {act.outreachStatus}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-700">{act.messageSummary}</p>

                {act.nextAction && (
                  <div className="mt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Next Action: </span>
                    {act.nextAction}
                    {act.nextFollowUpDate && (
                      <span> (Due: {new Date(act.nextFollowUpDate).toLocaleDateString()})</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TIMELINE */}
      {activeTab === "timeline" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Complete Audit Timeline</h2>
          <div className="space-y-4">
            {company.timelineEvents?.map((ev: any) => (
              <div key={ev.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-3 last:border-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0033BF] mt-1 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-slate-900">{ev.actorName}: </span>
                  <span className="text-slate-700">{ev.description}</span>
                </div>
                <span className="text-slate-400 text-[11px] shrink-0">
                  {new Date(ev.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
