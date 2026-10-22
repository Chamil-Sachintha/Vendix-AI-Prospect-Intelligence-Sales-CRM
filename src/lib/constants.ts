export const PROSPECT_STATUSES = [
  { id: "New", label: "New", color: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
  { id: "Researching", label: "Researching", color: "bg-sky-100 text-sky-800 border-sky-200", dot: "bg-sky-500" },
  { id: "Ready to Contact", label: "Ready to Contact", color: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" },
  { id: "Contacted", label: "Contacted", color: "bg-indigo-100 text-indigo-800 border-indigo-200", dot: "bg-indigo-500" },
  { id: "Awaiting Response", label: "Awaiting Response", color: "bg-purple-100 text-purple-800 border-purple-200", dot: "bg-purple-500" },
  { id: "Responded", label: "Responded", color: "bg-violet-100 text-violet-800 border-violet-200", dot: "bg-violet-500" },
  { id: "Interested", label: "Interested", color: "bg-teal-100 text-teal-800 border-teal-200", dot: "bg-teal-500" },
  { id: "Meeting / Demo", label: "Meeting / Demo", color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  { id: "Proposal Sent", label: "Proposal Sent", color: "bg-orange-100 text-orange-800 border-orange-200", dot: "bg-orange-500" },
  { id: "Won", label: "Won", color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  { id: "Lost", label: "Lost", color: "bg-rose-100 text-rose-800 border-rose-200", dot: "bg-rose-500" },
  { id: "Nurturing", label: "Nurturing", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  { id: "Do Not Contact", label: "Do Not Contact", color: "bg-red-100 text-red-900 border-red-200", dot: "bg-red-700" },
];

export const BRAND_COLORS = {
  primary: "#0033BF",
  deepIndigo: "#3730A3",
  darkPurple: "#26158F",
  brightBlue: "#2768FF",
  accentBlue: "#4482FF",
  bgLight: "#F8FAFC",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
};

export const USER_ROLES = [
  { id: "ADMIN", label: "Administrator", description: "Full system administration, user management, settings & competitors" },
  { id: "SALES_MANAGER", label: "Sales Manager", description: "Team oversight, pipeline management, and full reporting" },
  { id: "BUSINESS_DEVELOPMENT", label: "Business Development", description: "Manage assigned prospects, contacts, outreach & follow-ups" },
  { id: "READ_ONLY_ANALYST", label: "Read-only Analyst", description: "View-only access to intelligence, pipeline and reports" },
];

export const DEFAULT_PIPELINE_STAGES = [
  { order: 1, name: "New Prospect", color: "#64748B", definition: "Uncontacted lead added from research or inbound", isWon: false, isLost: false },
  { order: 2, name: "Researching", color: "#0284C7", definition: "Active research on tech stack, leadership & field ops", isWon: false, isLost: false },
  { order: 3, name: "Qualified", color: "#0EA5E9", definition: "Confirmed fit for field sales, van sales or distribution automation", isWon: false, isLost: false },
  { order: 4, name: "Contact Identified", color: "#3B82F6", definition: "Decision maker (Sales Director, Head of Ops, CIO) identified", isWon: false, isLost: false },
  { order: 5, name: "Contacted", color: "#2563EB", definition: "Initial outreach sent via email, phone or LinkedIn", isWon: false, isLost: false },
  { order: 6, name: "Awaiting Response", color: "#6366F1", definition: "Follow-up cadence active, awaiting prospect reply", isWon: false, isLost: false },
  { order: 7, name: "Responded", color: "#8B5CF6", definition: "Prospect replied with interest or inquiry", isWon: false, isLost: false },
  { order: 8, name: "Discovery Meeting Booked", color: "#A855F7", definition: "Introductory discovery session scheduled with sales team", isWon: false, isLost: false },
  { order: 9, name: "Discovery Completed", color: "#D946EF", definition: "Operational requirements and pain points gathered", isWon: false, isLost: false },
  { order: 10, name: "Demo Scheduled", color: "#EC4899", definition: "Tailored Vendix SFA demonstration on calendar", isWon: false, isLost: false },
  { order: 11, name: "Demo Completed", color: "#F43F5E", definition: "Vendix SFA platform presented to stakeholders", isWon: false, isLost: false },
  { order: 12, name: "Proposal Sent", color: "#F97316", definition: "Formal commercial proposal and implementation plan submitted", isWon: false, isLost: false },
  { order: 13, name: "Negotiation", color: "#EAB308", definition: "Final contract terms, user tiers and pricing discussion", isWon: false, isLost: false },
  { order: 14, name: "Won", color: "#10B981", definition: "Deal closed and contract signed", isWon: true, isLost: false },
  { order: 15, name: "Lost", color: "#EF4444", definition: "Opportunity closed-lost with documented reason", isWon: false, isLost: true },
  { order: 16, name: "Nurturing", color: "#94A3B8", definition: "Not ready currently; periodic check-in cadence", isWon: false, isLost: false },
];

export const OUTREACH_STATUSES = [
  "Not Contacted",
  "Ready to Contact",
  "Contacted",
  "Awaiting Response",
  "Positive Response",
  "Neutral Response",
  "Negative Response",
  "Follow-up Required",
  "Meeting Booked",
  "Do Not Contact",
];

export const OUTREACH_CHANNELS = [
  "EMAIL",
  "PHONE",
  "LINKEDIN",
  "WHATSAPP",
  "MEETING",
  "EVENT",
  "OTHER",
];

export const DEFAULT_SCORING_WEIGHTS = {
  sfaReplacementProject: 25,
  softwareDissatisfaction: 20,
  competitorImplementationOrEval: 15,
  targetProfileFit: 15,
  fieldSalesExpansion: 10,
  contentEngagement: 10,
  demoOrPricingRequest: 25,
  decayMonthsThreshold: 12,
  highIntentThreshold: 65,
  mediumIntentThreshold: 35,
};

export const RELEVANT_DECISION_MAKER_ROLES = [
  "CEO / Managing Director",
  "COO",
  "Sales Director",
  "National Sales Manager",
  "Head of Sales Operations",
  "Distribution Manager",
  "Commercial Director",
  "CIO / CTO",
  "IT Manager",
  "Procurement Manager",
  "Digital Transformation Lead",
  "General Manager",
  "Supply Chain Director",
];

export const CURRENCIES = ["LKR", "USD", "EUR", "GBP", "AED"];
