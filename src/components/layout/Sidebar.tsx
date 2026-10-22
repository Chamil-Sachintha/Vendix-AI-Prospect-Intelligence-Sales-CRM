"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Users2,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();

  const navItems = [
    { label: "Prospects", href: "/", icon: Users2 },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 bg-white border-r border-slate-200 flex flex-col ${
        sidebarCollapsed ? "w-20" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 min-w-9 rounded-xl bg-gradient-to-tr from-[#0033BF] to-[#2768FF] flex items-center justify-center text-white font-bold shadow-xs">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-sm leading-tight">
                VENDIX AI
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Prospect Tracker
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
              ? pathname === "/" || pathname === "/prospects" || pathname.startsWith("/companies")
              : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive
                  ? "bg-[#0033BF] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4.5 w-4.5 min-w-4.5 ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer Pill */}
      {!sidebarCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          <div className="font-semibold text-slate-700 text-[11px] mb-0.5">
            Vendix AI (Pvt) Ltd
          </div>
          <p className="text-[10px] text-slate-400">
            Internal SFA Prospect Database
          </p>
        </div>
      )}
    </aside>
  );
}
