import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Save,
  Trash2,
  Crosshair,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PTZControls() {
  const { user } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [presetName, setPresetName] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  const { data: devices = [] } = trpc.devices.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: presets = [] } = trpc.ptz.listPresets.useQuery(
    { cameraId: selectedDevice ? parseInt(selectedDevice) : 0 },
    {
      enabled: !!user && !!selectedDevice,
    }
  );

  const createPresetMutation = trpc.ptz.createPreset.useMutation();
  const deletePresetMutation = trpc.ptz.deletePreset.useMutation();

  const handleSavePreset = async () => {
    if (!presetName.trim() || !selectedDevice) return;

    await createPresetMutation.mutateAsync({
      cameraId: parseInt(selectedDevice),
      name: presetName,
      panPosition: 0,
      tiltPosition: 0,
      zoomLevel: zoomLevel,
    });

    setPresetName("");
  };

  const handleDeletePreset = async (id: number) => {
    await deletePresetMutation.mutateAsync({ id });
  };

  const handleMovement = (direction: string) => {
    console.log(`Moving ${direction}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-4">
          <Crosshair className="w-8 h-8 text-accent" />
          Controles PTZ
        </h1>
        <p className="text-muted-foreground">
          Controle câmeras móveis com pan, tilt, zoom e presets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Selecionar Câmera</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Selecione uma câmera PTZ" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={String(device.id)}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedDevice && (
            <>
              {/* PTZ Controls */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Controles de Movimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Pan/Tilt Joystick */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-muted rounded-lg p-8 w-full max-w-xs">
                        <div className="grid grid-cols-3 gap-2">
                          {/* Top */}
                          <div />
                          <Button
                            size="lg"
                            variant="outline"
                            className="h-16"
                            onClick={() => handleMovement("up")}
                          >
                            <ArrowUp className="w-6 h-6" />
                          </Button>
                          <div />

                          {/* Left, Center, Right */}
                          <Button
                            size="lg"
                            variant="outline"
                            className="h-16"
                            onClick={() => handleMovement("left")}
                          >
                            <ArrowLeft className="w-6 h-6" />
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="h-16 bg-accent/10"
                            disabled
                          >
                            <Crosshair className="w-6 h-6 text-accent" />
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="h-16"
                            onClick={() => handleMovement("right")}
                          >
                            <ArrowRight className="w-6 h-6" />
                          </Button>

                          {/* Bottom */}
                          <div />
                          <Button
                            size="lg"
                            variant="outline"
                            className="h-16"
                            onClick={() => handleMovement("down")}
                          >
                            <ArrowDown className="w-6 h-6" />
                          </Button>
                          <div />
                        </div>
                      </div>
                    </div>

                    {/* Zoom Control */}
                    <div className="space-y-3">
                      <Label className="text-foreground">Zoom</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.1))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                          <p className="text-sm font-mono text-foreground">
                            {zoomLevel.toFixed(1)}x
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setZoomLevel(Math.min(10, zoomLevel + 0.1))}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Preset */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Salvar Posição Atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-foreground">Nome da Posição</Label>
                    <Input
                      placeholder="Ex: Entrada, Caixa, Estoque"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleSavePreset}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Preset
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Presets Sidebar */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Presets Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDevice ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Selecione uma câmera para ver os presets
                </p>
              ) : presets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum preset salvo
                </p>
              ) : (
                <div className="space-y-2">
                  {presets.map((preset: any) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {preset.name}
                        </p>
                        {preset.zoom && (
                          <p className="text-xs text-muted-foreground">
                            Zoom: {preset.zoom.toFixed(1)}x
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeletePreset(preset.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-card border-border mt-4">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Dicas</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                • Use os controles direcionais para mover a câmera
              </p>
              <p>
                • Ajuste o zoom com os botões + e -
              </p>
              <p>
                • Salve posições frequentes como presets
              </p>
              <p>
                • Clique em um preset para retornar à posição salva
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
