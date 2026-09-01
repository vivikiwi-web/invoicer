import { Navigate, createBrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Landing from "@/pages/Landing";
import Invoices from "@/pages/Invoices";
import InvoiceEditor from "@/pages/InvoiceEditor";
import InvoiceDetail from "@/pages/InvoiceDetail";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Expenses from "@/pages/Expenses";
import Payments from "@/pages/Payments";
import Items from "@/pages/Items";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import { useAuth } from "@/context/AuthContext";

function ProtectedShell() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  {
    path: "/login",
    element: (
      <GuestOnly>
        <Login />
      </GuestOnly>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestOnly>
        <Register />
      </GuestOnly>
    ),
  },
  {
    path: "/",
    element: <ProtectedShell />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "invoices", element: <Invoices /> },
      { path: "invoices/new", element: <InvoiceEditor /> },
      { path: "invoices/:id", element: <InvoiceDetail /> },
      { path: "invoices/:id/edit", element: <InvoiceEditor /> },
      { path: "clients", element: <Clients /> },
      { path: "clients/:id", element: <ClientDetail /> },
      { path: "expenses", element: <Expenses /> },
      { path: "payments", element: <Payments /> },
      { path: "items", element: <Items /> },
      { path: "reports", element: <Reports /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
