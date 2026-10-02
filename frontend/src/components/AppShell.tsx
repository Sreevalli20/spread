import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

interface AppShellProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function AppShell({ children, showSidebar = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {showSidebar && (
        <>
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <div className="hidden lg:block pl-64">
            {children}
          </div>
        </>
      )}

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileNav />
        <div className="pt-16">
          {children}
        </div>
      </div>

      {/* No Sidebar (for landing page) */}
      {!showSidebar && (
        <div className="lg:hidden">
          <MobileNav />
          <div className="pt-16">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
