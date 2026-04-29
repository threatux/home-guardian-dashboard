import { useEffect, useState, useCallback } from "react";
import { Lightbulb, DoorOpen, DoorClosed, Power } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

interface Device {
  id: number;
  name: string;
  type: string;
  status: boolean;
  updated_at: string;
}

function deviceIcon(type: string, status: boolean) {
  if (type === "door") return status ? DoorOpen : DoorClosed;
  if (type === "light") return Lightbulb;
  return Power;
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/devices");
      setDevices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки устройств");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (d: Device) => {
    setPending(d.id);
    try {
      const updated = await apiFetch(`/devices/${d.id}/toggle`, { method: "PATCH" });
      setDevices((prev) => prev.map((x) => (x.id === d.id ? { ...x, ...updated } : x)));
      toast.success(`${d.name}: ${updated.status ? "Включено" : "Выключено"}`);
    } catch (err: any) {
      toast.error(err.message || "Не удалось переключить");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Устройства</h2>
        <p className="text-sm text-muted-foreground mt-1">Управление подключёнными устройствами</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-12 text-center text-muted-foreground">
            Нет устройств
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => {
            const Icon = deviceIcon(d.type, d.status);
            return (
              <Card
                key={d.id}
                className={`gradient-card border-border/50 transition-smooth hover:shadow-elegant ${
                  d.status ? "ring-1 ring-primary/40 shadow-glow" : ""
                }`}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-smooth ${
                      d.status
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(d.updated_at)}
                    </p>
                  </div>
                  <Switch
                    checked={d.status}
                    onCheckedChange={() => toggle(d)}
                    disabled={pending === d.id}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
