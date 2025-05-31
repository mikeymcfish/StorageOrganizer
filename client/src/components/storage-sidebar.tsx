import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Settings, ChevronRight, Download, Upload } from "lucide-react";
import type { StorageContainer, ItemSearchResult } from "@shared/schema";

interface StorageSidebarProps {
  containers: StorageContainer[];
  selectedContainerId: number | null;
  onContainerSelect: (id: number) => void;
  onAddContainer: () => void;
  onManageCategories: () => void;
  onManageSizes: () => void;
  onSearch: () => void;
  onManageContainers: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function StorageSidebar({
  containers,
  selectedContainerId,
  onContainerSelect,
  onAddContainer,
  onManageCategories,
  onManageSizes,
  onSearch,
  onManageContainers,
  onExport,
  onImport,
}: StorageSidebarProps) {

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Storage Tracker</h1>
        <Button onClick={onAddContainer} className="w-full bg-blue-600 hover:bg-blue-700 mb-3">
          <Plus className="w-4 h-4 mr-2" />
          Add Storage Container
        </Button>
        
        {/* Management buttons */}
        <div className="space-y-2">
          <Button 
            onClick={onSearch} 
            variant="outline" 
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Items
          </Button>
          
          <Button 
            onClick={onManageContainers} 
            variant="outline" 
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Containers
          </Button>
        </div>
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
        
        <div className="border-t border-slate-200 pt-2 mt-2 space-y-2">
          <Button
            variant="ghost"
            onClick={onExport}
            className="w-full justify-start text-slate-600 hover:text-slate-900"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          
          <Button
            variant="ghost"
            onClick={onImport}
            className="w-full justify-start text-slate-600 hover:text-slate-900"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>
    </div>
  );
}
