import { useEffect, useState, useCallback } from "react";
import {
  Thermometer, Droplets, Sun, Activity, DoorOpen, DoorClosed,
  Wind, Flame, Lightbulb, RefreshCw, Bell, BellRing, Home, Footprints, MoonStar,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useHomeMode } from "@/contexts/HomeModeContext";

interface Current {
  temperature: number;
  humidity: number;
  light_level: number;
  motion_detected: boolean;
  door_open: boolean;
  smoke_detected: boolean;
  gas_level: number;
  light_status: boolean;
  home_mode: string;
  updated_at: string;
}

interface Summary {
  avg_temperature: number;
  avg_humidity: number;
  alerts_count: number;
  unread_alerts: number;
  home_mode: string;
}

function MetricTile({
  icon: Icon, label, value, hint, accent, alert, children,
}: {
  icon: any; label: string; value: React.ReactNode; hint?: string;
  accent?: "default" | "hot" | "cool" | "danger" | "success" | "warning";
  alert?: boolean; children?: React.ReactNode;
}) {
  const accentMap: Record<string, string> = {
    default: "from-primary/10 to-transparent text-primary",
    hot: "from-destructive/15 to-transparent text-destructive",
    cool: "from-info/15 to-transparent text-info",
    danger: "from-destructive/20 to-transparent text-destructive",
    success: "from-success/15 to-transparent text-success",
    warning: "from-warning/15 to-transparent text-warning",
  };
  const a = accentMap[accent ?? "default"];
  return (
    <Card
      className={`relative overflow-hidden border-border/50 gradient-card transition-smooth hover:shadow-elegant hover:-translate-y-0.5 ${
        alert ? "animate-pulse-critical border-destructive/60" : ""
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${a} opacity-60 pointer-events-none`} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background/60 backdrop-blur ${a.split(" ").pop()}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [current, setCurrent] = useState<Current | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { mode, setMode, refresh: refreshMode } = useHomeMode();

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [c, s] = await Promise.all([
        apiFetch("/dashboard/current"),
        apiFetch("/dashboard/summary"),
      ]);
      setCurrent(c);
      setSummary(s);
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Не удалось загрузить данные");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 10000);
    return () => clearInterval(t);
  }, [load]);

  const handleModeChange = async (m: "home" | "away" | "night") => {
    try {
      await setMode(m);
      toast.success(`Режим: ${m}`);
    } catch (err: any) {
      toast.error(err.message || "Не удалось сменить режим");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const modes: { value: "home" | "away" | "night"; label: string; icon: any }[] = [
    { value: "home", label: "Home", icon: Home },
    { value: "away", label: "Away", icon: Footprints },
    { value: "night", label: "Night", icon: MoonStar },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Текущее состояние</h2>
          {current?.updated_at && (
            <p className="text-sm text-muted-foreground">
              Обновлено: {formatDateTime(current.updated_at)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => load()}
          disabled={refreshing}
          className="border-primary/40 hover:bg-primary/10 hover:text-primary transition-smooth"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {/* Current state tiles */}
      {current && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            icon={Thermometer}
            label="Температура"
            value={`${current.temperature.toFixed(1)}°C`}
            accent={current.temperature > 30 ? "hot" : "cool"}
          />
          <MetricTile
            icon={Droplets}
            label="Влажность"
            value={`${current.humidity}%`}
            accent="cool"
          >
            <Progress value={current.humidity} className="h-1.5" />
          </MetricTile>
          <MetricTile
            icon={Sun}
            label="Освещённость"
            value={`${current.light_level} lux`}
            accent="warning"
          />
          <MetricTile
            icon={Activity}
            label="Движение"
            value={
              <Badge
                className={
                  current.motion_detected
                    ? "bg-destructive/20 text-destructive border-destructive/40"
                    : "bg-success/20 text-success border-success/40"
                }
                variant="outline"
              >
                {current.motion_detected ? "Обнаружено" : "Нет"}
              </Badge>
            }
            accent={current.motion_detected ? "danger" : "success"}
          />
          <MetricTile
            icon={current.door_open ? DoorOpen : DoorClosed}
            label="Дверь"
            value={
              <Badge
                className={
                  current.door_open
                    ? "bg-warning/20 text-warning border-warning/40"
                    : "bg-success/20 text-success border-success/40"
                }
                variant="outline"
              >
                {current.door_open ? "Открыта" : "Закрыта"}
              </Badge>
            }
            accent={current.door_open ? "warning" : "success"}
          />
          <MetricTile
            icon={Wind}
            label="Газ"
            value={`${current.gas_level}`}
            hint="ppm"
            accent={current.gas_level > 50 ? "danger" : "default"}
          />
          <MetricTile
            icon={Flame}
            label="Дым"
            value={
              <Badge
                className={
                  current.smoke_detected
                    ? "bg-destructive/20 text-destructive border-destructive/40"
                    : "bg-success/20 text-success border-success/40"
                }
                variant="outline"
              >
                {current.smoke_detected ? "Тревога" : "Норма"}
              </Badge>
            }
            accent={current.smoke_detected ? "danger" : "success"}
            alert={current.smoke_detected}
          />
          <MetricTile
            icon={Lightbulb}
            label="Свет"
            value={current.light_status ? "Включён" : "Выключен"}
            accent={current.light_status ? "warning" : "default"}
          />
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div>
          <h3 className="text-lg font-semibold tracking-tight mb-3">Сводка</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="gradient-card border-border/50">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Средняя температура
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {summary.avg_temperature?.toFixed(1)}°C
                </p>
              </CardContent>
            </Card>
            <Card className="gradient-card border-border/50">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Средняя влажность
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {summary.avg_humidity?.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card className="gradient-card border-border/50">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Всего уведомлений
                  </p>
                  <p className="text-2xl font-semibold mt-1">{summary.alerts_count}</p>
                </div>
                <Bell className="h-6 w-6 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="gradient-card border-border/50 relative overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Непрочитанных
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-semibold">{summary.unread_alerts}</p>
                    {summary.unread_alerts > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        новые
                      </Badge>
                    )}
                  </div>
                </div>
                <BellRing className={`h-6 w-6 ${summary.unread_alerts > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Home mode */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-3">Режим дома</h3>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-3">
              {modes.map((m) => {
                const active = mode === m.value;
                const Icon = m.icon;
                return (
                  <Button
                    key={m.value}
                    onClick={() => handleModeChange(m.value)}
                    variant="outline"
                    className={`flex-1 min-w-[120px] h-14 transition-smooth ${
                      active
                        ? "border-primary bg-primary/15 text-primary shadow-glow"
                        : "border-border hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {m.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
