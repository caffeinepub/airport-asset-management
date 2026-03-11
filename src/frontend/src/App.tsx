import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { InternalRole } from "./backend";
import { AppSidebar } from "./components/AppSidebar";
import { FullPageLoader } from "./components/LoadingState";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile } from "./hooks/useQueries";
import { AssetDetailPage } from "./pages/AssetDetailPage";
import { AssetsPage } from "./pages/AssetsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SetupProfilePage } from "./pages/SetupProfilePage";
import { UserManagementPage } from "./pages/UserManagementPage";

type Page = "dashboard" | "assets" | "settings";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedAssetId, setSelectedAssetId] = useState<bigint | null>(null);

  // Loading states
  if (isInitializing) {
    return <FullPageLoader />;
  }

  // Not logged in
  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Profile loading
  if (profileLoading) {
    return <FullPageLoader />;
  }

  // No profile yet — show setup
  if (!profile) {
    return (
      <>
        <SetupProfilePage />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  const userRole = profile.role as InternalRole;
  const isAdmin = userRole === InternalRole.systemAdmin;

  function handleNavigate(page: Page) {
    setCurrentPage(page);
    setSelectedAssetId(null);
  }

  function handleNavigateToAsset(id: bigint) {
    setSelectedAssetId(id);
  }

  function handleBackFromAsset() {
    setSelectedAssetId(null);
  }

  function renderContent() {
    // Asset detail view
    if (selectedAssetId !== null) {
      return (
        <AssetDetailPage
          assetId={selectedAssetId}
          userRole={userRole}
          onBack={handleBackFromAsset}
        />
      );
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            onNavigateToAssets={() => handleNavigate("assets")}
            onNavigateToAsset={handleNavigateToAsset}
          />
        );
      case "assets":
        return (
          <AssetsPage
            userRole={userRole}
            onNavigateToAsset={handleNavigateToAsset}
          />
        );
      case "settings":
        if (!isAdmin) {
          return (
            <DashboardPage
              onNavigateToAssets={() => handleNavigate("assets")}
              onNavigateToAsset={handleNavigateToAsset}
            />
          );
        }
        return <UserManagementPage />;
      default:
        return (
          <DashboardPage
            onNavigateToAssets={() => handleNavigate("assets")}
            onNavigateToAsset={handleNavigateToAsset}
          />
        );
    }
  }

  return (
    <>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <AppSidebar
          currentPage={selectedAssetId !== null ? "assets" : currentPage}
          onNavigate={handleNavigate}
          userName={profile.name}
          userRole={userRole}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="h-14 border-b border-border bg-card/80 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {selectedAssetId !== null
                  ? "Asset Detail"
                  : currentPage === "dashboard"
                    ? "Dashboard"
                    : currentPage === "assets"
                      ? "Asset Inventory"
                      : "User Management"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground leading-none">
                  {profile.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {userRole === InternalRole.systemAdmin
                    ? "System Admin"
                    : userRole === InternalRole.financeManager
                      ? "Finance Manager"
                      : userRole === InternalRole.airportManager
                        ? "Airport Manager"
                        : "Procurement Officer"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-xs font-bold text-primary">
                  {profile.name[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground/50">
                © {new Date().getFullYear()}. Built with love using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-muted-foreground transition-colors underline underline-offset-2"
                >
                  caffeine.ai
                </a>
              </p>
            </footer>
          </main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </>
  );
}
