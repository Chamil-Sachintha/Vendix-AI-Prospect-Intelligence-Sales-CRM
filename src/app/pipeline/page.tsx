"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Kanban,
  Plus,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Award,
  AlertTriangle,
  Building2,
  Calendar,
  MoveRight,
} from "lucide-react";

export default function PipelinePage() {
  const { openQuickAddModal, currentUser, permissions } = useApp();

  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [movingOpp, setMovingOpp] = useState<any | null>(null);
  const [targetStageId, setTargetStageId] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPipeline = () => {
    setLoading(true);
    fetch("/api/pipeline")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStages(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleStageChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingOpp || !targetStageId) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: movingOpp.id,
          newStageId: targetStageId,
          lostReason,
          actorName: currentUser.name,
        }),
      });

      if (res.ok) {
        setMovingOpp(null);
        setLostReason("");
        fetchPipeline();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Compute total pipeline value by currency
  const currencyTotals: Record<string, { total: number; weighted: number }> = {};
  for (const st of stages) {
    for (const opp of st.opportunities || []) {
      if (!st.isLost) {
        const curr = opp.currency || "LKR";
        if (!currencyTotals[curr]) currencyTotals[curr] = { total: 0, weighted: 0 };
        currencyTotals[curr].total += opp.estimatedAcv || 0;
        currencyTotals[curr].weighted +=
          ((opp.estimatedAcv || 0) * (opp.probability || 0)) / 100;
      }
    }
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sales Pipeline & Deal Velocity
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            16 enterprise sales stages with multi-currency weighted forecasting and audit tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "kanban" ? "bg-white text-[#0033BF] shadow-xs" : "text-slate-400"
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-white text-[#0033BF] shadow-xs" : "text-slate-400"
              }`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => openQuickAddModal("opportunity")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Create Deal
          </button>
        </div>
      </div>

      {/* Multi-Currency Pipeline Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(currencyTotals).map(([curr, val]) => (
          <div key={curr} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {curr} Pipeline Total
            </div>
            <div className="text-xl font-bold text-slate-900">
              {curr}{" "}
              {val.total > 1000000
                ? `${(val.total / 1000000).toFixed(2)}M`
                : val.total.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              Weighted: {curr}{" "}
              {val.weighted > 1000000
                ? `${(val.weighted / 1000000).toFixed(2)}M`
                : val.weighted.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Move Stage Dialog */}
      {movingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-md">
            <h2 className="text-base font-bold text-slate-900 mb-1">Move Deal Stage</h2>
            <p className="text-xs text-slate-500 mb-4">{movingOpp.name}</p>

            <form onSubmit={handleStageChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Stage *
                </label>
                <select
                  required
                  value={targetStageId}
                  onChange={(e) => setTargetStageId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Choose new stage...</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.order}. {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* If Lost stage selected, prompt lost reason */}
              {stages.find((s) => s.id === targetStageId)?.isLost && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Lost Reason (Required) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    placeholder="e.g. Budget postponed to 2027, renewed with incumbent Bizom..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovingOpp(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-[#0033BF] text-white font-semibold"
                >
                  {isUpdating ? "Moving..." : "Confirm Move"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {stages.map((stage) => {
            const opps = stage.opportunities || [];
            const stageTotal = opps.reduce((sum: number, o: any) => sum + (o.estimatedAcv || 0), 0);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/70 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color || "#2768FF" }}
                    />
                    <span className="font-bold text-xs text-slate-800">{stage.name}</span>
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {opps.length}
                  </span>
                </div>

                {stageTotal > 0 && (
                  <div className="text-[11px] font-semibold text-slate-500 px-1 mb-2">
                    Total: {stageTotal.toLocaleString()}
                  </div>
                )}

                {/* Opportunities Cards in Column */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {opps.map((opp: any) => (
                    <div
                      key={opp.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-[#2768FF] hover:shadow-md transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <Link
                          href={`/companies/${opp.companyId}`}
                          className="font-bold text-slate-900 hover:text-[#0033BF] leading-tight"
                        >
                          {opp.name}
                        </Link>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-500 mb-2">
                        {opp.company?.name}
                      </div>

                      <div className="flex items-center justify-between font-bold text-slate-900 mb-2 text-xs">
                        <span>
                          {opp.currency} {opp.estimatedAcv?.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {opp.probability}% win prob
                        </span>
                      </div>

                      {opp.competitorEvaluated && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded mb-2">
                          vs {opp.competitorEvaluated}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setMovingOpp(opp);
                            setTargetStageId(stage.id);
                          }}
                          className="text-[11px] font-semibold text-[#0033BF] hover:underline flex items-center gap-1"
                        >
                          Move Stage <MoveRight className="h-3 w-3" />
                        </button>

                        <span className="text-[10px] text-slate-400">
                          {opp.expectedCloseDate
                            ? new Date(opp.expectedCloseDate).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                  {opps.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW ALTERNATIVE */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Opportunity</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Estimated ACV</th>
                  <th className="py-3.5 px-4">Probability</th>
                  <th className="py-3.5 px-4">Competitor</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stages.flatMap((s) => s.opportunities || []).map((opp: any) => (
                  <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{opp.name}</td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/companies/${opp.companyId}`}
                        className="font-medium text-[#0033BF] hover:underline"
                      >
                        {opp.company?.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                        {opp.stage?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {opp.currency} {opp.estimatedAcv?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">{opp.probability}%</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {opp.competitorEvaluated || "None"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setMovingOpp(opp);
                          setTargetStageId(opp.stageId);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
