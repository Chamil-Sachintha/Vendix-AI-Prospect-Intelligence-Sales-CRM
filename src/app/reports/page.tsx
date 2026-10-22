"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  BarChart3,
  Download,
  Building2,
  ShieldAlert,
  Flame,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sales Reports & Competitor Market Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational intelligence based on verified field data and active sales pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/export?entity=companies"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export Raw Database
          </a>
        </div>
      </div>

      {/* Grid of Report Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Report 1: Competitor SFA Market Share */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Competitor SFA Market Footprint
            </h3>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            {data?.charts?.sfaVendorsShare?.map((item: any) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.name}</span>
                  <span className="text-slate-600">{item.count} accounts</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0033BF] rounded-full"
                    style={{
                      width: `${data.kpis.totalCompanies > 0 ? (item.count / data.kpis.totalCompanies) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report 2: Geographic Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Prospects by Country / Operating Market
            </h3>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>

          <div className="space-y-3">
            {data?.charts?.prospectsByCountry?.map((item: any) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.name}</span>
                  <span className="text-slate-600">{item.count} accounts</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{
                      width: `${data.kpis.totalCompanies > 0 ? (item.count / data.kpis.totalCompanies) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report 3: Industry Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Industry Segmentation</h3>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="space-y-3">
            {data?.charts?.prospectsByIndustry?.map((item: any) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.name}</span>
                  <span className="text-slate-600">{item.count} accounts</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${data.kpis.totalCompanies > 0 ? (item.count / data.kpis.totalCompanies) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report 4: Qualification & Conversion Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Outreach Conversion Funnel</h3>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600 font-medium">1. Contacts Reached</span>
              <span className="font-bold text-slate-900">{data?.kpis?.contactsReached || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600 font-medium">2. Positive Responses</span>
              <span className="font-bold text-emerald-600">{data?.kpis?.positiveResponses || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600 font-medium">3. Discovery Meetings Booked</span>
              <span className="font-bold text-purple-600">{data?.kpis?.meetingsBooked || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600 font-medium">4. Demos Completed</span>
              <span className="font-bold text-blue-600">{data?.kpis?.demosCompleted || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600 font-medium">5. Deals Won</span>
              <span className="font-bold text-emerald-700">{data?.kpis?.dealsWon || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
