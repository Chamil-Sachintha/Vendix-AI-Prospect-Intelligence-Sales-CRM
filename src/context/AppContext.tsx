"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, PERMISSIONS } from "@/lib/auth";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  permissions: typeof PERMISSIONS["ADMIN"];
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  openQuickAddModal: (type?: "company" | "contact" | "outreach" | "task" | "signal" | "opportunity") => void;
  closeQuickAddModal: () => void;
  activeQuickAdd: "company" | "contact" | "outreach" | "task" | "signal" | "opportunity" | null;
  overdueCount: number;
  refreshNotifications: () => void;
}

const defaultUser: UserProfile = {
  id: "admin-default",
  name: "Chamil Sachintha",
  email: "chamil@vendix.ai",
  role: "ADMIN",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
};

const AppContext = createContext<AppContextType>({
  currentUser: defaultUser,
  allUsers: [defaultUser],
  setCurrentUser: () => {},
  permissions: PERMISSIONS.ADMIN,
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  openQuickAddModal: () => {},
  closeQuickAddModal: () => {},
  activeQuickAdd: null,
  overdueCount: 0,
  refreshNotifications: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultUser);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([defaultUser]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeQuickAdd, setActiveQuickAdd] = useState<
    "company" | "contact" | "outreach" | "task" | "signal" | "opportunity" | null
  >(null);
  const [overdueCount, setOverdueCount] = useState(0);

  // Load active user and all users on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
        if (data.allUsers && data.allUsers.length > 0) {
          setAllUsers(data.allUsers);
        }
      })
      .catch((err) => console.error("Failed to load user:", err));

    refreshNotifications();
  }, []);

  const refreshNotifications = () => {
    fetch("/api/activities?filter=overdue")
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
          setOverdueCount(data.tasks.length);
        }
      })
      .catch(() => {});
  };

  const permissions = PERMISSIONS[currentUser.role] || PERMISSIONS.BUSINESS_DEVELOPMENT;

  const openQuickAddModal = (type = "company") => {
    setActiveQuickAdd(type as any);
  };

  const closeQuickAddModal = () => {
    setActiveQuickAdd(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        permissions,
        sidebarCollapsed,
        setSidebarCollapsed,
        openQuickAddModal,
        closeQuickAddModal,
        activeQuickAdd,
        overdueCount,
        refreshNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
