"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Target,
  Building2,
  Users,
  ShieldAlert,
  Flame,
  Kanban,
  CalendarCheck,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, overdueCount } = useApp();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Prospects", href: "/prospects", icon: Target },
    { label: "Companies", href: "/companies", icon: Building2 },
    { label: "Contacts & Leaders", href: "/contacts", icon: Users },
    { label: "Competitor Intelligence", href: "/competitors", icon: ShieldAlert },
    { label: "Buying Intent", href: "/intent", icon: Flame },
    { label: "Sales Pipeline", href: "/pipeline", icon: Kanban },
    {
      label: "Activities & Follow-ups",
      href: "/activities",
      icon: CalendarCheck,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { label: "Import / Export", href: "/import-export", icon: FileSpreadsheet },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 bg-white border-r border-slate-200 flex flex-col ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 min-w-10 rounded-xl bg-gradient-to-tr from-[#0033BF] to-[#2768FF] flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-base leading-tight">
                VENDIX AI
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase">
                Prospect Intel
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                isActive
                  ? "bg-[#0033BF] text-white shadow-sm shadow-[#0033BF]/30 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 min-w-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                }`}
              />
              {!sidebarCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {item.badge !== undefined && !sidebarCollapsed && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-rose-500 text-white"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {item.badge !== undefined && sidebarCollapsed && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Sri Lanka & Global Flag Pill */}
      {!sidebarCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
            <span>SFA Intelligence</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              v1.0 Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Sri Lanka & Global B2B coverage with live intent scoring.
          </p>
        </div>
      )}
    </aside>
  );
}
