"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  X,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import {
  OUTREACH_CHANNELS,
  OUTREACH_STATUSES,
  RELEVANT_DECISION_MAKER_ROLES,
  CURRENCIES,
} from "@/lib/constants";

export function QuickAddModal() {
  const {
    activeQuickAdd,
    closeQuickAddModal,
    currentUser,
    permissions,
    refreshNotifications,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "company" | "contact" | "outreach" | "task" | "signal" | "opportunity"
  >("company");

  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [stagesList, setStagesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forms state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    tradingName: "",
    industry: "FMCG & Retail",
    country: "Sri Lanka",
    city: "",
    website: "",
    employeeCount: "",
    fieldSalesRepsCount: "",
    distributionModel: "Van Sales",
    slraMember: false,
    operationalChallenges: "",
    qualificationStatus: "RESEARCHING",
  });

  const [contactForm, setContactForm] = useState({
    companyId: "",
    fullName: "",
    jobTitle: "Sales Director",
    department: "Sales",
    roleInPurchasing: "DECISION_MAKER",
    businessEmail: "",
    businessPhone: "",
    linkedinUrl: "",
    preferredChannel: "EMAIL",
    isPrimary: true,
  });

  const [outreachForm, setOutreachForm] = useState({
    companyId: "",
    contactId: "",
    channel: "EMAIL",
    campaign: "Q4 FMCG Outreach",
    messageSummary: "",
    outcome: "",
    responseReceived: false,
    outreachStatus: "CONTACTED",
    nextAction: "",
    nextFollowUpDate: "",
    createFollowUpTask: true,
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    type: "TASK",
    dueDate: "",
    priority: "MEDIUM",
    companyId: "",
    notes: "",
  });

  const [signalForm, setSignalForm] = useState({
    companyId: "",
    category: "SFA_REPLACEMENT_UPGRADE",
    description: "",
    sourceUrl: "",
    sourceType: "Direct Observation",
    relevance: "High",
    strength: "HIGH",
    confidence: "CONFIRMED",
    recencyMonths: 1,
    followUpRecommendation: "",
  });

  const [oppForm, setOppForm] = useState({
    name: "",
    companyId: "",
    stageId: "",
    estimatedAcv: "",
    currency: "LKR",
    potentialUsers: "",
    probability: 20,
    painPoints: "",
    nextAction: "",
  });

  useEffect(() => {
    if (activeQuickAdd) {
      setActiveTab(activeQuickAdd);
      setErrorMsg("");
      setSuccessMsg("");

      setTaskForm((f) => ({
        ...f,
        dueDate: f.dueDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10),
      }));

      // Fetch companies for select dropdowns
      fetch("/api/companies?limit=100")
        .then((res) => res.json())
        .then((data) => {
          if (data.companies) {
            setCompaniesList(data.companies);
            if (data.companies[0]) {
              setContactForm((f) => ({ ...f, companyId: data.companies[0].id }));
              setOutreachForm((f) => ({ ...f, companyId: data.companies[0].id }));
              setTaskForm((f) => ({ ...f, companyId: data.companies[0].id }));
              setSignalForm((f) => ({ ...f, companyId: data.companies[0].id }));
              setOppForm((f) => ({ ...f, companyId: data.companies[0].id }));
            }
          }
        });

      // Fetch stages
      fetch("/api/pipeline")
        .then((res) => res.json())
        .then((stages) => {
          if (Array.isArray(stages)) {
            setStagesList(stages);
            if (stages[0]) {
              setOppForm((f) => ({ ...f, stageId: stages[0].id }));
            }
          }
        });
    }
  }, [activeQuickAdd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuickAddModal();
    };
    if (activeQuickAdd) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeQuickAdd, closeQuickAddModal]);

  if (!activeQuickAdd) return null;

  // Submit handlers
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canEditCompanies) {
      setErrorMsg("You do not have permission to create companies.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyForm,
          actorName: currentUser.name,
          assignedOwnerId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create company");

      setSuccessMsg(`Company "${data.name}" successfully created!`);
      setTimeout(() => {
        closeQuickAddModal();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactForm,
          actorName: currentUser.name,
          assignedOwnerId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create contact");

      setSuccessMsg(`Contact "${data.fullName}" added successfully!`);
      setTimeout(() => {
        closeQuickAddModal();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "outreach",
          ...outreachForm,
          ownerId: currentUser.id,
          actorName: currentUser.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log outreach");

      refreshNotifications();
      setSuccessMsg("Outreach attempt logged successfully!");
      setTimeout(() => {
        closeQuickAddModal();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "task",
          ...taskForm,
          assignedOwnerId: currentUser.id,
          actorName: currentUser.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add task");

      refreshNotifications();
      setSuccessMsg("Follow-up task scheduled successfully!");
      setTimeout(() => {
        closeQuickAddModal();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...signalForm,
          actorName: currentUser.name,
          assignedReviewerId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log signal");

      setSuccessMsg(`Intent signal logged! New company score: ${data.newScore} (${data.newLevel}).`);
      setTimeout(() => {
        closeQuickAddModal();
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...oppForm,
          ownerId: currentUser.id,
          actorName: currentUser.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create opportunity");

      setSuccessMsg(`Opportunity "${data.name}" created!`);
      setTimeout(() => {
        closeQuickAddModal();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeQuickAddModal();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Quick Add Action</h2>
          </div>
          <button
            onClick={closeQuickAddModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-slate-100 overflow-x-auto">
          {[
            { id: "company", label: "Company", icon: Building2 },
            { id: "contact", label: "Contact", icon: Users },
            { id: "outreach", label: "Log Outreach", icon: CheckCircle2 },
            { id: "task", label: "Follow-up", icon: Clock },
            { id: "signal", label: "Intent Signal", icon: TrendingUp },
            { id: "opportunity", label: "Opportunity", icon: TrendingUp },
          ].map((t) => {
            const Icon = t.icon;
            const isCurrent = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id as any);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCurrent
                    ? "bg-[#0033BF] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body content per active tab */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: COMPANY */}
          {activeTab === "company" && (
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="e.g. Ceylon Agro Distributors"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trading Name / Brand
                  </label>
                  <input
                    type="text"
                    value={companyForm.tradingName}
                    onChange={(e) => setCompanyForm({ ...companyForm, tradingName: e.target.value })}
                    placeholder="e.g. AgroFarm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry
                  </label>
                  <select
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="FMCG & Retail">FMCG & Retail</option>
                    <option value="Beverages & Food">Beverages & Food</option>
                    <option value="Pharmaceutical & Healthcare">Pharmaceutical & Healthcare</option>
                    <option value="Manufacturing & Distribution">Manufacturing & Distribution</option>
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Building Materials & Hardware">Building Materials & Hardware</option>
                    <option value="Apparel & Footwear">Apparel & Footwear</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country
                  </label>
                  <select
                    value={companyForm.country}
                    onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / HQ
                  </label>
                  <input
                    type="text"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    placeholder="e.g. Colombo, Kandy, Dubai"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Field Sales Rep Count
                  </label>
                  <input
                    type="number"
                    value={companyForm.fieldSalesRepsCount}
                    onChange={(e) => setCompanyForm({ ...companyForm, fieldSalesRepsCount: e.target.value })}
                    placeholder="e.g. 85"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Distribution Model
                  </label>
                  <select
                    value={companyForm.distributionModel}
                    onChange={(e) => setCompanyForm({ ...companyForm, distributionModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="Van Sales">Van Sales</option>
                    <option value="Pre-Sales">Pre-Sales</option>
                    <option value="Both Van & Pre-Sales">Both Van & Pre-Sales</option>
                    <option value="Wholesale Dealers">Wholesale Dealers</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="quick_slra"
                  checked={companyForm.slraMember}
                  onChange={(e) => setCompanyForm({ ...companyForm, slraMember: e.target.checked })}
                  className="rounded text-[#0033BF]"
                />
                <label htmlFor="quick_slra" className="text-xs text-slate-700 font-medium">
                  SLRA (Sri Lanka Retailers Association) Member
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Operational Challenges or Notes
                </label>
                <textarea
                  rows={2}
                  value={companyForm.operationalChallenges}
                  onChange={(e) => setCompanyForm({ ...companyForm, operationalChallenges: e.target.value })}
                  placeholder="e.g. Current legacy Android app struggles with offline caching..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeQuickAddModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0033BF] hover:bg-[#2768FF] text-white shadow-sm transition-all"
                >
                  {loading ? "Creating..." : "Create Company"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CONTACT */}
          {activeTab === "contact" && (
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Associated Company *
                </label>
                <select
                  required
                  value={contactForm.companyId}
                  onChange={(e) => setContactForm({ ...contactForm, companyId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                >
                  <option value="">Choose Company...</option>
                  {companiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.fullName}
                    onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                    placeholder="e.g. Dinesh Wickremesinghe"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.jobTitle}
                    onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                    placeholder="e.g. Head of Commercial Operations"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchasing Role
                  </label>
                  <select
                    value={contactForm.roleInPurchasing}
                    onChange={(e) => setContactForm({ ...contactForm, roleInPurchasing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="DECISION_MAKER">Decision-Maker (C-Level / Director)</option>
                    <option value="INFLUENCER">Influencer (Sales / Ops Head)</option>
                    <option value="TECHNICAL_EVALUATOR">Technical Evaluator (CIO / IT)</option>
                    <option value="USER">User (Field Sales Rep)</option>
                    <option value="PROCUREMENT">Procurement Manager</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.businessEmail}
                    onChange={(e) => setContactForm({ ...contactForm, businessEmail: e.target.value })}
                    placeholder="dinesh@company.lk"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={contactForm.businessPhone}
                    onChange={(e) => setContactForm({ ...contactForm, businessPhone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={contactForm.linkedinUrl}
                    onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/dinesh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="quick_primary"
                  checked={contactForm.isPrimary}
                  onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                  className="rounded text-[#0033BF]"
                />
                <label htmlFor="quick_primary" className="text-xs text-slate-700 font-medium">
                  Set as primary contact for this company
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeQuickAddModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0033BF] hover:bg-[#2768FF] text-white shadow-sm transition-all"
                >
                  {loading ? "Adding..." : "Add Contact"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: OUTREACH */}
          {activeTab === "outreach" && (
            <form onSubmit={handleLogOutreach} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Company *
                  </label>
                  <select
                    required
                    value={outreachForm.companyId}
                    onChange={(e) => setOutreachForm({ ...outreachForm, companyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="">Select Company...</option>
                    {companiesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Channel
                  </label>
                  <select
                    value={outreachForm.channel}
                    onChange={(e) => setOutreachForm({ ...outreachForm, channel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    {OUTREACH_CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Discussion Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={outreachForm.messageSummary}
                  onChange={(e) => setOutreachForm({ ...outreachForm, messageSummary: e.target.value })}
                  placeholder="Sent tailored pitch deck highlighting offline Bluetooth van printer support..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Outreach Status Outcome
                  </label>
                  <select
                    value={outreachForm.outreachStatus}
                    onChange={(e) => setOutreachForm({ ...outreachForm, outreachStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    {OUTREACH_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={outreachForm.nextFollowUpDate}
                    onChange={(e) => setOutreachForm({ ...outreachForm, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Next Action Description
                </label>
                <input
                  type="text"
                  value={outreachForm.nextAction}
                  onChange={(e) => setOutreachForm({ ...outreachForm, nextAction: e.target.value })}
                  placeholder="e.g. Call back on Friday to review pilot dates"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="auto_create_task"
                  checked={outreachForm.createFollowUpTask}
                  onChange={(e) => setOutreachForm({ ...outreachForm, createFollowUpTask: e.target.checked })}
                  className="rounded text-[#0033BF]"
                />
                <label htmlFor="auto_create_task" className="text-xs text-slate-700 font-medium">
                  Automatically create next follow-up task on calendar
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeQuickAddModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0033BF] hover:bg-[#2768FF] text-white shadow-sm transition-all"
                >
                  {loading ? "Logging..." : "Log Outreach"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: TASK */}
          {activeTab === "task" && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Schedule discovery session with IT Director"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={taskForm.type}
                    onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="TASK">Task</option>
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                    <option value="DEMO">Demo</option>
                    <option value="PROPOSAL">Proposal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Company
                </label>
                <select
                  value={taskForm.companyId}
                  onChange={(e) => setTaskForm({ ...taskForm, companyId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                >
                  <option value="">None / General Task</option>
                  {companiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  placeholder="Key background context for this action..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeQuickAddModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0033BF] hover:bg-[#2768FF] text-white shadow-sm transition-all"
                >
                  {loading ? "Scheduling..." : "Save Follow-up"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: INTENT SIGNAL */}
          {activeTab === "signal" && (
            <form onSubmit={handleCreateSignal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Company *
                </label>
                <select
                  required
                  value={signalForm.companyId}
                  onChange={(e) => setSignalForm({ ...signalForm, companyId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                >
                  <option value="">Select Company...</option>
                  {companiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signal Category *
                  </label>
                  <select
                    value={signalForm.category}
                    onChange={(e) => setSignalForm({ ...signalForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="SFA_REPLACEMENT_UPGRADE">SFA Replacement / Upgrade (+25 pts)</option>
                    <option value="DEMO_PRICING_REQUEST">Demo or Pricing Request (+25 pts)</option>
                    <option value="OPERATIONAL_CHALLENGES">Operational Dissatisfaction (+20 pts)</option>
                    <option value="COMPETITOR_SFA_IMPL">Competitor Implementation (+15 pts)</option>
                    <option value="FIELD_SALES_HIRING">Field Sales Rep Hiring (+10 pts)</option>
                    <option value="DISTRIBUTION_EXPANSION">Distribution Expansion (+10 pts)</option>
                    <option value="DIGITAL_TRANSFORMATION">Digital Transformation (+15 pts)</option>
                    <option value="WEBSITE_ENGAGEMENT">Content Engagement (+10 pts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confidence Level
                  </label>
                  <select
                    value={signalForm.confidence}
                    onChange={(e) => setSignalForm({ ...signalForm, confidence: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="CONFIRMED">Confirmed Fact</option>
                    <option value="STRONG_EVIDENCE">Strong Public Evidence</option>
                    <option value="UNVERIFIED">Unverified / Anecdotal</option>
                    <option value="SPECULATIVE">Speculative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Signal Evidence / Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={signalForm.description}
                  onChange={(e) => setSignalForm({ ...signalForm, description: e.target.value })}
                  placeholder="Published RFP on official site seeking automated van invoicing..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source URL
                  </label>
                  <input
                    type="url"
                    value={signalForm.sourceUrl}
                    onChange={(e) => setSignalForm({ ...signalForm, sourceUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recency (Months Old)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={signalForm.recencyMonths}
                    onChange={(e) => setSignalForm({ ...signalForm, recencyMonths: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeQuickAddModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0033BF] hover:bg-[#2768FF] text-white shadow-sm transition-all"
                >
                  {loading ? "Scoring..." : "Record Signal & Score"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: OPPORTUNITY */}
          {activeTab === "opportunity" && (
            <form onSubmit={handleCreateOpp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opportunity Deal Name *
                </label>
                <input
                  type="text"
                  required
                  value={oppForm.name}
                  onChange={(e) => setOppForm({ ...oppForm, name: e.target.value })}
                  placeholder="e.g. Elephant House - 350 Van Sales SFA Modernization"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company *
                  </label>
                  <select
                    required
                    value={oppForm.companyId}
                    onChange={(e) => setOppForm({ ...oppForm, companyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    <option value="">Select Company...</option>
                    {companiesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pipeline Stage *
                  </label>
                  <select
                    required
                    value={oppForm.stageId}
                    onChange={(e) => setOppForm({ ...oppForm, stageId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    {stagesList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated ACV (Contract Value) *
                  </label>
                  <input
                    type="number"
                    required
                    value={oppForm.estimatedAcv}
                    onChange={(e) => setOppForm({ ...oppForm, estimatedAcv: e.target.value })}
                    placeholder="e.g. 15000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={oppForm.currency}
                    onChange={(e) => setOppForm({ ...oppForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0033BF] focus:outline-none bg-white"
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeQuickAddModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0033BF] hover:bg-[#2768FF] text-white shadow-sm transition-all"
                >
                  {loading ? "Creating..." : "Create Deal"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
