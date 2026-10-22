"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Settings,
  Tag,
  Clock,
  ShieldCheck,
  Download,
  Save,
  CheckCircle2,
  Table,
} from "lucide-react";
import { PROSPECT_STATUSES, USER_ROLES } from "@/lib/constants";

export default function SimplifiedSettingsPage() {
  const { currentUser, setCurrentUser } = useApp();
  const [activeTab, setActiveTab] = useState<"statuses" | "preferences" | "roles">("statuses");

  // General Preferences state
  const [preferences, setPreferences] = useState({
    defaultCountry: "Sri Lanka",
    defaultFollowUpDays: "7",
    workingDays: "Monday - Friday",
    currency: "LKR (Rs)",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 400);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="h-6 w-6 text-[#0033BF]" />
              Application Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure prospect tracking statuses, default follow-up cadences, and role permissions.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Table className="h-3.5 w-3.5" />
            Back to Prospects Table
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: "statuses", label: "Prospect Statuses", icon: Tag },
            { id: "preferences", label: "General & Follow-up Cadence", icon: Clock },
            { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
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

        {/* Tab 1: Prospect Statuses */}
        {activeTab === "statuses" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Standard Prospect Lifecycle Statuses</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These 13 standardized statuses are available in the main table dropdown and reflect the progression from discovery to contract.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {PROSPECT_STATUSES.length} Active Statuses
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {PROSPECT_STATUSES.map((status, index) => (
                  <div
                    key={status.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 w-5">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 sm:text-right">
                      {status.id === "New" && "Initial record added; research pending."}
                      {status.id === "Researching" && "Gathering company details, tech stack, and key contacts."}
                      {status.id === "Ready to Contact" && "Decision-maker verified; ready for initial outreach."}
                      {status.id === "Contacted" && "Email, call, or message delivered to prospect."}
                      {status.id === "Awaiting Response" && "Waiting for reply from target stakeholder."}
                      {status.id === "Responded" && "Communication received from prospect."}
                      {status.id === "Interested" && "Positive intent or pain point confirmed."}
                      {status.id === "Meeting / Demo" && "Demonstration or discovery call scheduled/conducted."}
                      {status.id === "Proposal Sent" && "Commercial offer or quotation delivered."}
                      {status.id === "Won" && "Converted to active Vendix SFA customer."}
                      {status.id === "Lost" && "Opportunity ceased or chose alternative."}
                      {status.id === "Nurturing" && "Postponed for future quarter follow-up."}
                      {status.id === "Do Not Contact" && "Unsubscribed or restricted from outreach."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Preferences */}
        {activeTab === "preferences" && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Prospect Tracking Preferences</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set baseline defaults for follow-ups, operating geographies, and data export.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Target Country
                </label>
                <select
                  value={preferences.defaultCountry}
                  onChange={(e) => setPreferences({ ...preferences, defaultCountry: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                >
                  <option value="Sri Lanka">Sri Lanka (Domestic Market)</option>
                  <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Global">Other / International</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Follow-up Offset
                </label>
                <select
                  value={preferences.defaultFollowUpDays}
                  onChange={(e) =>
                    setPreferences({ ...preferences, defaultFollowUpDays: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                >
                  <option value="3">3 Days (Fast Pace Outreach)</option>
                  <option value="7">7 Days (Standard 1 Week)</option>
                  <option value="14">14 Days (2 Weeks)</option>
                  <option value="30">30 Days (Monthly Check-in)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Working Cadence
                </label>
                <input
                  type="text"
                  value={preferences.workingDays}
                  onChange={(e) => setPreferences({ ...preferences, workingDays: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Base Reporting Currency
                </label>
                <input
                  type="text"
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#0033BF] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Preferences saved successfully!
                  </span>
                )}
              </div>
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0033BF] hover:bg-[#2768FF] rounded-lg shadow-xs transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Roles & Permissions */}
        {activeTab === "roles" && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Roles & Access Levels</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of user permissions within the simplified prospect database.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {USER_ROLES.map((role) => {
                const isCurrent = currentUser?.role === role.id;
                return (
                  <div
                    key={role.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? "border-[#0033BF] bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{role.label}</span>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0033BF] text-white">
                          Current Persona
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setCurrentUser({
                              id: `usr_${role.id.toLowerCase()}`,
                              name: role.label,
                              email: `${role.id.toLowerCase()}@vendix.ai`,
                              role: role.id as any,
                            })
                          }
                          className="text-[10px] font-semibold text-[#0033BF] hover:underline"
                        >
                          Switch to Role
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">{role.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick CSV Export Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-900">Full Database Backup / Export</p>
            <p className="text-slate-500">
              Download the entire prospect database as a CSV file with all 15 table columns.
            </p>
          </div>
          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export Complete CSV
          </a>
        </div>
      </div>
    </AppShell>
  );
}
