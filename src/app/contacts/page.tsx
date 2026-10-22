"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Users,
  Search,
  Filter,
  Check,
  Mail,
  Phone,
  Plus,
  Download,
  Building2,
  ExternalLink,
} from "lucide-react";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";

export default function ContactsPage() {
  const { openQuickAddModal } = useApp();

  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState("ALL");

  const fetchContacts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (roleFilter !== "ALL") params.append("roleInPurchasing", roleFilter);
    if (verifiedFilter === "true") params.append("isVerified", "true");
    if (verifiedFilter === "false") params.append("isVerified", "false");

    fetch(`/api/contacts?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setContacts(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, [search, roleFilter, verifiedFilter]);

  const toggleVerify = async (contactId: string, currentVal: boolean) => {
    await fetch(`/api/contacts/${contactId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !currentVal }),
    });
    fetchContacts();
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Contacts & Decision-Makers Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Key C-Level, sales leadership, and IT evaluators mapped to prospect companies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export?entity=contacts"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
          <button
            onClick={() => openQuickAddModal("contact")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leaders by name, job title, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Purchasing Roles</option>
            <option value="DECISION_MAKER">Decision-Maker</option>
            <option value="INFLUENCER">Influencer</option>
            <option value="TECHNICAL_EVALUATOR">Technical Evaluator</option>
            <option value="PROCUREMENT">Procurement</option>
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Verification</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Name & Title</th>
                <th className="py-3.5 px-4">Associated Company</th>
                <th className="py-3.5 px-4">Role in Purchasing</th>
                <th className="py-3.5 px-4">Contact Channels</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((ct) => (
                <tr key={ct.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                        {ct.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ct.avatarUrl}
                            alt={ct.fullName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-[#0033BF] text-white flex items-center justify-center font-bold text-[11px]">
                            {(ct.fullName || "DM")
                              .split(" ")
                              .map((n: string) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {ct.fullName}
                          {ct.isPrimary && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#0033BF]">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{ct.jobTitle}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Link
                      href={`/companies/${ct.companyId}`}
                      className="font-semibold text-slate-800 hover:text-[#0033BF] hover:underline"
                    >
                      {ct.company?.name}
                    </Link>
                    <div className="text-[11px] text-slate-400">
                      {ct.company?.industry} • {ct.company?.country}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                      {ct.roleInPurchasing.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {ct.businessEmail && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <a href={`mailto:${ct.businessEmail}`} className="hover:underline">
                            {ct.businessEmail}
                          </a>
                        </div>
                      )}
                      {ct.businessPhone && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <a href={`tel:${ct.businessPhone}`} className="hover:underline">
                            {ct.businessPhone}
                          </a>
                        </div>
                      )}
                      {ct.linkedinUrl && (
                        <div className="flex items-center gap-1">
                          <LinkedInIcon className="h-3 w-3 text-blue-600" />
                          <a
                            href={ct.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0033BF] hover:underline"
                          >
                            LinkedIn
                          </a>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleVerify(ct.id, ct.isVerified)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                        ct.isVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {ct.isVerified ? (
                        <>
                          <Check className="h-3 w-3" /> Verified
                        </>
                      ) : (
                        "Unverified"
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/companies/${ct.companyId}`}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                    >
                      View Account
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
