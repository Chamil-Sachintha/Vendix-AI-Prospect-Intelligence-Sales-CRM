"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  ShieldAlert,
  Globe,
  Plus,
  Users,
  Target,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Layers,
} from "lucide-react";

export default function CompetitorsPage() {
  const { currentUser, permissions } = useApp();

  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComp, setNewComp] = useState({
    vendorName: "",
    productName: "",
    website: "",
    targetIndustries: "",
    positioning: "",
    knownFeatures: "",
    customerReferences: "",
    caseStudies: "",
    notes: "",
  });

  const fetchCompetitors = () => {
    setLoading(true);
    fetch("/api/competitors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCompetitors(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleCreateCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManageCompetitors) {
      alert("You do not have permission to add competitor profiles.");
      return;
    }
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComp),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewComp({
          vendorName: "",
          productName: "",
          website: "",
          targetIndustries: "",
          positioning: "",
          knownFeatures: "",
          customerReferences: "",
          caseStudies: "",
          notes: "",
        });
        fetchCompetitors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Competitor SFA Intelligence Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Competitive matrix of alternative SFA vendors, positioning, limitations, and mapped accounts.
          </p>
        </div>

        {permissions.canManageCompetitors && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Competitor Profile
          </button>
        )}
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 mb-4">Add Competitor SFA Platform</h2>
            <form onSubmit={handleCreateCompetitor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vendor / Company *</label>
                  <input
                    type="text"
                    required
                    value={newComp.vendorName}
                    onChange={(e) => setNewComp({ ...newComp, vendorName: e.target.value })}
                    placeholder="e.g. Mobisy Technologies"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newComp.productName}
                    onChange={(e) => setNewComp({ ...newComp, productName: e.target.value })}
                    placeholder="e.g. Bizom"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  value={newComp.website}
                  onChange={(e) => setNewComp({ ...newComp, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Market Positioning</label>
                <input
                  type="text"
                  value={newComp.positioning}
                  onChange={(e) => setNewComp({ ...newComp, positioning: e.target.value })}
                  placeholder="e.g. Enterprise CPG Route to market..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Known Features</label>
                <textarea
                  rows={2}
                  value={newComp.knownFeatures}
                  onChange={(e) => setNewComp({ ...newComp, knownFeatures: e.target.value })}
                  placeholder="Van sales, Secondary distribution..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Known Limitations & Pricing Notes
                </label>
                <textarea
                  rows={2}
                  value={newComp.notes}
                  onChange={(e) => setNewComp({ ...newComp, notes: e.target.value })}
                  placeholder="Reported slow offline syncing in rural areas, high dollar license pricing..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0033BF] text-white font-semibold"
                >
                  Save Competitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Competitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map((comp) => (
          <div
            key={comp.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{comp.productName}</h3>
                  <div className="text-xs font-semibold text-slate-500">{comp.vendorName}</div>
                </div>

                {comp.website && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0033BF] hover:bg-slate-50"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2 mb-4">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600">Prospects Currently Using:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-[#0033BF] font-bold">
                    {comp.prospectsUsingCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-rose-700">Replacing / Evaluating:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                    {comp.prospectsReplacingCount || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                {comp.positioning && (
                  <div>
                    <span className="font-semibold text-slate-800">Positioning: </span>
                    {comp.positioning}
                  </div>
                )}
                {comp.knownFeatures && (
                  <div>
                    <span className="font-semibold text-slate-800">Key Features: </span>
                    {comp.knownFeatures}
                  </div>
                )}
                {comp.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
                    <span className="font-bold">Market Vulnerabilities / Notes: </span>
                    {comp.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <Link
                href={`/companies?competitor=${encodeURIComponent(comp.productName)}`}
                className="text-xs font-bold text-[#0033BF] hover:underline flex items-center gap-1"
              >
                View Accounts ({comp.prospectsUsingCount + comp.prospectsReplacingCount}){" "}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
