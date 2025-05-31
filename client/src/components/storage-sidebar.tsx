import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Settings, ChevronRight } from "lucide-react";
import type { StorageContainer, ItemSearchResult } from "@shared/schema";

interface StorageSidebarProps {
  containers: StorageContainer[];
  selectedContainerId: number | null;
  onContainerSelect: (id: number) => void;
  onAddContainer: () => void;
  onManageCategories: () => void;
  onManageSizes: () => void;
}

export function StorageSidebar({
  containers,
  selectedContainerId,
  onContainerSelect,
  onAddContainer,
  onManageCategories,
  onManageSizes,
}: StorageSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { data: searchResults = [] } = useQuery<ItemSearchResult[]>({
    queryKey: ["/api/search", { q: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 200);
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Storage Tracker</h1>
        <Button onClick={onAddContainer} className="w-full bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Storage Container
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={handleSearchBlur}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-4 right-4 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-50">
            <div className="p-2">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3 hover:bg-slate-50 rounded cursor-pointer border-b border-slate-100 last:border-b-0"
                  onClick={() => onContainerSelect(result.containerId)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex-shrink-0"
                      style={{ backgroundColor: result.category?.color || "#64748b" }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{result.name}</h4>
                      <p className="text-sm text-slate-500 truncate">
                        {result.containerName} → Row {result.position.row + 1}, Column {result.position.column + 1}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0">
                      {result.category?.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Storage Container List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            Storage Containers
          </h3>
          
          <div className="space-y-2">
            {containers.map((container) => {
              const isSelected = container.id === selectedContainerId;
              const totalSlots = container.gridConfig.rows.reduce(
                (sum, row) => sum + (row.isDivider ? 0 : row.columns), 
                0
              );
              
              return (
                <div
                  key={container.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    isSelected
                      ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                      : "bg-slate-50 border-transparent hover:bg-slate-100 hover:border-blue-200"
                  }`}
                  onClick={() => onContainerSelect(container.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-slate-900 truncate">{container.name}</h4>
                      <p className="text-sm text-slate-500 truncate">
                        {container.description || `${totalSlots} slots`}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                  </div>
                </div>
              );
            })}
            
            {containers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>No storage containers yet</p>
                <p className="text-sm mt-1">Create your first container to get started</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Settings */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Button
          variant="ghost"
          onClick={onManageCategories}
          className="w-full justify-start text-slate-600 hover:text-slate-900"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Categories
        </Button>
        <Button
          variant="ghost"
          onClick={onManageSizes}
          className="w-full justify-start text-slate-600 hover:text-slate-900"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Sizes
        </Button>
      </div>
    </div>
  );
}
