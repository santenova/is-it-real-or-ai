import { Outlet, Link, useLocation } from "react-router-dom";
import { ScanEye, Info, Sparkles, History, Terminal, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import UserMenu from "./UserMenu";
import { useAuth } from "../../lib/AuthContext";
import LmsConfigPopover from "./LmsConfigPopover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const moreItems = [
  { path: "/history", label: "History", icon: History },
  { path: "/analysis-logs", label: "Pipeline Logs", icon: Terminal },
  { path: "/about", label: "About", icon: Info },
];

export default function AppLayout() {
  const location = useLocation();

  const moreActive = moreItems.some((i) => i.path === location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Real or <span className="text-primary">AI</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === "/"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <ScanEye className="w-4 h-4" />
                <span className="hidden sm:inline">Analyze</span>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      moreActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="hidden sm:inline">More</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {moreItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <LmsConfigPopover />
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
