"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Bell, Package, AlertTriangle, Info, CheckCheck, 
  CreditCard, Settings, Calendar, ArrowRight, BellOff
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, markAsRead, markAllAsRead, type AppNotification } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const isMountedRef = useRef(true);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      if (!isMountedRef.current) return;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    setMounted(true);
    loadNotifications();
    
    const interval = setInterval(loadNotifications, 30000);
    
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: number, link?: string | null) => {
    try {
      await markAsRead(id);
      loadNotifications();
      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "order": return <Package className="w-4 h-4 text-emerald-500" />;
      case "stock": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "payment": return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "alert": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "system": return <Settings className="w-4 h-4 text-slate-500" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatRelativeTime = (date: string | Date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Reciente";
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diffInSeconds < 60) return "ahora mismo";
      if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
      if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
      return d.toLocaleDateString();
    } catch (e) {
      return "Reciente";
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--on-surface-variant)]">
        <Bell className="w-5 h-5 opacity-20" />
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {/* 
        S1: Use native children for DropdownMenuTrigger to avoid any ambiguity with render props.
      */}
      <DropdownMenuTrigger>
        <button 
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)] transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
        >
          <div className="relative flex items-center justify-center pointer-events-none">
            <Bell className={cn("w-5 h-5", unreadCount > 0 && "animate-tada")} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-[380px] p-0 border-none shadow-2xl rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 z-50"
      >
        {/* 
          P3: Use standard div instead of DropdownMenuLabel to avoid MenuGroupRootContext issues (Base UI Error #31).
        */}
        <div className="p-4 bg-white border-b border-[var(--outline-variant)]/20 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-widest text-[var(--on-surface)]">
            Notificaciones
          </span>
          {unreadCount > 0 && (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
              className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition-colors flex items-center"
            >
              <CheckCheck className="w-3 h-3 mr-1.5" />
              Marcar todas
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[420px]">
          <div className="py-1">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <DropdownMenuItem 
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.link)}
                  className={cn(
                    "flex gap-4 p-4 cursor-pointer border-b border-[var(--outline-variant)]/5 last:border-0 transition-colors focus:bg-[var(--surface-container-low)] outline-none",
                    !n.isRead && "bg-[var(--primary)]/[0.02]"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white",
                    n.type === 'order' ? 'bg-emerald-50' : 
                    n.type === 'stock' ? 'bg-amber-50' : 
                    n.type === 'alert' ? 'bg-red-50' : 'bg-slate-50'
                  )}>
                    {renderIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm leading-none",
                        n.isRead ? "text-[var(--on-surface-variant)] font-medium" : "text-[var(--on-surface)] font-bold"
                      )}>
                        {n.title}
                      </p>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)] line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-[var(--outline)] font-medium flex items-center">
                        <Calendar className="w-3 h-3 mr-1 opacity-50" />
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] p-8 text-center gap-4">
                <BellOff className="w-12 h-12 text-[var(--outline)] opacity-10" />
                <div>
                  <p className="text-sm font-bold text-[var(--on-surface)]">Sin novedades</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1">Todo está al día por ahora.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 bg-[var(--surface-container-lowest)] border-t border-[var(--outline-variant)]/20">
          <button 
            type="button"
            className="w-full h-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--outline)] hover:text-[var(--primary)] transition-colors rounded-lg flex items-center justify-center"
            onClick={() => {
              setIsOpen(false);
              router.push("/dashboard");
            }}
          >
            Ir al Dashboard
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
