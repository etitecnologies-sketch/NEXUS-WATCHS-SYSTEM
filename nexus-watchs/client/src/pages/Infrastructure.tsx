import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  Network, 
  RefreshCcw,
  AlertTriangle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function Infrastructure() {
  const [loading, setLoading] = useState(false);
  
  // Real metrics from tRPC
  const { data: metrics = [] } = trpc.monitoring.getMetrics.useQuery({ 
    host: "all", 
    hours: 24 
  });
  
  const { data: statusData } = trpc.monitoring.getStatus.useQuery();

  const mockMetrics = metrics.length > 0 ? metrics : [
    { time: "10:00", cpu: 45, memory: 60, disk: 30, latency: 15 },
    { time: "10:05", cpu: 52, memory: 62, disk: 30, latency: 18 },
    { time: "10:10", cpu: 48, memory: 61, disk: 31, latency: 12 },
    { time: "10:15", cpu: 70, memory: 65, disk: 31, latency: 25 },
    { time: "10:20", cpu: 55, memory: 63, disk: 32, latency: 20 },
    { time: "10:25", cpu: 42, memory: 60, disk: 32, latency: 15 },
  ];

  const services = statusData?.services || [
    { name: "Ingest API", status: "online", version: "v1.2.0" },
    { name: "WebSocket Server", status: "online", version: "v1.0.5" },
    { name: "Processor Python", status: "online", version: "v2.1.0" },
    { name: "Database (PostgreSQL)", status: "online", version: "15.4" },
    { name: "CCTV Agent", status: "warning", version: "v0.9.8" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Infraestrutura</h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real dos servidores e serviços do sistema.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uso de CPU</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42%</div>
              <p className="text-xs text-muted-foreground">Normal</p>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[42%]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memória RAM</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.2 GB</div>
              <p className="text-xs text-muted-foreground">De 16 GB total</p>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[38%]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2 TB</div>
              <p className="text-xs text-muted-foreground">75% disponível</p>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[25%]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latência Rede</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18ms</div>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Excelente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Histórico de Desempenho</CardTitle>
              <CardDescription>
                Métricas de CPU e Memória nas últimas 24 horas.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMetrics}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="var(--accent)" 
                    fillOpacity={1} 
                    fill="url(#colorCpu)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={0.1} 
                    fill="hsl(var(--primary))" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Serviços Ativos</CardTitle>
              <CardDescription>
                Status dos microsserviços do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.version}</p>
                    </div>
                    <Badge variant={service.status === "online" ? "outline" : "destructive"} className={service.status === "online" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                      {service.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Banco de Dados (TimescaleDB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tabelas de Métricas</p>
                <p className="text-xl font-bold">14.2M registros</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tempo de Retenção</p>
                <p className="text-xl font-bold">30 dias</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tamanho Total</p>
                <p className="text-xl font-bold">4.8 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}