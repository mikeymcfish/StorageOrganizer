import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const handleContainerSelect = (containerId: number) => {
    setSelectedContainerId(containerId);
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
        onOpenChange={setContainerModalOpen}
      />
    </div>
  );
}
