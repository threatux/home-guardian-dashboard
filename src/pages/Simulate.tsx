import { useState } from "react";
import { Dices, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export default function Simulate() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/sensors/simulate", { method: "POST" });
      setSnapshot(data);
      toast.success("Новые показания сгенерированы");
    } catch (err: any) {
      toast.error(err.message || "Ошибка симуляции");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Симуляция датчиков</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Сгенерируйте новые случайные показания для всех датчиков
        </p>
      </div>

      <Card className="gradient-card border-border/50 shadow-card-soft">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow mb-4">
            <Dices className="h-8 w-8 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Готовы к симуляции?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Эта операция создаст новые показания всех датчиков и может вызвать уведомления.
          </p>
          <Button
            onClick={run}
            disabled={loading}
            size="lg"
            className="gradient-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-elegant"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Dices className="mr-2 h-4 w-4" />
            )}
            Сгенерировать новые показания
          </Button>
        </CardContent>
      </Card>

      {snapshot && (
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Результат</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg bg-background/60 p-4 text-xs text-foreground/90 border border-border/50 max-h-96">
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
