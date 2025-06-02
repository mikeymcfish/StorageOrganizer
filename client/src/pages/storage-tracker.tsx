import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { StorageSidebar } from "@/components/storage-sidebar";
import { StorageGrid } from "@/components/storage-grid";
import { ItemModal } from "@/components/item-modal";
import { CategoryModal } from "@/components/category-modal";
import { ContainerModal } from "@/components/container-modal";
import { SizeModal } from "@/components/size-modal";
import { SearchModal } from "@/components/search-modal";
import { ContainerManagementModal } from "@/components/container-management-modal";
import type { StorageContainer, Item, Category } from "@shared/schema";

export default function StorageTracker() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedContainerId, setSelectedContainerId] = useState<number | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [containerModalOpen, setContainerModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [containerManagementModalOpen, setContainerManagementModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ row: number; column: number } | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingContainer, setEditingContainer] = useState<StorageContainer | null>(null);

  const { data: containers = [] } = useQuery<StorageContainer[]>({
    queryKey: ["/api/containers"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const selectedContainer = containers.find(c => c.id === selectedContainerId);

  const handleAddItem = (row: number, column: number) => {
    setSelectedPosition({ row, column });
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setSelectedPosition(item.position);
    setItemModalOpen(true);
  };

  const handleSearchItemClick = (searchResult: any) => {
    // Find the full item data
    const item = {
      id: searchResult.id,
      name: searchResult.name,
      categoryId: searchResult.categoryId,
      size: searchResult.size,
      quantity: searchResult.quantity,
      information: searchResult.information,
      photo: searchResult.photo,
      containerId: searchResult.containerId,
      position: searchResult.position,
      lowQuantityThreshold: searchResult.lowQuantityThreshold,
      checkedOutTo: searchResult.checkedOutTo,
      checkedOutAt: searchResult.checkedOutAt
    };
    
    // Set the container to show the item
    setSelectedContainerId(searchResult.containerId);
    
    // Open the item modal for editing/checkout
    handleEditItem(item);
  };

  const handleContainerSelect = (containerId: number) => {
    setSelectedContainerId(containerId);
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `storage-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your storage data has been exported.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      // Refresh all data
      queryClient.invalidateQueries({ queryKey: ["/api/containers"] });
      
      const { summary, errors } = result;
      let description = `Imported: ${summary.imported}, Updated: ${summary.updated}`;
      if (summary.failed > 0) {
        description += `, Failed: ${summary.failed}`;
      }
      
      toast({
        title: "Import completed",
        description,
        variant: summary.failed > 0 ? "destructive" : "default",
      });

      // Show detailed errors if any
      if (errors && errors.length > 0) {
        setTimeout(() => {
          toast({
            title: "Import errors",
            description: errors.slice(0, 3).join(", ") + (errors.length > 3 ? "..." : ""),
            variant: "destructive",
          });
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditContainer = (container: StorageContainer) => {
    setEditingContainer(container);
    setContainerModalOpen(true);
  };

  const handleContainerModalClose = () => {
    setContainerModalOpen(false);
    setEditingContainer(null);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <StorageSidebar
        containers={containers}
        selectedContainerId={selectedContainerId}
        onContainerSelect={handleContainerSelect}
        onAddContainer={() => setContainerModalOpen(true)}
        onManageCategories={() => setCategoryModalOpen(true)}
        onManageSizes={() => setSizeModalOpen(true)}
        onSearch={() => setSearchModalOpen(true)}
        onManageContainers={() => setContainerManagementModalOpen(true)}
        onExport={handleExport}
        onImport={handleImport}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedContainer ? (
          <StorageGrid
            container={selectedContainer}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Select a Storage Container
              </h2>
              <p className="text-slate-500">
                Choose a container from the sidebar to view its contents
              </p>
            </div>
          </div>
        )}
      </div>

      <ItemModal
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        categories={categories}
        containerId={selectedContainerId}
        position={selectedPosition}
        editingItem={editingItem}
      />

      <CategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
      />

      <SizeModal
        open={sizeModalOpen}
        onOpenChange={setSizeModalOpen}
      />

      <ContainerModal
        open={containerModalOpen}
        onOpenChange={handleContainerModalClose}
        editingContainer={editingContainer}
      />

      <SearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        onItemClick={handleSearchItemClick}
      />

      <ContainerManagementModal
        open={containerManagementModalOpen}
        onOpenChange={setContainerManagementModalOpen}
        onEditContainer={handleEditContainer}
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  );
}
