import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { useCanonicalHost, useRequireLoginHost } from "./lib/canonical-host";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AccountsPage } from "./pages/AccountsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TransactionDetailPage } from "./pages/TransactionDetailPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { TransferPage } from "./pages/TransferPage";
import { Spinner } from "./components/ui/Spinner";

/**
 * The root path shows the login when signed out and the dashboard when signed
 * in — so the login lives at "/" and no "/login" URL is ever shown. Once
 * authenticated, the user is pushed onto the app (canonical) subdomain.
 */
function RootGate() {
  const { status } = useAuth();
  useCanonicalHost(status);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-surface)]">
        <Spinner />
      </div>
    );
  }
  return status === "authenticated" ? <DashboardPage /> : <LoginPage />;
}

/**
 * App scaffold: holds the route table and the guest guard — any time the user
 * is not logged in (including right after logout), they're bounced to the
 * login subdomain.
 */
function AppScaffold() {
  const { status } = useAuth();
  useRequireLoginHost(status);

  return (
    <Routes>
      <Route path="/" element={<RootGate />} />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions/:id"
        element={
          <ProtectedRoute>
            <TransactionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <AccountsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfer"
        element={
          <ProtectedRoute>
            <TransferPage />
          </ProtectedRoute>
        }
      />
      {/* Catch-all: any unmatched path (including a stray /index.html from the
          SPA rewrite) resolves to the root instead of rendering nothing. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppScaffold />
      </AuthProvider>
    </BrowserRouter>
  );
}
