import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  Plane,
  Settings,
} from "lucide-react";
import { useState } from "react";
import type { InternalRole } from "../backend";
import { InternalRole as InternalRoleEnum } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { roleLabel } from "../utils/formatters";

type Page = "dashboard" | "assets" | "settings";

interface AppSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userName?: string;
  userRole?: InternalRole;
}

const navItems = [
  {
    id: "dashboard" as Page,
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    id: "assets" as Page,
    label: "Assets",
    icon: Package,
    ocid: "nav.assets.link",
  },
];

export function AppSidebar({
  currentPage,
  onNavigate,
  userName,
  userRole,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { clear } = useInternetIdentity();
  const isAdmin = userRole === InternalRoleEnum.systemAdmin;

  const allNavItems = isAdmin
    ? [
        ...navItems,
        {
          id: "settings" as Page,
          label: "User Management",
          icon: Settings,
          ocid: "nav.settings.link",
        },
      ]
    : navItems;

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full sidebar-texture transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
          <Plane className="w-4 h-4 text-sidebar-primary" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-sidebar-foreground text-sm leading-tight">
              AeroTrack
            </p>
            <p className="text-xs text-sidebar-foreground/50 leading-none">
              Asset Management
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={item.ocid}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center" : "",
                active
                  ? "bg-sidebar-primary/20 text-sidebar-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  active ? "text-sidebar-primary" : "",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-sidebar-primary/25 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-sidebar-primary">
                {userName?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {userName ?? "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {userRole ? roleLabel(userRole) : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => clear()}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-accent transition-colors z-10"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
