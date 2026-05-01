"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/app/actions/notifications";

export function NotificationsBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [tooltipText, setTooltipText] = useState("Sin notificaciones");
  const isMountedRef = useRef(true);

  useEffect(() => {
    // P3: Guard to prevent setState on unmounted component
    isMountedRef.current = true;
    
    loadNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      
      setUnreadCount(data.unreadCount);
      
      // Build tooltip text from notifications
      if (data.notifications.length > 0) {
        const lines = data.notifications.map(n => n.message).join("\n");
        setTooltipText(lines);
      } else {
        setTooltipText("Sin notificaciones pendientes");
      }
    } catch (error) {
      // P3: Only log if component is still mounted
      if (isMountedRef.current) {
        console.error("Failed to load notifications:", error);
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)] rounded-full"
      aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
      title={tooltipText}
      onClick={() => {
        // On click, refresh notifications
        loadNotifications();
      }}
    >
      <Bell className="w-5 h-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );
}
