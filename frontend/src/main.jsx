import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { AppShell } from "./components/AppShell";
import { ToastViewport } from "./components/Toast";

import LandingPage      from "./pages/Landing";
import LoginPage        from "./pages/Login";
import RegisterPage     from "./pages/Register";
import DashboardPage    from "./pages/Dashboard";
import TransactionsPage from "./pages/Transactions";
import PlaceholderPage  from "./pages/Placeholder";
import NotFound         from "./pages/NotFound";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard"    element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="budget"       element={<PlaceholderPage page="budget" />} />
            <Route path="chat"         element={<PlaceholderPage page="chat" />} />
            <Route path="admin"        element={<PlaceholderPage page="admin" />} />
            <Route path="profile"      element={<PlaceholderPage page="budget" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastViewport />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
