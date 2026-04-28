import React, { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { User, LogOut, Settings, Moon, Sun, History, BookOpen } from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";

export default function UserMenu() {
  const [showSettings, setShowSettings] = useState(false);
  const [queueSleep, setQueueSleep] = useState(500);
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("aiorreal_settings");
    if (saved) {
      const settings = JSON.parse(saved);
      setQueueSleep(settings.queue_sleep_ms || 500);
    }
  }, []);

  const handleQueueSleepChange = (value) => {
    const numValue = parseInt(value) || 500;
    setQueueSleep(numValue);
    const saved = localStorage.getItem("aiorreal_settings");
    const settings = saved ? JSON.parse(saved) : {};
    localStorage.setItem("aiorreal_settings", JSON.stringify({ ...settings, queue_sleep_ms: numValue }));
  };

  const handleLogout = async () => {
    await apiClient.auth.logout();
  };

  if (!isAuthenticated || !user) return null;

  const isAdmin = user?.role === "admin";

  return (
    <DropdownMenu open={showSettings} onOpenChange={setShowSettings}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col space-y-1 py-2">
          <p className="text-sm font-medium">{user.full_name || user.email}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem onClick={() => navigate("/history")} className="cursor-pointer">
          <History className="w-4 h-4 mr-2" />
          <span>History</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/examples")} className="cursor-pointer">
          <BookOpen className="w-4 h-4 mr-2" />
          <span>Examples</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Admin Settings */}
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Queue Processing Time */}
        <div className="px-2 py-3 space-y-2 border-t">
          <p className="text-xs font-semibold text-muted-foreground">Queue Sleep (ms)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="100"
              step="100"
              value={queueSleep}
              onChange={(e) => handleQueueSleepChange(e.target.value)}
              className="flex h-8 w-16 rounded border border-input bg-background px-2 py-1 text-xs"
            />
            <span className="text-xs text-muted-foreground">{queueSleep}ms</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Delay between queue items</p>
        </div>

        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
