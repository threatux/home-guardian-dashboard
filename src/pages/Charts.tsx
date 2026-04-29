import { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";

type SensorType = "temperature" | "humidity" | "light_level" | "gas";
type Period = "hour" | "day" | "week";

const sensorOptions: { value: SensorType; label: string; unit: string }[] = [
  { value: "temperature", label: "Температура", unit: "°C" },
  { value: "humidity", label: "Влажность", unit: "%" },
  { value: "light_level", label: "Освещённость", unit: "lux" },
  { value: "gas", label: "Газ", unit: "ppm" },
];

const periods: { value: Period; label: string }[] = [
  { value: "hour", label: "Час" },
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
];

export default function Charts() {
  const [sensor, setSensor] = useState<SensorType>("temperature");
  const [period, setPeriod] = useState<Period>("day");
  const [data, setData] = useState<{ value: number; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/sensors/history?type=${sensor}&period=${period}`);
      const points = (res.data || []).map((p: any) => ({
        value: p.value,
        timestamp: p.timestamp,
        time: new Date(p.timestamp).toLocaleString("ru-RU", {
          hour: "2-digit", minute: "2-digit",
          day: period !== "hour" ? "2-digit" : undefined,
          month: period !== "hour" ? "2-digit" : undefined,
        }),
      }));
      setData(points);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки графика");
    } finally {
      setLoading(false);
    }
  }, [sensor, period]);

  useEffect(() => { load(); }, [load]);

  const sensorMeta = sensorOptions.find((s) => s.value === sensor)!;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Графики датчиков</h2>
        <p className="text-sm text-muted-foreground mt-1">История показаний по датчикам</p>
      </div>

      <Card className="gradient-card border-border/50 shadow-card-soft">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {sensorMeta.label} <span className="text-muted-foreground text-sm font-normal">({sensorMeta.unit})</span>
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={sensor} onValueChange={(v) => setSensor(v as SensorType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sensorOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="inline-flex rounded-lg border border-border bg-background/40 p-1">
              {periods.map((p) => (
                <Button
                  key={p.value}
                  size="sm"
                  variant="ghost"
                  onClick={() => setPeriod(p.value)}
                  className={`h-8 px-3 transition-smooth ${
                    period === p.value
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80 w-full" />
          ) : data.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    formatter={(v: number) => [`${v} ${sensorMeta.unit}`, sensorMeta.label]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorValue)"
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
