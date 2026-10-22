"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Target,
  Flame,
  ShieldAlert,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  ChevronRight,
  TrendingUp,
  Filter,
} from "lucide-react";

export default function ProspectsPage() {
  const { openQuickAddModal } = useApp();

  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [intentFilter, setIntentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchProspects = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (intentFilter !== "ALL") params.append("intentLevel", intentFilter);
    if (statusFilter !== "ALL") params.append("qualificationStatus", statusFilter);
    if (search.trim()) params.append("search", search.trim());

    fetch(`/api/companies?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.companies) setProspects(data.companies);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProspects();
  }, [intentFilter, statusFilter, search]);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Target Prospect Prioritization Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ranked by calculated buying intent score, competitor SFA vulnerability, and field team scale.
          </p>
        </div>

        <button
          onClick={() => openQuickAddModal("company")}
          className="px-4 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          + Add New Prospect
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search prospects by name, industry, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Intent Tiers</option>
            <option value="HIGH">High Intent (≥65 pts)</option>
            <option value="MEDIUM">Medium Intent (35-64 pts)</option>
            <option value="LOW">Low Intent (&lt;35 pts)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Qualification</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="RESEARCHING">Researching</option>
            <option value="NURTURING">Nurturing</option>
          </select>
        </div>
      </div>

      {/* Prospects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prospects.map((p) => {
          const sfa = p.softwareRecords?.find((s: any) => s.category === "SFA");
          const primaryContact = p.contacts?.[0];

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-[#2768FF] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <Link
                      href={`/companies/${p.id}`}
                      className="font-bold text-base text-slate-900 hover:text-[#0033BF] transition-colors leading-tight block"
                    >
                      {p.name}
                    </Link>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {p.industry} • {p.country}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                    <Flame
                      className={`h-3.5 w-3.5 ${
                        p.intentLevel === "HIGH"
                          ? "text-rose-500"
                          : p.intentLevel === "MEDIUM"
                          ? "text-amber-500"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="font-bold text-xs text-slate-900">{p.intentScore}</span>
                  </div>
                </div>

                {/* SFA replacement indicator */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Current SFA:</span>
                    <span className="font-bold text-slate-800">
                      {sfa ? sfa.productName : "Unverified"}
                    </span>
                  </div>
                  {sfa && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Vendor / Status:</span>
                      <span className="font-semibold text-slate-700">
                        {sfa.vendorName} ({sfa.status})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Field Rep Capacity:</span>
                    <span className="font-bold text-slate-900">
                      {p.fieldSalesRepsCount ? `${p.fieldSalesRepsCount} Reps` : "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Decision Maker */}
                {primaryContact ? (
                  <div className="text-xs text-slate-700 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100/60 mb-3">
                    <div className="font-bold text-slate-900">{primaryContact.fullName}</div>
                    <div className="text-[11px] text-slate-500">{primaryContact.jobTitle}</div>
                    <div className="flex items-center gap-3 text-[11px] text-[#0033BF] mt-1">
                      {primaryContact.businessEmail && <span>{primaryContact.businessEmail}</span>}
                      {primaryContact.businessPhone && <span>{primaryContact.businessPhone}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic mb-3">
                    No primary decision-maker attached yet
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    p.qualificationStatus === "QUALIFIED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {p.qualificationStatus}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openQuickAddModal("outreach")}
                    className="text-xs font-bold text-[#0033BF] hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    Log Touch
                  </button>
                  <Link
                    href={`/companies/${p.id}`}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                    title="View Account Profile"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
