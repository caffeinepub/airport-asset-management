import { Button } from "@/components/ui/button";
import { BarChart3, Package, Plane, Shield } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const features = [
    {
      icon: Package,
      title: "Asset Tracking",
      desc: "Complete lifecycle management for all airport assets",
    },
    {
      icon: BarChart3,
      title: "Live Dashboard",
      desc: "Real-time statistics and status across all categories",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      desc: "Secure permissions for admin, managers, and staff",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 sidebar-texture flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
            <Plane className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-sidebar-foreground text-base">
              AeroTrack
            </p>
            <p className="text-xs text-sidebar-foreground/50">
              Airport Asset Management
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-sidebar-foreground leading-tight mb-3">
              Manage every asset,
              <br />
              <span className="text-sidebar-primary">intelligently.</span>
            </h2>
            <p className="text-sidebar-foreground/60 text-sm leading-relaxed max-w-sm">
              A unified platform for tracking procurement assets, scheduling
              maintenance, managing assignments, and conducting inspections
              across your airport operations.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sidebar-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-sidebar-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sidebar-foreground">
                      {f.title}
                    </p>
                    <p className="text-xs text-sidebar-foreground/55">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-sidebar-foreground/30">
          Secured by Internet Computer Protocol
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mb-4">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              AeroTrack
            </h1>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                Sign in
              </h2>
              <p className="text-sm text-muted-foreground">
                Use your Internet Identity to access the system securely.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your identity is cryptographically secured. No passwords stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
