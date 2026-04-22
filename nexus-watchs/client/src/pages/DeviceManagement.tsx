import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Edit2,
  Wifi,
  WifiOff,
  Server,
  QrCode,
  Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function DeviceManagement() {
  const { user } = useAuth();
  const [connectionType, setConnectionType] = useState<"ip" | "ddns" | "p2p" | "qrcode">("ip");
  const [deviceName, setDeviceName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: devices = [] } = trpc.devices.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createDeviceMutation = trpc.devices.create.useMutation();
  const deleteDeviceMutation = trpc.devices.delete.useMutation();

  const handleCreateDevice = async () => {
    if (!deviceName.trim() || !username.trim() || !password.trim()) return;

    await createDeviceMutation.mutateAsync({
      name: deviceName,
      type: "dvr",
      connectionType,
      ipAddress: connectionType === "ip" ? ipAddress : undefined,
      username,
      password,
    });

    setDeviceName("");
    setIpAddress("");
    setUsername("");
    setPassword("");
    setConnectionType("ip");
    setIsDialogOpen(false);
  };

  const handleDeleteDevice = async (id: number) => {
    await deleteDeviceMutation.mutateAsync({ id });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="mb-6 bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Server className="w-6 h-6 text-accent" />
            Gerenciamento de Dispositivos
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Adicionar Novo Dispositivo
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Configure um DVR, NVR ou câmera IP
                </DialogDescription>
              </DialogHeader>

              <Tabs value={connectionType} onValueChange={(v: any) => setConnectionType(v)}>
                <TabsList className="grid w-full grid-cols-4 bg-muted border-border">
                  <TabsTrigger value="ip" className="text-xs">
                    <Link2 className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="ddns" className="text-xs">
                    DDNS
                  </TabsTrigger>
                  <TabsTrigger value="p2p" className="text-xs">
                    P2P
                  </TabsTrigger>
                  <TabsTrigger value="qrcode" className="text-xs">
                    <QrCode className="w-3 h-3" />
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Nome do Dispositivo</Label>
                    <Input
                      placeholder="Ex: DVR Loja"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  {connectionType === "ip" && (
                    <div className="space-y-2">
                      <Label className="text-foreground">Endereço IP</Label>
                      <Input
                        placeholder="192.168.1.100"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  )}

                  {connectionType === "ddns" && (
                    <div className="space-y-2">
                      <Label className="text-foreground">Endereço DDNS</Label>
                      <Input
                        placeholder="seu-dominio.intelbras.com.br"
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  )}

                  {connectionType === "qrcode" && (
                    <div className="space-y-2">
                      <Label className="text-foreground">Escanear QR Code</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          Aponte a câmera para o QR Code do dispositivo
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-foreground">Usuário</Label>
                    <Input
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Senha</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <Button
                    onClick={handleCreateDevice}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Adicionar Dispositivo
                  </Button>
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Devices List */}
      {devices.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Nenhum dispositivo adicionado</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Adicionar Primeiro Dispositivo</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    Adicionar Novo Dispositivo
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Configure um DVR, NVR ou câmera IP
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={connectionType} onValueChange={(v: any) => setConnectionType(v)}>
                  <TabsList className="grid w-full grid-cols-4 bg-muted border-border">
                    <TabsTrigger value="ip" className="text-xs">
                      <Link2 className="w-3 h-3" />
                    </TabsTrigger>
                    <TabsTrigger value="ddns" className="text-xs">
                      DDNS
                    </TabsTrigger>
                    <TabsTrigger value="p2p" className="text-xs">
                      P2P
                    </TabsTrigger>
                    <TabsTrigger value="qrcode" className="text-xs">
                      <QrCode className="w-3 h-3" />
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Nome do Dispositivo</Label>
                      <Input
                        placeholder="Ex: DVR Loja"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        className="bg-input border-border text-foreground"
                      />
                    </div>

                    {connectionType === "ip" && (
                      <div className="space-y-2">
                        <Label className="text-foreground">Endereço IP</Label>
                        <Input
                          placeholder="192.168.1.100"
                          value={ipAddress}
                          onChange={(e) => setIpAddress(e.target.value)}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-foreground">Usuário</Label>
                      <Input
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-input border-border text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Senha</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-input border-border text-foreground"
                      />
                    </div>

                    <Button
                      onClick={handleCreateDevice}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Adicionar Dispositivo
                    </Button>
                  </div>
                </Tabs>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <Card
              key={device.id}
              className="bg-card border-border hover:border-accent/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent">
                      <Server className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {device.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {device.type.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            device.status === "online"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {device.status === "online" ? (
                            <>
                              <Wifi className="w-3 h-3 mr-1" />
                              Online
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-3 h-3 mr-1" />
                              Offline
                            </>
                          )}
                        </Badge>
                        {device.latency && (
                          <span className="text-xs text-muted-foreground">
                            {device.latency}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDevice(device.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
