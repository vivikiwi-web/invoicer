import { Navigate, createBrowserRouter, Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Landing from "@/pages/Landing";
import PricingPage from "@/pages/PricingPage";
import { LegalPage } from "@/pages/LegalPage";
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
import { PublicLocaleSync } from "@/components/seo/PublicLocaleSync";
import { CookieBanner, CookiePreferences } from "@/components/consent/CookieBanner";
import { AnalyticsBridge } from "@/components/analytics/AnalyticsBridge";

function RootLayout() {
  return (
    <>
      <PublicLocaleSync>
        <Outlet />
      </PublicLocaleSync>
      <CookieBanner />
      <CookiePreferences />
      <AnalyticsBridge />
    </>
  );
}

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
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/en", element: <Landing /> },
      { path: "/kainos", element: <PricingPage /> },
      { path: "/en/pricing", element: <PricingPage /> },
      { path: "/privatumo-politika", element: <LegalPage page="privacy" /> },
      { path: "/en/privacy-policy", element: <LegalPage page="privacy" /> },
      { path: "/slapuku-politika", element: <LegalPage page="cookies" /> },
      { path: "/en/cookie-policy", element: <LegalPage page="cookies" /> },
      { path: "/naudojimosi-taisykles", element: <LegalPage page="terms" /> },
      { path: "/en/terms", element: <LegalPage page="terms" /> },
      { path: "/apmokejimo-salygos", element: <LegalPage page="billing" /> },
      { path: "/en/billing", element: <LegalPage page="billing" /> },
      { path: "/grazinimo-politika", element: <LegalPage page="refund" /> },
      { path: "/en/refund-policy", element: <LegalPage page="refund" /> },
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
    ],
  },
]);
