"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Settings,
  Sliders,
  ShieldCheck,
  Zap,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  Mail,
  RefreshCw,
} from "lucide-react";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { DEFAULT_SCORING_WEIGHTS, USER_ROLES } from "@/lib/constants";

export default function SettingsPage() {
  const { currentUser, permissions } = useApp();

  const [activeTab, setActiveTab] = useState<"scoring" | "roles" | "integrations">("scoring");

  const [weights, setWeights] = useState(DEFAULT_SCORING_WEIGHTS);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Integration fields
  const [integrations, setIntegrations] = useState({
    enrichmentApiKey: "",
    linkedinWebhookUrl: "",
    emailCalendarProvider: "google",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.weights) setWeights(data.weights);
        if (data.stages) setStages(data.stages);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveWeights = async (recomputeAllScores = false) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights, recomputeAllScores }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Configuration & Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage dynamic scoring rules, role permissions, and prospective data integrations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 mb-6 text-xs pb-1">
        {[
          { id: "scoring", label: "Intent Scoring Algorithm", icon: Sliders },
          { id: "roles", label: "Roles & RBAC Permissions", icon: ShieldCheck },
          { id: "integrations", label: "Integrations & API Keys", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0033BF] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SCORING WEIGHTS */}
      {activeTab === "scoring" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 max-w-4xl">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Configurable Buying Intent Scoring Rules
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust how much each observed signal contributes to the 0–100 prospect intent score.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                Demo / Direct Pricing Request (Weight Points)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={weights.demoOrPricingRequest}
                onChange={(e) =>
                  setWeights({ ...weights, demoOrPricingRequest: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-[#0033BF]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Inbound requests for Vendix demonstration or proposal.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                Active SFA Replacement Project / RFP
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={weights.sfaReplacementProject}
                onChange={(e) =>
                  setWeights({ ...weights, sfaReplacementProject: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-[#0033BF]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Tender or project initiated to replace current software.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                Software Dissatisfaction / Pain Point Evidence
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={weights.softwareDissatisfaction}
                onChange={(e) =>
                  setWeights({ ...weights, softwareDissatisfaction: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-[#0033BF]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Documented offline sync failure, billing complaints, or slow support.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                Competitor SFA Contract Approaching Renewal
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={weights.competitorImplementationOrEval}
                onChange={(e) =>
                  setWeights({
                    ...weights,
                    competitorImplementationOrEval: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-[#0033BF]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Account nearing 2–3 year renewal cycle with incumbent.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                Digital Transformation / Enterprise Fit
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={weights.targetProfileFit}
                onChange={(e) =>
                  setWeights({ ...weights, targetProfileFit: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-[#0033BF]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Corporate strategic mandate for cloud mobility.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                Field Sales Rep / Ops Hiring Expansion
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={weights.fieldSalesExpansion}
                onChange={(e) =>
                  setWeights({ ...weights, fieldSalesExpansion: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-[#0033BF]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Recruitment advertisements for van sales reps or supervisors.
              </span>
            </div>
          </div>

          {/* Thresholds */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <h3 className="font-bold text-slate-800">Classification Thresholds</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  High Intent Threshold (Min Score)
                </label>
                <input
                  type="number"
                  value={weights.highIntentThreshold}
                  onChange={(e) =>
                    setWeights({ ...weights, highIntentThreshold: parseInt(e.target.value, 10) || 65 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Medium Intent Threshold (Min Score)
                </label>
                <input
                  type="number"
                  value={weights.mediumIntentThreshold}
                  onChange={(e) =>
                    setWeights({
                      ...weights,
                      mediumIntentThreshold: parseInt(e.target.value, 10) || 35,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                />
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved and intent scores recomputed successfully!
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSaveWeights(false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Save Configuration
            </button>
            <button
              onClick={() => handleSaveWeights(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Recomputing Scores..." : "Save & Recompute All Scores"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & RBAC */}
      {activeTab === "roles" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 max-w-4xl">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Role-Based Access Control (RBAC)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforced server-side across all database mutations and actions.
            </p>
          </div>

          <div className="space-y-4">
            {USER_ROLES.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {r.label}
                    {currentUser.role === r.id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0033BF]">
                        You are currently testing this persona
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-0.5">{r.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-200 text-slate-700 uppercase">
                    {r.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRATIONS */}
      {activeTab === "integrations" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 max-w-4xl">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              External Prospecting & CRM Connectors
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure credentials for external services. (As specified in Section 17, live third-party scraping is prohibited; connections use authorized webhook and enrichment endpoints).
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Globe className="h-4 w-4 text-[#0033BF]" />
                Website Visitor & Inbound Contact Form Webhook
              </div>
              <p className="text-slate-500 text-[11px]">
                Accepts live inbound demo requests from vendix.ai contact forms and automatically records intent signals.
              </p>
              <input
                type="text"
                readOnly
                value="https://vendix.ai/api/webhooks/inbound-intent"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-[11px] text-slate-700"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <LinkedInIcon className="h-4 w-4 text-blue-600" />
                LinkedIn Enterprise Prospecting API Key
              </div>
              <p className="text-slate-500 text-[11px]">
                Used for verifying company headquarters and verified decision-maker titles.
              </p>
              <input
                type="password"
                placeholder="Enter authorized client token..."
                value={integrations.enrichmentApiKey}
                onChange={(e) =>
                  setIntegrations({ ...integrations, enrichmentApiKey: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Mail className="h-4 w-4 text-indigo-600" />
                Calendar & Email Integration
              </div>
              <p className="text-slate-500 text-[11px]">
                Sync scheduled demos and discovery sessions with Google Workspace / Microsoft 365.
              </p>
              <select className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs">
                <option value="google">Google Workspace Calendar</option>
                <option value="microsoft">Microsoft 365 Exchange</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
