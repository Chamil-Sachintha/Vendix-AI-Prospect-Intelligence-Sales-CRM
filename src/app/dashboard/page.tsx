"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Users,
  Sparkles,
  Send,
  HeartHandshake,
  CalendarCheck2,
  FileText,
  Trophy,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  Table,
} from "lucide-react";
import { ProspectModal } from "@/components/modals/ProspectModal";

interface DashboardMetrics {
  totalProspects: number;
  newProspects: number;
  contactedAwaiting: number;
  interestedProspects: number;
  meetingsDemos: number;
  proposalsSent: number;
  wonProspects: number;
  followUpsDue: number;
}

export default function SimpleDashboardPage() {
  const { openQuickAddModal } = useApp();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchMetrics = () => {
    setLoading(true);
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setMetrics(data);
        }
      })
      .catch((err) => console.error("Error fetching dashboard:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const cards = [
    {
      title: "Total Prospects",
      value: metrics?.totalProspects ?? 0,
      description: "All companies tracked in database",
      href: "/?status=ALL",
      icon: Users,
      color: "text-[#0033BF] bg-blue-50 border-blue-200",
      accent: "border-l-[#0033BF]",
    },
    {
      title: "New Prospects",
      value: metrics?.newProspects ?? 0,
      description: "Added to database, not yet researched",
      href: "/?status=New",
      icon: Sparkles,
      color: "text-slate-700 bg-slate-100 border-slate-300",
      accent: "border-l-slate-500",
    },
    {
      title: "Contacted / Awaiting",
      value: metrics?.contactedAwaiting ?? 0,
      description: "Outreach initiated, awaiting reply",
      href: "/?status=Contacted%20%2F%20Awaiting%20Response",
      icon: Send,
      color: "text-sky-700 bg-sky-50 border-sky-200",
      accent: "border-l-sky-500",
    },
    {
      title: "Interested Prospects",
      value: metrics?.interestedProspects ?? 0,
      description: "Expressed positive purchase intent",
      href: "/?status=Interested",
      icon: HeartHandshake,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      accent: "border-l-indigo-600",
    },
    {
      title: "Meetings / Demos",
      value: metrics?.meetingsDemos ?? 0,
      description: "Demonstrations arranged or ongoing",
      href: "/?status=Meeting%20%2F%20Demo",
      icon: CalendarCheck2,
      color: "text-purple-700 bg-purple-50 border-purple-200",
      accent: "border-l-purple-600",
    },
    {
      title: "Proposals Sent",
      value: metrics?.proposalsSent ?? 0,
      description: "Commercial offers in evaluation",
      href: "/?status=Proposal%20Sent",
      icon: FileText,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      accent: "border-l-amber-500",
    },
    {
      title: "Won Prospects",
      value: metrics?.wonProspects ?? 0,
      description: "Converted into Vendix customers",
      href: "/?status=Won",
      icon: Trophy,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      accent: "border-l-emerald-500",
    },
    {
      title: "Follow-ups Due",
      value: metrics?.followUpsDue ?? 0,
      description: "Scheduled actions due today or overdue",
      href: "/?followUpsDue=true",
      icon: AlertTriangle,
      color:
        (metrics?.followUpsDue ?? 0) > 0
          ? "text-rose-700 bg-rose-50 border-rose-300 ring-2 ring-rose-100"
          : "text-slate-600 bg-slate-50 border-slate-200",
      accent: (metrics?.followUpsDue ?? 0) > 0 ? "border-l-rose-500" : "border-l-slate-400",
      badge:
        (metrics?.followUpsDue ?? 0) > 0
          ? { text: "Action Required", class: "bg-rose-100 text-rose-700 border-rose-200" }
          : null,
    },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Prospect Summary Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time counts across the prospect lifecycle. Click any card to view the filtered list.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
              title="Refresh counts"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0033BF] hover:bg-[#2768FF] rounded-lg shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Prospect
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Table className="h-3.5 w-3.5" />
              View All Prospects
            </Link>
          </div>
        </div>

        {/* 8 Minimal KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className={`group relative bg-white border border-slate-200 border-l-4 ${card.accent} rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div
                      className={`p-2 rounded-lg border ${card.color} group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    {loading ? (
                      <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {card.value.toLocaleString()}
                      </span>
                    )}

                    {card.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badge.class}`}
                      >
                        {card.badge.text}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">{card.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0033BF] group-hover:text-[#2768FF]">
                  <span>View prospects</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Informational Banner */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0033BF] text-white rounded-lg">
              <Table className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0033BF]">Vendix Prospect Database</p>
              <p className="text-blue-800">
                All records, decision-makers, and follow-up activities are centrally managed in the main Prospects table.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0033BF] text-white font-semibold rounded-lg hover:bg-[#2768FF] shrink-0 text-xs shadow-xs"
          >
            Open Prospects Table
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Add Prospect Modal */}
      <ProspectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchMetrics();
        }}
      />
    </AppShell>
  );
}
