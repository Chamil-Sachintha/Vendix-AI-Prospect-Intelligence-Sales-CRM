"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Users,
  MessageSquare,
  Calendar,
  MonitorCheck,
  TrendingUp,
  Award,
  DollarSign,
  Filter,
  RefreshCw,
  Clock,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const { openQuickAddModal, currentUser } = useApp();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [competitorFilter, setCompetitorFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("ALL");

  const fetchDashboard = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (industryFilter !== "ALL") params.append("industry", industryFilter);
    if (countryFilter !== "ALL") params.append("country", countryFilter);
    if (competitorFilter !== "ALL") params.append("competitor", competitorFilter);
    if (ownerFilter !== "ALL") params.append("ownerId", ownerFilter);

    fetch(`/api/dashboard?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, [industryFilter, countryFilter, competitorFilter, ownerFilter]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/activities/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true, actorName: currentUser.name }),
      });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Executive Prospect Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time competitor SFA displacement radar, buying signals, and pipeline velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => openQuickAddModal("company")}
            className="px-4 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            + Add Prospect
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5" />
          Filter Intelligence View
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Industry
            </label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Industries</option>
              <option value="FMCG">FMCG & Food Processing</option>
              <option value="Beverages">Beverages & Soft Drinks</option>
              <option value="Retail">Retail & Consumer Goods</option>
              <option value="Manufacturing">Manufacturing & Distribution</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Countries</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Kenya">Kenya</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Competitor SFA
            </label>
            <select
              value={competitorFilter}
              onChange={(e) => setCompetitorFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Vendors</option>
              <option value="Bizom">Bizom</option>
              <option value="FieldAssist">FieldAssist</option>
              <option value="Repsly">Repsly</option>
              <option value="Legacy">Legacy / In-House</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setIndustryFilter("ALL");
                setCountryFilter("ALL");
                setCompetitorFilter("ALL");
                setOwnerFilter("ALL");
              }}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (11 Required KPIs) */}
      {data?.kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {/* 1. Total Companies */}
          <Link
            href="/companies"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Total Companies</span>
              <Building2 className="h-4 w-4 text-slate-400 group-hover:text-[#0033BF]" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.kpis.totalCompanies}</div>
            <div className="text-[11px] text-slate-400 mt-1">In customer intelligence DB</div>
          </Link>

          {/* 2. Qualified Prospects */}
          <Link
            href="/prospects?qualificationStatus=QUALIFIED"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Qualified Prospects</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{data.kpis.qualifiedProspects}</div>
            <div className="text-[11px] text-slate-400 mt-1">Confirmed fit for Vendix SFA</div>
          </Link>

          {/* 3. Using Competitor SFA */}
          <Link
            href="/companies?hasCompetitorSfa=true"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Competitor SFA Users</span>
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {data.kpis.competitorSfaProspects}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Prime displacement targets</div>
          </Link>

          {/* 4. High Buying Intent */}
          <Link
            href="/prospects?intentLevel=HIGH"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">High Buying Intent</span>
              <Flame className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600">{data.kpis.highIntentProspects}</div>
            <div className="text-[11px] text-slate-400 mt-1">Intent Score ≥ 65</div>
          </Link>

          {/* 5. Contacts Reached */}
          <Link
            href="/activities"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Contacts Reached</span>
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.kpis.contactsReached}</div>
            <div className="text-[11px] text-slate-400 mt-1">Total outreach attempts</div>
          </Link>

          {/* 6. Positive Responses */}
          <Link
            href="/activities"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Positive Responses</span>
              <MessageSquare className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {data.kpis.positiveResponses}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {data.kpis.contactsReached > 0
                ? `${Math.round((data.kpis.positiveResponses / data.kpis.contactsReached) * 100)}% conversion`
                : "Active follow-ups"}
            </div>
          </Link>

          {/* 7. Meetings Booked */}
          <Link
            href="/pipeline"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Meetings Booked</span>
              <Calendar className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{data.kpis.meetingsBooked}</div>
            <div className="text-[11px] text-slate-400 mt-1">Discovery sessions</div>
          </Link>

          {/* 8. Demos Completed */}
          <Link
            href="/pipeline"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Demos Completed</span>
              <MonitorCheck className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{data.kpis.demosCompleted}</div>
            <div className="text-[11px] text-slate-400 mt-1">Platform walkthroughs</div>
          </Link>

          {/* 9. Open Opportunities */}
          <Link
            href="/pipeline"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Open Deals</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.kpis.openOpportunities}</div>
            <div className="text-[11px] text-slate-400 mt-1">Active in pipeline</div>
          </Link>

          {/* 10. Deals Won */}
          <Link
            href="/pipeline"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Deals Won</span>
              <Award className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{data.kpis.dealsWon}</div>
            <div className="text-[11px] text-slate-400 mt-1">Closed successfully</div>
          </Link>

          {/* 11. Pipeline Value (Multi-Currency Grouped) */}
          <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-r from-[#0033BF] to-[#2768FF] text-white shadow-md">
            <div className="flex items-center justify-between opacity-80 mb-1">
              <span className="text-xs font-semibold">Estimated Pipeline Value</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              {Object.entries(data.kpis.pipelineByCurrency || {}).map(([currency, val]: any) => (
                <div key={currency} className="border-r border-white/20 pr-4 last:border-0">
                  <div className="text-xs font-medium text-blue-100">{currency} Pipeline</div>
                  <div className="text-xl font-bold">
                    {val.total > 1000000
                      ? `${(val.total / 1000000).toFixed(1)}M`
                      : val.total.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-blue-100">
                    Weighted:{" "}
                    {val.weighted > 1000000
                      ? `${(val.weighted / 1000000).toFixed(1)}M`
                      : val.weighted.toLocaleString()}
                  </div>
                </div>
              ))}
              {Object.keys(data.kpis.pipelineByCurrency || {}).length === 0 && (
                <div className="text-sm font-semibold">No active deals yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Pipeline by Stage */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pipeline Stages Distribution</h3>
              <p className="text-xs text-slate-500">Number of enterprise prospects across 16 stages</p>
            </div>
            <Link
              href="/pipeline"
              className="text-xs font-semibold text-[#0033BF] hover:underline flex items-center gap-1"
            >
              Kanban Board <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.charts?.pipelineByStage
              ?.filter((s: any) => s.count > 0 || ["New Prospect", "Qualified", "Demo Completed", "Proposal Sent", "Won"].includes(s.name))
              .map((stage: any) => (
                <div key={stage.stageId} className="flex items-center gap-3">
                  <div className="w-40 text-xs font-medium text-slate-700 truncate">
                    {stage.name}
                  </div>
                  <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: stage.color || "#2768FF",
                        width: `${Math.min(100, stage.count * 25)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 w-6 text-right">
                    {stage.count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Buying Intent Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Buying-Intent Prioritization</h3>
              <Flame className="h-4 w-4 text-rose-500" />
            </div>

            <div className="space-y-4">
              {data?.charts?.buyingIntentDistribution?.map((intent: any) => (
                <div key={intent.name} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">{intent.name}</span>
                    <span
                      className="font-bold px-2 py-0.5 rounded-full text-white text-[10px]"
                      style={{ backgroundColor: intent.color }}
                    >
                      {intent.count} Accounts
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: intent.color,
                        width: `${data.kpis.totalCompanies > 0 ? (intent.count / data.kpis.totalCompanies) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <Link
              href="/intent"
              className="text-xs font-semibold text-[#0033BF] hover:underline"
            >
              Configure Intent Scoring Weights →
            </Link>
          </div>
        </div>
      </div>

      {/* SFA Vendors Market Share & Follow-ups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Current Competitor SFA Share */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Competitor SFA Footprint in Database
              </h3>
              <p className="text-xs text-slate-500">
                Software vendors currently powering prospect sales forces
              </p>
            </div>
            <Link
              href="/competitors"
              className="text-xs font-semibold text-[#0033BF] hover:underline flex items-center gap-1"
            >
              Competitor Directory <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.charts?.sfaVendorsShare?.map((v: any) => (
              <div
                key={v.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800">{v.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0033BF]">
                    {v.count} prospects
                  </span>
                  <Link
                    href={`/companies?competitor=${encodeURIComponent(v.name)}`}
                    className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Upcoming & Overdue Follow-ups */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Follow-up Priority Queue</h3>
              <p className="text-xs text-slate-500">Next outreach and scheduled commitments</p>
            </div>
            <Link
              href="/activities"
              className="text-xs font-semibold text-[#0033BF] hover:underline flex items-center gap-1"
            >
              All Tasks <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {data?.tasks?.length > 0 ? (
              data.tasks.map((task: any) => {
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 group hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="mt-0.5 w-4 h-4 rounded border border-slate-300 hover:border-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                        title="Mark complete"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-transparent hover:text-emerald-600" />
                      </button>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{task.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {task.company?.name || "General"} • {task.contact?.fullName || ""}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOverdue
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-[#0033BF]"
                        }`}
                      >
                        {isOverdue ? "Overdue" : new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                All scheduled tasks completed! Use Quick Add to schedule follow-ups.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Audit Trail */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mb-8">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Recent Prospect Activity Timeline</h3>
        <div className="space-y-3">
          {data?.recentTimeline?.map((ev: any) => (
            <div key={ev.id} className="flex items-start gap-3 text-xs border-b border-slate-50 pb-2.5 last:border-0">
              <div className="w-2 h-2 rounded-full bg-[#2768FF] mt-1.5 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-slate-900">{ev.actorName}: </span>
                <span className="text-slate-700">{ev.description}</span>
                {ev.company && (
                  <Link
                    href={`/companies/${ev.company.id}`}
                    className="ml-2 font-bold text-[#0033BF] hover:underline"
                  >
                    [{ev.company.name}]
                  </Link>
                )}
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(ev.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
