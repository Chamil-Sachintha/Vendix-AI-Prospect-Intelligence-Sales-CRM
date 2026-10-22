"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Flame,
  Plus,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/constants";

export default function BuyingIntentPage() {
  const { openQuickAddModal } = useApp();

  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [strengthFilter, setStrengthFilter] = useState("ALL");
  const [weights, setWeights] = useState(DEFAULT_SCORING_WEIGHTS);

  const fetchSignals = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter !== "ALL") params.append("category", categoryFilter);
    if (strengthFilter !== "ALL") params.append("strength", strengthFilter);

    fetch(`/api/intent?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSignals(data);
      })
      .finally(() => setLoading(false));

    fetch("/api/settings")
      .then((res) => res.json())
      .then((s) => {
        if (s.weights) setWeights(s.weights);
      });
  };

  useEffect(() => {
    fetchSignals();
  }, [categoryFilter, strengthFilter]);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Buying Intent & Opportunity Signals
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Algorithmic 0–100 scoring engine tracking procurement RFPs, field hiring, and software dissatisfaction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Sliders className="h-3.5 w-3.5" />
            Configure Scoring Rules
          </Link>
          <button
            onClick={() => openQuickAddModal("signal")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Log Intent Signal
          </button>
        </div>
      </div>

      {/* Scoring Engine Breakdown Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md mb-8">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-400" />
            <h3 className="font-bold text-base">Active Scoring Model Configuration (0–100)</h3>
          </div>
          <span className="text-xs text-slate-300">
            Decay Threshold: {weights.decayMonthsThreshold} months
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl font-bold text-emerald-400">+{weights.demoOrPricingRequest}</div>
            <div className="text-[10px] text-slate-300 mt-1">Demo / Pricing Request</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl font-bold text-emerald-400">+{weights.sfaReplacementProject}</div>
            <div className="text-[10px] text-slate-300 mt-1">SFA Project / Tender</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl font-bold text-blue-400">+{weights.softwareDissatisfaction}</div>
            <div className="text-[10px] text-slate-300 mt-1">Dissatisfaction Evidence</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl font-bold text-blue-400">+{weights.competitorImplementationOrEval}</div>
            <div className="text-[10px] text-slate-300 mt-1">Competitor SFA Signal</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl font-bold text-indigo-400">+{weights.targetProfileFit}</div>
            <div className="text-[10px] text-slate-300 mt-1">Digital Transformation</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl font-bold text-purple-400">+{weights.fieldSalesExpansion}</div>
            <div className="text-[10px] text-slate-300 mt-1">Field Rep Hiring</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl font-bold text-amber-400">+{weights.contentEngagement}</div>
            <div className="text-[10px] text-slate-300 mt-1">Website Engagement</div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Signal Categories</option>
            <option value="SFA_REPLACEMENT_UPGRADE">SFA Replacement / Upgrade</option>
            <option value="DEMO_PRICING_REQUEST">Demo / Pricing Request</option>
            <option value="OPERATIONAL_CHALLENGES">Operational Challenges</option>
            <option value="COMPETITOR_SFA_IMPL">Competitor SFA Implementation</option>
            <option value="FIELD_SALES_HIRING">Field Sales Hiring</option>
            <option value="DIGITAL_TRANSFORMATION">Digital Transformation</option>
          </select>

          <select
            value={strengthFilter}
            onChange={(e) => setStrengthFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Strengths</option>
            <option value="HIGH">High Strength</option>
            <option value="MEDIUM">Medium Strength</option>
            <option value="LOW">Low Strength</option>
          </select>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {signals.map((sig) => (
          <div
            key={sig.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/companies/${sig.companyId}`}
                  className="font-bold text-sm text-slate-900 hover:text-[#0033BF] hover:underline"
                >
                  {sig.company?.name}
                </Link>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0033BF]">
                  {sig.category.replace(/_/g, " ")}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sig.strength === "HIGH"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {sig.strength} Strength
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {sig.confidence}
                </span>
              </div>

              <p className="text-slate-700 leading-relaxed">{sig.description}</p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span>Source: {sig.sourceType || "Direct Observation"}</span>
                <span>• Observed: {new Date(sig.dateObserved).toLocaleDateString()}</span>
                {sig.sourceUrl && (
                  <a
                    href={sig.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0033BF] hover:underline flex items-center gap-0.5 font-medium"
                  >
                    View Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-semibold">Total Intent Score</div>
                <div className="text-lg font-bold text-slate-900">
                  {sig.company?.intentScore} / 100
                </div>
              </div>

              <Link
                href={`/companies/${sig.companyId}`}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                View Account →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
