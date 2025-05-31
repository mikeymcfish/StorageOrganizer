import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit2, Trash2, Settings } from "lucide-react";
import type { StorageContainer } from "@shared/schema";

interface ContainerManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditContainer: (container: StorageContainer) => void;
}

export function ContainerManagementModal({ 
  open, 
  onOpenChange, 
  onEditContainer 
}: ContainerManagementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: containers = [] } = useQuery<StorageContainer[]>({
    queryKey: ["/api/containers"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/containers/${id}`);
      if (!response.ok) throw new Error("Failed to delete container");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/containers"] });
      toast({ title: "Container deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete container", variant: "destructive" });
    },
  });

  const handleEdit = (container: StorageContainer) => {
    onEditContainer(container);
    onOpenChange(false);
  };

  const handleDelete = async (container: StorageContainer) => {
    if (window.confirm(`Are you sure you want to delete "${container.name}"? This will also delete all items in this container.`)) {
      deleteMutation.mutate(container.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Storage Containers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {containers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No containers created yet
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {containers.map((container) => (
                  <Card key={container.id} className="hover:bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{container.name}</h3>
                          {container.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {container.description}
                            </p>
                          )}
                          <div className="text-sm text-gray-500 mt-2">
                            Grid: {container.gridConfig.rows.length} rows × {Math.max(...container.gridConfig.rows.map(r => r.columns))} columns
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(container)}
                            disabled={deleteMutation.isPending}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(container)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}