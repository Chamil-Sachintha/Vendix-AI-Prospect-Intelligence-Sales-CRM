"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  Search,
  Filter,
  Download,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Users,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function CompaniesPage() {
  const { openQuickAddModal } = useApp();

  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("ALL");
  const [country, setCountry] = useState("ALL");
  const [intentLevel, setIntentLevel] = useState("ALL");
  const [qualificationStatus, setQualificationStatus] = useState("ALL");
  const [slraMember, setSlraMember] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const fetchCompanies = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (industry !== "ALL") params.append("industry", industry);
    if (country !== "ALL") params.append("country", country);
    if (intentLevel !== "ALL") params.append("intentLevel", intentLevel);
    if (qualificationStatus !== "ALL") params.append("qualificationStatus", qualificationStatus);
    if (slraMember) params.append("slraMember", "true");

    fetch(`/api/companies?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.companies) setCompanies(data.companies);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, industry, country, intentLevel, qualificationStatus, slraMember]);

  const applySavedView = (presetName: string) => {
    setActivePreset(presetName);
    switch (presetName) {
      case "High-Intent Prospects":
        setIntentLevel("HIGH");
        setQualificationStatus("ALL");
        setSlraMember(false);
        break;
      case "Companies Using Competitor SFA":
        setIntentLevel("ALL");
        setQualificationStatus("ALL");
        setSlraMember(false);
        break;
      case "Sri Lankan FMCG Prospects":
        setCountry("Sri Lanka");
        setIndustry("FMCG");
        setIntentLevel("ALL");
        setQualificationStatus("ALL");
        setSlraMember(false);
        break;
      case "SLRA Members to Research":
        setSlraMember(true);
        setCountry("ALL");
        setIndustry("ALL");
        setIntentLevel("ALL");
        break;
      case "Qualified International Prospects":
        setCountry("ALL");
        setQualificationStatus("QUALIFIED");
        setIntentLevel("ALL");
        setSlraMember(false);
        break;
      default:
        setActivePreset(null);
        setIndustry("ALL");
        setCountry("ALL");
        setIntentLevel("ALL");
        setQualificationStatus("ALL");
        setSlraMember(false);
        setSearch("");
    }
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Company & Account Intelligence Database
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Structured database of prospective enterprises, field sales operations, and software stacks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export?entity=companies"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
          <button
            onClick={() => openQuickAddModal("company")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Saved Views Pill Bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
        <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mr-1">
          Saved Views:
        </span>
        {[
          "All Accounts",
          "High-Intent Prospects",
          "Companies Using Competitor SFA",
          "Sri Lankan FMCG Prospects",
          "SLRA Members to Research",
          "Qualified International Prospects",
        ].map((sv) => {
          const isActive =
            (sv === "All Accounts" && !activePreset) || activePreset === sv;
          return (
            <button
              key={sv}
              onClick={() => applySavedView(sv === "All Accounts" ? "" : sv)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#0033BF] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {sv}
            </button>
          );
        })}
      </div>

      {/* Search & Filters Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by company name, city, products, challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Industries</option>
              <option value="FMCG">FMCG & Consumer</option>
              <option value="Beverages">Beverages</option>
              <option value="Retail">Retail & Electronics</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="E-Commerce">E-Commerce</option>
            </select>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Countries</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Kenya">Kenya</option>
            </select>

            <select
              value={intentLevel}
              onChange={(e) => setIntentLevel(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Intent</option>
              <option value="HIGH">High Intent (≥65)</option>
              <option value="MEDIUM">Medium Intent</option>
              <option value="LOW">Low Intent</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50 ml-auto">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-white text-[#0033BF] shadow-xs" : "text-slate-400"
                }`}
                title="Table View"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "card" ? "bg-white text-[#0033BF] shadow-xs" : "text-slate-400"
                }`}
                title="Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Companies List: TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Company & Identity</th>
                  <th className="py-3.5 px-4">Industry & Country</th>
                  <th className="py-3.5 px-4">Sales Force / Van Scale</th>
                  <th className="py-3.5 px-4">Current SFA Stack</th>
                  <th className="py-3.5 px-4">Intent Score</th>
                  <th className="py-3.5 px-4">Key Decision-Maker</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => {
                  const sfa = c.softwareRecords?.find((s: any) => s.category === "SFA");
                  const primaryContact = c.contacts?.[0];

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <Link href={`/companies/${c.id}`} className="block">
                          <div className="font-bold text-slate-900 group-hover:text-[#0033BF] text-sm">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {c.tradingName && <span>"{c.tradingName}"</span>}
                            {c.slraMember && (
                              <span className="text-[10px] bg-blue-50 text-[#0033BF] font-semibold px-1.5 py-0.2 rounded border border-blue-200">
                                SLRA
                              </span>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Industry & Country */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{c.industry}</div>
                        <div className="text-[11px] text-slate-500">{c.country}</div>
                      </td>

                      {/* Operations */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {c.fieldSalesRepsCount ? `${c.fieldSalesRepsCount} Field Reps` : "Unknown scale"}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.distributionModel || "Distribution"}</div>
                      </td>

                      {/* Current SFA */}
                      <td className="py-3.5 px-4">
                        {sfa ? (
                          <div>
                            <div className="font-semibold text-slate-800 flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3 text-amber-500" />
                              {sfa.productName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {sfa.vendorName} • {sfa.status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None logged</span>
                        )}
                      </td>

                      {/* Intent */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${c.intentScore}%`,
                                backgroundColor:
                                  c.intentLevel === "HIGH"
                                    ? "#10B981"
                                    : c.intentLevel === "MEDIUM"
                                    ? "#F59E0B"
                                    : "#64748B",
                              }}
                            />
                          </div>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              c.intentLevel === "HIGH"
                                ? "bg-emerald-100 text-emerald-800"
                                : c.intentLevel === "MEDIUM"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {c.intentScore}
                          </span>
                        </div>
                      </td>

                      {/* Primary Contact */}
                      <td className="py-3.5 px-4">
                        {primaryContact ? (
                          <div>
                            <div className="font-medium text-slate-900">{primaryContact.fullName}</div>
                            <div className="text-[11px] text-slate-500">{primaryContact.jobTitle}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No contact</span>
                        )}
                      </td>

                      {/* Qualification Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                            c.qualificationStatus === "QUALIFIED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : c.qualificationStatus === "RESEARCHING"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {c.qualificationStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/companies/${c.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1 text-[11px]"
                        >
                          View Profile
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Companies List: CARD VIEW */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => {
            const sfa = c.softwareRecords?.find((s: any) => s.category === "SFA");
            const primaryContact = c.contacts?.[0];

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-[#2768FF] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <Link
                        href={`/companies/${c.id}`}
                        className="font-bold text-base text-slate-900 hover:text-[#0033BF] transition-colors leading-tight"
                      >
                        {c.name}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {c.industry} • {c.country}
                      </div>
                    </div>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-xs shrink-0 ${
                        c.intentLevel === "HIGH"
                          ? "bg-emerald-100 text-emerald-800"
                          : c.intentLevel === "MEDIUM"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Intent: {c.intentScore}
                    </span>
                  </div>

                  {c.tradingName && (
                    <div className="text-xs text-slate-600 mb-2">
                      Brand / Trading: <span className="font-semibold">{c.tradingName}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 my-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Field Sales Reps:</span>
                      <span className="font-bold text-slate-800">
                        {c.fieldSalesRepsCount || "Not documented"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Current SFA:</span>
                      <span className="font-bold text-slate-800">
                        {sfa ? sfa.productName : "None logged"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Distribution:</span>
                      <span className="font-medium text-slate-700">
                        {c.distributionModel || "Standard"}
                      </span>
                    </div>
                  </div>

                  {primaryContact && (
                    <div className="text-xs text-slate-600 mb-3">
                      <span className="text-slate-400">Primary Contact: </span>
                      <span className="font-semibold text-slate-800">{primaryContact.fullName}</span> (
                      {primaryContact.jobTitle})
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      c.qualificationStatus === "QUALIFIED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {c.qualificationStatus}
                  </span>
                  <Link
                    href={`/companies/${c.id}`}
                    className="text-xs font-bold text-[#0033BF] hover:underline flex items-center gap-1"
                  >
                    Full Profile <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {companies.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No companies found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search filters or click below to add a new prospect account.
          </p>
          <button
            onClick={() => openQuickAddModal("company")}
            className="px-4 py-2 rounded-xl bg-[#0033BF] text-white text-xs font-semibold"
          >
            + Add New Company
          </button>
        </div>
      )}
    </AppShell>
  );
}
