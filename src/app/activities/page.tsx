"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  CalendarCheck,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  Users,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function ActivitiesPage() {
  const { openQuickAddModal, currentUser, refreshNotifications } = useApp();

  const [activeTab, setActiveTab] = useState<
    "today" | "overdue" | "week" | "upcoming" | "completed" | "outreach"
  >("today");

  const [tasks, setTasks] = useState<any[]>([]);
  const [outreaches, setOutreaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = () => {
    setLoading(true);
    const filterQuery = activeTab === "outreach" ? "all" : activeTab;
    fetch(`/api/activities?filter=${filterQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) setTasks(data.tasks);
        if (data.outreaches) setOutreaches(data.outreaches);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActivities();
  }, [activeTab]);

  const handleToggleComplete = async (taskId: string, currentVal: boolean) => {
    await fetch(`/api/activities/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isCompleted: !currentVal,
        actorName: currentUser.name,
      }),
    });
    refreshNotifications();
    fetchActivities();
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Activities, Follow-ups & Reminders
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Daily task management, customer touchpoints, and scheduled commitments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openQuickAddModal("outreach")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Log Outreach
          </button>
          <button
            onClick={() => openQuickAddModal("task")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0033BF] hover:bg-[#2768FF] text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 mb-6 overflow-x-auto text-xs pb-1">
        {[
          { id: "today", label: "Due Today" },
          { id: "overdue", label: "Overdue Alerts" },
          { id: "week", label: "Due This Week" },
          { id: "upcoming", label: "Upcoming" },
          { id: "completed", label: "Completed History" },
          { id: "outreach", label: "Outreach Touches Log" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2.5 px-4 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-[#0033BF] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TASKS VIEW */}
      {activeTab !== "outreach" && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isOverdue = new Date(task.dueDate) < new Date() && !task.isCompleted;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-white border shadow-xs transition-all flex items-start justify-between gap-4 text-xs ${
                  isOverdue ? "border-rose-200 bg-rose-50/20" : "border-slate-200/80"
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleToggleComplete(task.id, task.isCompleted)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      task.isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 hover:border-emerald-600 hover:bg-emerald-50 text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>

                  <div>
                    <div
                      className={`text-sm font-bold ${
                        task.isCompleted
                          ? "line-through text-slate-400"
                          : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-1 text-[11px]">
                      {task.company && (
                        <Link
                          href={`/companies/${task.company.id}`}
                          className="font-semibold text-[#0033BF] hover:underline"
                        >
                          {task.company.name}
                        </Link>
                      )}
                      {task.contact && <span>• Contact: {task.contact.fullName}</span>}
                      <span>• Type: {task.type}</span>
                    </div>

                    {task.notes && (
                      <p className="text-slate-600 mt-2 text-xs bg-slate-50 p-2 rounded-lg">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      task.isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : isOverdue
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-[#0033BF]"
                    }`}
                  >
                    {task.isCompleted
                      ? "Done"
                      : isOverdue
                      ? "Overdue"
                      : new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Priority: {task.priority}
                  </div>
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && !loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              No tasks found in this view. Use "Schedule Follow-up" to add one!
            </div>
          )}
        </div>
      )}

      {/* OUTREACH LOG VIEW */}
      {activeTab === "outreach" && (
        <div className="space-y-3">
          {outreaches.map((outreach) => (
            <div
              key={outreach.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {outreach.company?.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {outreach.channel}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      outreach.outreachStatus === "POSITIVE_RESPONSE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-[#0033BF]"
                    }`}
                  >
                    {outreach.outreachStatus}
                  </span>
                </div>

                <span className="text-slate-400 text-[11px]">
                  {new Date(outreach.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-slate-700">{outreach.messageSummary}</p>

              {outreach.nextAction && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-[#0033BF] flex items-center justify-between">
                  <div>
                    <span className="font-bold">Next Action: </span>
                    {outreach.nextAction}
                  </div>
                  {outreach.nextFollowUpDate && (
                    <span>Due: {new Date(outreach.nextFollowUpDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
