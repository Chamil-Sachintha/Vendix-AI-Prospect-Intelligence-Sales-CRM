"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Plus,
  ChevronDown,
  X,
  Users2,
  Building2,
} from "lucide-react";

export function TopBar() {
  const router = useRouter();
  const {
    currentUser,
    allUsers,
    setCurrentUser,
    sidebarCollapsed,
    openQuickAddModal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search prospects
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/companies?search=${encodeURIComponent(searchQuery.trim())}&limit=8`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.companies || []);
          setShowSearchDropdown(true);
        })
        .catch(() => {});
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 flex items-center justify-between px-6 ${
        sidebarCollapsed ? "left-20" : "left-60"
      }`}
    >
      {/* Quick Search */}
      <div ref={searchRef} className="relative w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search prospects, contacts, SFA software..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults) setShowSearchDropdown(true);
            }}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100 border border-transparent focus:bg-white focus:border-[#0033BF] focus:outline-none transition-all"
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
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Dropdown */}
        {showSearchDropdown && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-72 overflow-y-auto z-50 p-2 text-xs">
            {searchResults.length > 0 ? (
              searchResults.map((c: any) => {
                const contact = c.contacts?.[0];
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery("");
                      router.push(`/companies/${c.id}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-[#0033BF]">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {contact ? `${contact.fullName} (${contact.jobTitle})` : c.industry} • {c.country}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {c.prospectStatus || "New"}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-slate-400">
                No matching prospects found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Add Prospect Action */}
        <button
          onClick={() => openQuickAddModal("company")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Prospect</span>
        </button>

        {/* User Switcher */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                {currentUser.role.replace("_", " ")}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 text-xs">
                <div className="font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
              </div>
              <div className="p-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Active Persona
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
