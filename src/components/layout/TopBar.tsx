"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";

export function TopBar() {
  const router = useRouter();
  const {
    currentUser,
    allUsers,
    setCurrentUser,
    sidebarCollapsed,
    openQuickAddModal,
    overdueCount,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setShowQuickAddMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data);
          setIsSearching(false);
          setShowSearchDropdown(true);
        })
        .catch(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load overdue tasks for notification dropdown
  const loadNotifications = () => {
    fetch("/api/activities?filter=overdue")
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
          setOverdueTasks(data.tasks);
        }
      })
      .catch(() => {});
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 flex items-center justify-between px-6 ${
        sidebarCollapsed ? "left-20" : "left-64"
      }`}
    >
      {/* Global Search Bar */}
      <div ref={searchRef} className="relative w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies, contacts, competitors, deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults) setShowSearchDropdown(true);
            }}
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-100/80 border border-transparent focus:bg-white focus:border-[#2768FF] focus:outline-none focus:ring-2 focus:ring-[#2768FF]/15 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults(null);
                setShowSearchDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Global Search Dropdown */}
        {showSearchDropdown && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[75vh] overflow-y-auto z-50">
            {/* Companies */}
            {searchResults.companies?.length > 0 && (
              <div className="p-2 border-b border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Companies
                </div>
                {searchResults.companies.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      router.push(`/companies/${c.id}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-sm transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-[#0033BF]">
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {c.industry} • {c.country}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.intentLevel === "HIGH"
                          ? "bg-emerald-100 text-emerald-700"
                          : c.intentLevel === "MEDIUM"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Intent: {c.intentScore}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Contacts */}
            {searchResults.contacts?.length > 0 && (
              <div className="p-2 border-b border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Contacts & Decision Makers
                </div>
                {searchResults.contacts.map((ct: any) => (
                  <button
                    key={ct.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      router.push(`/companies/${ct.companyId}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-sm transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-[#0033BF]">
                        {ct.fullName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ct.jobTitle} at {ct.company?.name}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">View</span>
                  </button>
                ))}
              </div>
            )}

            {/* Software records */}
            {searchResults.software?.length > 0 && (
              <div className="p-2 border-b border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Competitor SFA & Stack
                </div>
                {searchResults.software.map((sw: any) => (
                  <button
                    key={sw.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      router.push(`/companies/${sw.companyId}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-sm transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-[#0033BF]">
                        {sw.productName} ({sw.vendorName})
                      </div>
                      <div className="text-xs text-slate-500">
                        {sw.company?.name} • Status: {sw.status}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Opportunities */}
            {searchResults.opportunities?.length > 0 && (
              <div className="p-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Pipeline Opportunities
                </div>
                {searchResults.opportunities.map((opp: any) => (
                  <button
                    key={opp.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      router.push(`/companies/${opp.companyId}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-sm transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-[#0033BF]">
                        {opp.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {opp.company?.name} • Stage: {opp.stage?.name}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {opp.currency} {opp.estimatedAcv?.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchResults.companies?.length === 0 &&
              searchResults.contacts?.length === 0 &&
              searchResults.software?.length === 0 &&
              searchResults.opportunities?.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No matching records found for "{searchQuery}".
                </div>
              )}
          </div>
        )}
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        <div ref={quickAddRef} className="relative">
          <button
            onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-sm font-semibold shadow-sm shadow-[#0033BF]/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {showQuickAddMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  openQuickAddModal("company");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Building2 className="h-4 w-4 text-blue-600" />
                Add Company / Prospect
              </button>
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  openQuickAddModal("contact");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Users className="h-4 w-4 text-indigo-600" />
                Add Contact / Decision-Maker
              </button>
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  openQuickAddModal("outreach");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Log Outreach Attempt
              </button>
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  openQuickAddModal("task");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Clock className="h-4 w-4 text-amber-600" />
                Add Follow-up / Reminder
              </button>
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  openQuickAddModal("signal");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Log Buying Intent Signal
              </button>
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  openQuickAddModal("opportunity");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Create Sales Opportunity
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              if (!showNotificationMenu) loadNotifications();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {overdueCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                  {overdueCount} Overdue
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {overdueTasks.length > 0 ? (
                  overdueTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{t.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {t.company?.name} • Due: {new Date(t.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No overdue activities. You're completely caught up!
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/activities?filter=overdue"
                  onClick={() => setShowNotificationMenu(false)}
                  className="text-xs font-semibold text-[#0033BF] hover:underline"
                >
                  View All Follow-ups
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Persona Switcher */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-[#0033BF]/20">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-700">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {currentUser.role.replace("_", " ")}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.email}</div>
                <div className="mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Active Role: {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Persona Switcher for pair-programming & verification */}
              <div className="p-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Switch Active Persona (RBAC Test)
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentUser.id === u.id
                        ? "bg-slate-100 font-bold text-[#0033BF]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{u.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
