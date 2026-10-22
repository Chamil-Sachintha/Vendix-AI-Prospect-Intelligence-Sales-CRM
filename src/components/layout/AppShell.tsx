"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Sidebar } from "./Sidebar";
import { QuickAddModal } from "../modals/QuickAddModal";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "pl-20" : "pl-60"
        }`}
      >
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
      <QuickAddModal />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ShellInner>{children}</ShellInner>
    </AppProvider>
  );
}
