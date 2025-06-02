import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";
import type { StorageContainer, ItemWithCategory } from "@shared/schema";
import { Icon } from "@/components/icon";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StorageGridProps {
  container: StorageContainer;
  onAddItem: (row: number, column: number) => void;
  onEditItem: (item: ItemWithCategory) => void;
}

export function StorageGrid({ container, onAddItem, onEditItem }: StorageGridProps) {
  const [draggedItem, setDraggedItem] = useState<ItemWithCategory | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<{ row: number; column: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery<ItemWithCategory[]>({
    queryKey: ["/api/containers", container.id, "items"],
    queryFn: () => fetch(`/api/containers/${container.id}/items`).then(res => res.json()),
  });

  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, newPosition }: { itemId: number; newPosition: { row: number; column: number } }) => {
      const response = await apiRequest("PATCH", `/api/items/${itemId}`, {
        position: newPosition,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/containers", container.id, "items"] });
      toast({ title: "Item moved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to move item", variant: "destructive" });
    },
  });

  const getItemAtPosition = (row: number, column: number) => {
    return items.find(item => 
      item.position?.row === row && item.position?.column === column
    );
  };

  const getSizeDisplay = (size: string | null) => {
    if (!size) return "";
    const sizeMap: Record<string, string> = {
      xs: "XS",
      s: "S", 
      m: "M",
      l: "L",
      xl: "XL"
    };
    return sizeMap[size] || size;
  };

  const handleDragStart = (e: React.DragEvent, item: ItemWithCategory) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, row: number, column: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPosition({ row, column });
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const handleDrop = async (e: React.DragEvent, targetRow: number, targetColumn: number) => {
    e.preventDefault();
    setDragOverPosition(null);

    if (!draggedItem) return;

    const existingItem = getItemAtPosition(targetRow, targetColumn);
    if (existingItem && existingItem.id !== draggedItem.id) {
      toast({ title: "Position already occupied", variant: "destructive" });
      setDraggedItem(null);
      return;
    }

    if (draggedItem.position?.row === targetRow && draggedItem.position?.column === targetColumn) {
      setDraggedItem(null);
      return;
    }

    moveItemMutation.mutate({
      itemId: draggedItem.id,
      newPosition: { row: targetRow, column: targetColumn },
    });

    setDraggedItem(null);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{container.name}</h2>
          </div>

        </div>
      </div>

      {/* Grid View */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {container.gridConfig.rows.map((rowConfig, rowIndex) => {
            if (rowConfig.isDivider) {
              return (
                <div key={`divider-${rowIndex}`} className="my-6">
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                </div>
              );
            }

            return (
              <div key={`row-${rowIndex}`} className="mb-2">
                <div 
                  className="grid gap-1"
                  style={{ 
                    gridTemplateColumns: `repeat(${rowConfig.columns}, minmax(0, 1fr))` 
                  }}
                >
                  {Array.from({ length: rowConfig.columns }, (_, columnIndex) => {
                    const item = getItemAtPosition(rowIndex, columnIndex);
                    
                    if (item) {
                      return (
                        <div
                          key={`${rowIndex}-${columnIndex}`}
                          className={`storage-box p-1 cursor-pointer relative min-h-[80px] transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                            draggedItem?.id === item.id ? 'opacity-50 scale-95' : ''
                          } ${
                            dragOverPosition?.row === rowIndex && dragOverPosition?.column === columnIndex ? 'ring-2 ring-blue-500' : ''
                          }`}
                          style={{ backgroundColor: item.category?.color || "#64748b" }}
                          onClick={() => onEditItem(item)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragOver={(e) => handleDragOver(e, rowIndex, columnIndex)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, rowIndex, columnIndex)}
                        >
                          {/* Status indicators */}
                          <div className="absolute top-1 right-1 flex gap-1">
                            {item.checkedOutTo && (
                              <div className="w-3 h-3 bg-orange-500 rounded-full border border-white shadow-sm" title={`Checked out to: ${item.checkedOutTo}`} />
                            )}
                            {item.lowQuantityThreshold && item.quantity !== null && item.quantity !== undefined && item.quantity <= item.lowQuantityThreshold && (
                              <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm" title={`Low quantity: ${item.quantity}/${item.lowQuantityThreshold}`} />
                            )}
                          </div>

                          <div className="absolute top-1 left-1">
                            <h4 className="font-medium text-white text-xs mb-0 line-clamp-2 leading-tight">
                              {item.name}
                            </h4>
                            {item.size && (
                              <p className="text-white text-opacity-80 text-xs leading-none">
                                {getSizeDisplay(item.size)}
                              </p>
                            )}
                          </div>
                          {item.category?.icon && (
                            <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-50">
                              <Icon 
                                name={item.category.icon}
                                size={48}
                                className="text-white"
                              />
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`${rowIndex}-${columnIndex}`}
                        className={`border-2 border-dashed border-slate-300 p-3 cursor-pointer relative min-h-[80px] flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 ${
                          dragOverPosition?.row === rowIndex && dragOverPosition?.column === columnIndex ? 'border-blue-500 bg-blue-100' : ''
                        }`}
                        onClick={() => onAddItem(rowIndex, columnIndex)}
                        onDragOver={(e) => handleDragOver(e, rowIndex, columnIndex)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, rowIndex, columnIndex)}
                      >
                        <div className="text-center">
                          <Plus className="w-6 h-6 text-slate-400 mb-2 mx-auto" />
                          <p className="text-slate-500 text-sm">Add Item</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {container.gridConfig.rows.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Empty Container
              </h3>
              <p className="text-slate-500 mb-4">
                Configure the grid layout to start adding items
              </p>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Grid
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
