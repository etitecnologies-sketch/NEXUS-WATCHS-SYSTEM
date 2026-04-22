import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid2x2, 
  Grid3x3, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  Camera,
  Download,
  Maximize
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function LiveView() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<"1" | "4" | "9" | "16">("4");
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [quality, setQuality] = useState<"sd" | "hd">("hd");
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: devices = [] } = trpc.devices.list.useQuery(undefined, {
    enabled: !!user,
  });

  const allCameras = devices.flatMap((device) => 
    Array.from({ length: 4 }, (_, i) => ({
      id: `${device.id}-${i}`,
      deviceId: device.id,
      deviceName: device.name,
      name: `Câmera ${i + 1}`,
      channelNumber: i + 1,
      status: device.status,
    }))
  );

  const getGridClass = () => {
    switch (layout) {
      case "1":
        return "grid-cols-1 grid-rows-1";
      case "4":
        return "grid-cols-2 grid-rows-2";
      case "9":
        return "grid-cols-3 grid-rows-3";
      case "16":
        return "grid-cols-4 grid-rows-4";
      default:
        return "grid-cols-2 grid-rows-2";
    }
  };

  const displayCameras = allCameras.slice(0, parseInt(layout));

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? "p-0" : "p-4"}`}>
      {/* Header */}
      {!isFullscreen && (
        <div className="mb-4 bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Camera className="w-6 h-6 text-accent" />
              Visualização ao Vivo
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Layout Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Layout:
              </span>
              <div className="flex gap-2">
                <Button
                  variant={layout === "1" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout("1")}
                  className={layout === "1" ? "bg-accent text-accent-foreground" : ""}
                >
                  1
                </Button>
                <Button
                  variant={layout === "4" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout("4")}
                  className={layout === "4" ? "bg-accent text-accent-foreground" : ""}
                >
                  <Grid2x2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={layout === "9" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout("9")}
                  className={layout === "9" ? "bg-accent text-accent-foreground" : ""}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={layout === "16" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout("16")}
                  className={layout === "16" ? "bg-accent text-accent-foreground" : ""}
                >
                  16
                </Button>
              </div>
            </div>

            {/* Quality and Audio */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Qualidade:
                </span>
                <Badge
                  variant={quality === "hd" ? "default" : "outline"}
                  className={quality === "hd" ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setQuality("hd")}
                >
                  HD
                </Badge>
                <Badge
                  variant={quality === "sd" ? "default" : "outline"}
                  className={quality === "sd" ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setQuality("sd")}
                >
                  SD
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className={`grid gap-2 ${getGridClass()}`}>
        {displayCameras.map((camera) => (
          <Card
            key={camera.id}
            className="bg-card border border-border overflow-hidden cursor-pointer hover:border-accent/50 transition-colors"
            onClick={() => setSelectedCamera(camera.id)}
          >
            {/* Video Placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {camera.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {camera.deviceName}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <Badge
                  className={
                    camera.status === "online"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }
                >
                  {camera.status === "online" ? "Online" : "Offline"}
                </Badge>
              </div>

              {/* Camera Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs font-medium text-white">
                  {camera.name}
                </p>
                <p className="text-xs text-gray-300">
                  {camera.deviceName}
                </p>
              </div>

              {/* Controls on Hover */}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Download className="w-3 h-3 text-white" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Fullscreen Mode */}
      {isFullscreen && selectedCamera && (
        <div className="fixed inset-0 bg-background z-50">
          <div className="w-full h-full flex flex-col">
            {/* Fullscreen Header */}
            <div className="bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {displayCameras.find((c) => c.id === selectedCamera)?.name}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(false)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Fullscreen Video */}
            <div className="flex-1 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-24 h-24 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Visualização de vídeo em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
