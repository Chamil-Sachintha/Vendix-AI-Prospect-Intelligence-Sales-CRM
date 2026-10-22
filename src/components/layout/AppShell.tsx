"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Sidebar } from "./Sidebar";
import { QuickAddModal } from "../modals/QuickAddModal";

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

function ShellInner({ children, fullWidth = false }: AppShellProps) {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "pl-20" : "pl-60"
        }`}
      >
        <div className={fullWidth ? "p-3 sm:px-4 lg:px-5 py-4 w-full" : "p-6 md:p-8 max-w-7xl mx-auto"}>
          {children}
        </div>
      </main>
      <QuickAddModal />
    </div>
  );
}

export function AppShell({ children, fullWidth = false }: AppShellProps) {
  return (
    <AppProvider>
      <ShellInner fullWidth={fullWidth}>{children}</ShellInner>
    </AppProvider>
  );
}
