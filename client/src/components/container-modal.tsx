import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ContainerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GridRow = {
  columns: number;
  isDivider?: boolean;
};

export function ContainerModal({ open, onOpenChange }: ContainerModalProps) {
  const [gridRows, setGridRows] = useState<GridRow[]>([{ columns: 5 }]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/containers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/containers"] });
      toast({ title: "Storage container created successfully" });
      form.reset();
      setGridRows([{ columns: 5 }]);
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to create container", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    const containerData = {
      ...data,
      description: data.description || null,
      gridConfig: {
        rows: gridRows,
      },
    };

    createMutation.mutate(containerData);
  };

  const addRow = (columns: number) => {
    setGridRows([...gridRows, { columns }]);
  };

  const addDivider = () => {
    setGridRows([...gridRows, { columns: 0, isDivider: true }]);
  };

  const removeRow = (index: number) => {
    setGridRows(gridRows.filter((_, i) => i !== index));
  };

  const updateRowColumns = (index: number, columns: number) => {
    const newRows = [...gridRows];
    newRows[index] = { ...newRows[index], columns };
    setGridRows(newRows);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Storage Container</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Container Details */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Container Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Garage Storage #1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Optional description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Add Row Controls */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Grid Configuration</h4>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="Columns"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const target = e.target as HTMLInputElement;
                          const columns = parseInt(target.value);
                          if (columns >= 1 && columns <= 12) {
                            addRow(columns);
                            target.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Columns"]') as HTMLInputElement;
                        const columns = parseInt(input.value);
                        if (columns >= 1 && columns <= 12) {
                          addRow(columns);
                          input.value = "";
                        }
                      }}
                    >
                      Add Row
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDivider}
                    className="w-full"
                  >
                    Add Divider
                  </Button>
                </div>
              </div>

              {/* Grid Preview */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Grid Preview</h4>
                <Card>
                  <CardContent className="p-4 max-h-80 overflow-y-auto">
                    <div className="space-y-3">
                      {gridRows.map((row, index) => {
                        if (row.isDivider) {
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRow(index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        }

                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Row {index + 1}</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={row.columns}
                                  onChange={(e) => updateRowColumns(index, parseInt(e.target.value) || 1)}
                                  className="w-16 h-6 text-xs"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRow(index)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div 
                              className="grid gap-1"
                              style={{ 
                                gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))` 
                              }}
                            >
                              {Array.from({ length: row.columns }, (_, colIndex) => (
                                <div
                                  key={colIndex}
                                  className="aspect-square bg-slate-100 border border-slate-200 rounded"
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      
                      {gridRows.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <p className="text-sm">No rows configured yet</p>
                          <p className="text-xs mt-1">Add rows to create your grid layout</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={createMutation.isPending || gridRows.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Container
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
