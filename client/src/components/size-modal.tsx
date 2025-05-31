import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { SizeOption } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  label: z.string().min(1, "Label is required"),
  sortOrder: z.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

interface SizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SizeModal({ open, onOpenChange }: SizeModalProps) {
  const [editingSizeOption, setEditingSizeOption] = useState<SizeOption | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sizeOptions = [] } = useQuery<SizeOption[]>({
    queryKey: ["/api/size-options"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      label: "",
      sortOrder: sizeOptions.length + 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/size-options", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/size-options"] });
      toast({ title: "Size option created successfully" });
      form.reset();
      setEditingSizeOption(null);
    },
    onError: () => {
      toast({ title: "Failed to create size option", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PATCH", `/api/size-options/${editingSizeOption!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/size-options"] });
      toast({ title: "Size option updated successfully" });
      form.reset();
      setEditingSizeOption(null);
    },
    onError: () => {
      toast({ title: "Failed to update size option", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/size-options/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/size-options"] });
      toast({ title: "Size option deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete size option", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingSizeOption) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (sizeOption: SizeOption) => {
    setEditingSizeOption(sizeOption);
    form.reset({
      name: sizeOption.name,
      label: sizeOption.label,
      sortOrder: sizeOption.sortOrder || 0,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this size option?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingSizeOption(null);
    form.reset();
  };

  const moveSizeOption = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = sizeOptions.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sizeOptions.length) return;

    const current = sizeOptions[currentIndex];
    const target = sizeOptions[targetIndex];

    // Swap sort orders
    await updateMutation.mutateAsync({
      name: current.name,
      label: current.label,
      sortOrder: target.sortOrder || 0,
    });

    await updateMutation.mutateAsync({
      name: target.name,
      label: target.label,
      sortOrder: current.sortOrder || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Size Options</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div>
            <h3 className="font-medium mb-4">
              {editingSizeOption ? "Edit Size Option" : "Add New Size Option"}
            </h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., xs, s, m, l, xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Label <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Extra Small, Small" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  {editingSizeOption && (
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingSizeOption ? "Update" : "Add"} Size Option
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Size Options List */}
          <div>
            <h3 className="font-medium mb-4">Existing Size Options</h3>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {sizeOptions.map((sizeOption, index) => (
                  <Card key={sizeOption.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-slate-500 w-8">
                            #{sizeOption.sortOrder}
                          </div>
                          <div>
                            <span className="font-medium">{sizeOption.label}</span>
                            <div className="text-sm text-slate-500">({sizeOption.name})</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveSizeOption(sizeOption.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveSizeOption(sizeOption.id, 'down')}
                            disabled={index === sizeOptions.length - 1}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(sizeOption)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(sizeOption.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {sizeOptions.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>No size options yet</p>
                    <p className="text-sm mt-1">Create your first size option</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}