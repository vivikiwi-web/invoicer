import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  FileText,
  Users,
  Receipt,
  Wallet,
  Package,
  BarChart3,
  Settings,
} from "lucide-react";

export interface NavItem {
  to: string;
  icon: LucideIcon;
  labelKey: string;
}

export const NAV: NavItem[] = [
  { to: "/dashboard", icon: LayoutGrid, labelKey: "dashboard" },
  { to: "/invoices", icon: FileText, labelKey: "invoices" },
  { to: "/clients", icon: Users, labelKey: "clients" },
  { to: "/expenses", icon: Receipt, labelKey: "expenses" },
  { to: "/payments", icon: Wallet, labelKey: "payments" },
  { to: "/items", icon: Package, labelKey: "items" },
  { to: "/reports", icon: BarChart3, labelKey: "reports" },
];

export const SETTINGS_NAV: NavItem = {
  to: "/settings",
  icon: Settings,
  labelKey: "settings",
};
