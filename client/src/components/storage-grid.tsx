import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";
import type { StorageContainer, ItemWithCategory } from "@shared/schema";
import { Icon } from "@/components/icon";

interface StorageGridProps {
  container: StorageContainer;
  onAddItem: (row: number, column: number) => void;
  onEditItem: (item: ItemWithCategory) => void;
}

export function StorageGrid({ container, onAddItem, onEditItem }: StorageGridProps) {
  const { data: items = [] } = useQuery<ItemWithCategory[]>({
    queryKey: ["/api/containers", container.id, "items"],
    queryFn: () => fetch(`/api/containers/${container.id}/items`).then(res => res.json()),
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

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{container.name}</h2>
            <p className="text-slate-500">
              {container.description || `${container.gridConfig.rows.length} rows with custom layout`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-slate-600 hover:text-slate-900">
              <Settings className="w-4 h-4 mr-2" />
              Configure Grid
            </Button>
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
                  className="grid gap-2"
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
                          className="storage-box p-1 rounded-lg cursor-pointer relative min-h-[80px] transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                          style={{ backgroundColor: item.category?.color || "#64748b" }}
                          onClick={() => onEditItem(item)}
                        >
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
                            <div className="absolute inset-0 flex items-center justify-center opacity-50">
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
                        className="border-2 border-dashed border-slate-300 p-3 rounded-lg cursor-pointer relative min-h-[80px] flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-all duration-200"
                        onClick={() => onAddItem(rowIndex, columnIndex)}
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
