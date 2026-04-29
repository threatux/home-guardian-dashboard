import { useEffect, useState, useCallback } from "react";
import {
  Thermometer, Droplets, Wind, Flame, DoorOpen, Activity, Bell, Check, AlertTriangle, Info, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useHomeMode } from "@/contexts/HomeModeContext";

interface Alert {
  id: number;
  type: string;
  level: "info" | "warning" | "critical";
  message: string;
  is_read: boolean;
  created_at: string;
}

const typeIcon: Record<string, any> = {
  temperature: Thermometer,
  humidity: Droplets,
  gas: Wind,
  smoke: Flame,
  door: DoorOpen,
  motion: Activity,
};

const levelStyles: Record<string, { card: string; badge: string; icon: any; label: string }> = {
  info: {
    card: "border-info/40 bg-info/5",
    badge: "bg-info/15 text-info border-info/30",
    icon: Info,
    label: "Инфо",
  },
  warning: {
    card: "border-warning/40 bg-warning/5",
    badge: "bg-warning/15 text-warning border-warning/30",
    icon: AlertTriangle,
    label: "Внимание",
  },
  critical: {
    card: "border-destructive/60 bg-destructive/10 animate-pulse-critical",
    badge: "bg-destructive/20 text-destructive border-destructive/40",
    icon: AlertCircle,
    label: "Критично",
  },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const { refreshUnread } = useHomeMode();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const path = filter === "unread" ? "/alerts/unread" : "/alerts";
      const data = await apiFetch(path);
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки уведомлений");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number) => {
    try {
      await apiFetch(`/alerts/${id}/read`, { method: "PATCH" });
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
      toast.success("Отмечено прочитанным");
      refreshUnread();
    } catch (err: any) {
      toast.error(err.message || "Не удалось обновить");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Уведомления</h2>
          <p className="text-sm text-muted-foreground mt-1">События и тревоги системы</p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-background/40 p-1">
          {(["all", "unread"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant="ghost"
              onClick={() => setFilter(f)}
              className={`h-8 px-3 transition-smooth ${
                filter === f
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Все" : "Непрочитанные"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            Нет уведомлений
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const TypeIcon = typeIcon[a.type] ?? Bell;
            const lvl = levelStyles[a.level] ?? levelStyles.info;
            const LvlIcon = lvl.icon;
            return (
              <Card
                key={a.id}
                className={`border transition-smooth ${lvl.card} ${
                  a.is_read ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/60">
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className={lvl.badge}>
                        <LvlIcon className="mr-1 h-3 w-3" />
                        {lvl.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(a.created_at)}
                      </span>
                      {!a.is_read && (
                        <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-[10px]">
                          Новое
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{a.message}</p>
                  </div>
                  {!a.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markRead(a.id)}
                      className="shrink-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Check className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Прочитано</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
