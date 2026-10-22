"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Building2, Users, CalendarCheck, AlertCircle, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { PROSPECT_STATUSES } from "@/lib/constants";

interface ProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null; // If editing an existing prospect
}

export function ProspectModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ProspectModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    // Section 1: Company Details
    name: "",
    website: "",
    logoUrl: "",
    industry: "FMCG & Retail",
    country: "Sri Lanka",
    companySize: "100-500",
    currentSfaProvider: "",
    currentSfaStatus: "Confirmed",
    sfaSourceUrl: "",

    // Section 2: Decision-Maker Details
    decisionMakerName: "",
    decisionMakerJobTitle: "",
    contactEmail: "",
    contactPhone: "",
    linkedinUrl: "",

    // Section 3: Prospect Tracking
    prospectStatus: "New",
    lastContactedAt: "",
    nextFollowUpDate: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      const primaryContact = initialData.contacts?.find((c: any) => c.isPrimary) || initialData.contacts?.[0];
      setForm({
        name: initialData.name || "",
        website: initialData.website || "",
        logoUrl: initialData.logoUrl || "",
        industry: initialData.industry || "FMCG & Retail",
        country: initialData.country || "Sri Lanka",
        companySize: initialData.employeeRange || initialData.sizeCategory || "",
        currentSfaProvider: initialData.currentSfaProvider || initialData.softwareRecords?.[0]?.productName || "",
        currentSfaStatus: initialData.currentSfaStatus || "Confirmed",
        sfaSourceUrl: initialData.sfaSourceUrl || initialData.softwareRecords?.[0]?.evidenceUrl || "",

        decisionMakerName: primaryContact?.fullName || "",
        decisionMakerJobTitle: primaryContact?.jobTitle || "",
        contactEmail: primaryContact?.businessEmail || "",
        contactPhone: primaryContact?.businessPhone || "",
        linkedinUrl: primaryContact?.linkedinUrl || "",

        prospectStatus: initialData.prospectStatus || "New",
        lastContactedAt: initialData.lastContactedAt
          ? new Date(initialData.lastContactedAt).toISOString().slice(0, 10)
          : "",
        nextFollowUpDate: initialData.nextFollowUpDate
          ? new Date(initialData.nextFollowUpDate).toISOString().slice(0, 10)
          : "",
        notes: initialData.notes || "",
      });
    } else {
      setForm({
        name: "",
        website: "",
        logoUrl: "",
        industry: "FMCG & Retail",
        country: "Sri Lanka",
        companySize: "100-500",
        currentSfaProvider: "",
        currentSfaStatus: "Confirmed",
        sfaSourceUrl: "",

        decisionMakerName: "",
        decisionMakerJobTitle: "",
        contactEmail: "",
        contactPhone: "",
        linkedinUrl: "",

        prospectStatus: "New",
        lastContactedAt: "",
        nextFollowUpDate: "",
        notes: "",
      });
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    // For SVGs, read as data URL directly
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
      return;
    }

    // For raster images, optimize & resize using canvas to keep database snappy
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/webp", 0.9);
          setForm((prev) => ({ ...prev, logoUrl: dataUrl }));
        } else {
          setForm((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg("Company Name is required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const isEdit = Boolean(initialData?.id);
      const url = isEdit ? `/api/companies/${initialData.id}` : "/api/companies";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save prospect");

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {initialData ? `Edit Prospect: ${initialData.name}` : "Add New Prospect"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* SECTION 1: COMPANY DETAILS */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs pb-1 border-b border-slate-100">
              <Building2 className="h-4 w-4 text-[#0033BF]" />
              1. Company Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceylon Cold Stores PLC"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Industry</label>
                <input
                  type="text"
                  placeholder="e.g. FMCG & Beverages"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. Sri Lanka"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Company Logo</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />

                {form.logoUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70">
                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.logoUrl}
                        alt="Logo Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">Logo attached</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {form.logoUrl.startsWith("data:") ? "Uploaded image file" : form.logoUrl}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, logoUrl: "" });
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove logo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-[#0033BF] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all text-center group"
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs group-hover:scale-105 transition-transform text-[#0033BF]">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        Click to upload company logo
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Supports PNG, JPG, WebP, SVG (Auto-resized for fast loading)
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[11px] text-[#0033BF] hover:underline font-medium cursor-pointer"
                      >
                        {showUrlInput ? "Hide image URL field" : "Or enter image URL"}
                      </button>
                    </div>

                    {showUrlInput && (
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={form.logoUrl}
                        onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company Size (Employee / Rep Range)</label>
                <input
                  type="text"
                  placeholder="e.g. 500-1000 employees, 250 van reps"
                  value={form.companySize}
                  onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current SFA / Software Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Bizom, FieldAssist, Legacy In-House SFA"
                  value={form.currentSfaProvider}
                  onChange={(e) => setForm({ ...form, currentSfaProvider: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current Software Status</label>
                <select
                  value={form.currentSfaStatus}
                  onChange={(e) => setForm({ ...form, currentSfaStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-[#0033BF] focus:outline-none"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Previously Used">Previously Used</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">SFA Evidence Source URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/... or link to press release / RFP"
                  value={form.sfaSourceUrl}
                  onChange={(e) => setForm({ ...form, sfaSourceUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DECISION-MAKER DETAILS */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs pb-1 border-b border-slate-100">
              <Users className="h-4 w-4 text-indigo-600" />
              2. Primary Decision-Maker
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mahesh Jayasinghe"
                  value={form.decisionMakerName}
                  onChange={(e) => setForm({ ...form, decisionMakerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Head of Commercial & Sales Operations"
                  value={form.decisionMakerJobTitle}
                  onChange={(e) => setForm({ ...form, decisionMakerJobTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Email</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PROSPECT TRACKING */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs pb-1 border-b border-slate-100">
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
              3. Status & Follow-up Tracking
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Prospect Status</label>
                <select
                  value={form.prospectStatus}
                  onChange={(e) => setForm({ ...form, prospectStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-[#0033BF] focus:outline-none"
                >
                  {PROSPECT_STATUSES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Last Contacted Date</label>
                <input
                  type="date"
                  value={form.lastContactedAt}
                  onChange={(e) => setForm({ ...form, lastContactedAt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={form.nextFollowUpDate}
                  onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">Notes / Relationship Details</label>
                <textarea
                  rows={3}
                  placeholder="Key notes, current dissatisfaction, last conversation takeaways..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0033BF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white font-semibold transition-colors shadow-xs"
            >
              {loading ? "Saving..." : initialData ? "Save Changes" : "Add Prospect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
