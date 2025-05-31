import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, HelpCircle } from "lucide-react";
import { Icon } from "@/components/icon";
import type { Category } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorOptions = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f97316", label: "Orange" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#84cc16", label: "Lime" },
  { value: "#ec4899", label: "Pink" },
  { value: "#64748b", label: "Slate" },
];

const iconOptions = [
  // Custom SVG icons
  { value: "custom-crystal", label: "Crystal" },
];

export function CategoryModal({ open, onOpenChange }: CategoryModalProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      icon: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category created successfully" });
      form.reset();
      setEditingCategory(null);
    },
    onError: () => {
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest(
        "PATCH",
        `/api/categories/${editingCategory!.id}`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category updated successfully" });
      form.reset();
      setEditingCategory(null);
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingCategory) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      color: category.color,
      icon: category.icon || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div>
            <h3 className="font-medium mb-4">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Color <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: field.value }}
                                />
                                {
                                  colorOptions.find(
                                    (c) => c.value === field.value,
                                  )?.label
                                }
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Icon (Optional)</FormLabel>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowHelp(true)}
                          className="h-5 w-5 p-0"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon">
                              {field.value && (
                                <div className="flex items-center gap-2">
                                  <Icon name={field.value} size={16} />
                                  {
                                    iconOptions.find(
                                      (i) => i.value === field.value,
                                    )?.label
                                  }
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <Icon name={icon.value} size={16} />
                                {icon.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  {editingCategory && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingCategory ? "Update" : "Add"} Category
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Category List */}
          <div>
            <h3 className="font-medium mb-4">Existing Categories</h3>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.icon && (
                              <Icon
                                name={category.icon}
                                size={12}
                                className="text-white"
                              />
                            )}
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(category.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>No categories yet</p>
                    <p className="text-sm mt-1">Create your first category</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
      
      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adding Custom SVG Icons</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Step 1: Add your SVG file</h4>
              <p className="text-gray-600">
                Place your SVG file in the <code className="bg-gray-100 px-1 rounded">client/src/assets/icons/</code> folder 
                (e.g., <code className="bg-gray-100 px-1 rounded">my-icon.svg</code>)
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Step 2: Update the icon component</h4>
              <p className="text-gray-600 mb-2">
                Edit <code className="bg-gray-100 px-1 rounded">client/src/components/icon.tsx</code> and add your icon:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const customIcons: Record<string, string> = {
  "custom-example": "/src/assets/icons/example.svg",
  "custom-my-icon": "/src/assets/icons/my-icon.svg", // Add this
};`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Step 3: Add to selection list</h4>
              <p className="text-gray-600 mb-2">
                Edit <code className="bg-gray-100 px-1 rounded">client/src/components/category-modal.tsx</code> and add to iconOptions:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{ value: "custom-my-icon", label: "My Custom Icon" },`}
              </pre>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500">
                Custom icons must start with "custom-" and will automatically inherit colors and sizing.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setShowHelp(false)} variant="outline">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
