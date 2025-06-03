import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { StorageContainer } from "@shared/schema";

interface ContainerPosition {
  id: number;
  x: number;
  y: number;
}

export default function Floorplan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [containerPositions, setContainerPositions] = useState<ContainerPosition[]>([]);
  const [draggedContainer, setDraggedContainer] = useState<StorageContainer | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: containers = [] } = useQuery<StorageContainer[]>({
    queryKey: ["/api/containers"],
  });

  // Initialize positions for containers that don't have them
  const getContainerPosition = (containerId: number): { x: number; y: number } => {
    const existing = containerPositions.find(p => p.id === containerId);
    if (existing) return { x: existing.x, y: existing.y };
    
    // Default positioning - arrange in a grid
    const index = containers.findIndex(c => c.id === containerId);
    const cols = 4;
    const spacing = 200;
    return {
      x: (index % cols) * spacing + 50,
      y: Math.floor(index / cols) * spacing + 50
    };
  };

  const handleContainerDragStart = (e: React.DragEvent, container: StorageContainer) => {
    setDraggedContainer(container);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleContainerDragEnd = () => {
    setDraggedContainer(null);
    setIsDragging(false);
  };

  const handleFloorplanDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedContainer) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 75; // Center the container
    const y = e.clientY - rect.top - 50;

    setContainerPositions(prev => {
      const filtered = prev.filter(p => p.id !== draggedContainer.id);
      return [...filtered, { id: draggedContainer.id, x: Math.max(0, x), y: Math.max(0, y) }];
    });

    setDraggedContainer(null);
    setIsDragging(false);
  };

  const handleFloorplanDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const resetLayout = () => {
    setContainerPositions([]);
    toast({ title: "Layout reset to default grid" });
  };

  const saveLayout = () => {
    // For now, just save to local storage
    localStorage.setItem('containerPositions', JSON.stringify(containerPositions));
    toast({ title: "Floorplan layout saved" });
  };

  // Load saved positions on mount
  useEffect(() => {
    const saved = localStorage.getItem('containerPositions');
    if (saved) {
      try {
        setContainerPositions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved positions');
      }
    }
  }, []);

  const getItemCount = (container: StorageContainer) => {
    // This would ideally come from the items query
    return 0; // Placeholder
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Container Floorplan</h1>
            <p className="text-slate-500">Drag containers to organize your storage layout</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetLayout}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Layout
            </Button>
            <Button onClick={saveLayout}>
              <Save className="w-4 h-4 mr-2" />
              Save Layout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Container List Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-medium text-slate-900">Storage Containers</h2>
            <p className="text-sm text-slate-500">Drag containers to the floorplan</p>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {containers.map((container) => (
              <Card 
                key={container.id} 
                className={`cursor-move hover:shadow-md transition-shadow ${
                  draggedContainer?.id === container.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleContainerDragStart(e, container)}
                onDragEnd={handleContainerDragEnd}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{container.name}</h3>
                      {container.description && (
                        <p className="text-xs text-slate-500 mt-1">{container.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {container.gridConfig.rows.filter(r => !r.isDivider).length} rows
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Floorplan Area */}
        <div className="flex-1 relative overflow-auto">
          <div 
            className={`min-h-full min-w-full relative ${
              isDragging ? 'bg-blue-50' : 'bg-gray-50'
            }`}
            onDrop={handleFloorplanDrop}
            onDragOver={handleFloorplanDragOver}
            style={{ minHeight: '800px', minWidth: '1200px' }}
          >
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />

            {/* Container Icons */}
            {containers.map((container) => {
              const position = getContainerPosition(container.id);
              return (
                <div
                  key={container.id}
                  className="absolute transform hover:scale-105 transition-transform cursor-move"
                  style={{
                    left: position.x,
                    top: position.y,
                    width: '150px'
                  }}
                  draggable
                  onDragStart={(e) => handleContainerDragStart(e, container)}
                  onDragEnd={handleContainerDragEnd}
                >
                  <Card className="shadow-lg border-2 border-slate-300 hover:border-blue-400 transition-colors">
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-slate-100 rounded-lg flex items-center justify-center">
                        <div className="text-2xl">📦</div>
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm mb-1">{container.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {container.gridConfig.rows.filter(r => !r.isDivider).length} rows
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* Drop zone indicator */}
            {isDragging && (
              <div className="absolute inset-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 bg-opacity-50 flex items-center justify-center">
                <div className="text-blue-600 text-lg font-medium">
                  Drop container here to position it
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}