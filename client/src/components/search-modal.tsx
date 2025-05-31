import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Icon } from "@/components/icon";
import type { ItemSearchResult } from "@shared/schema";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults = [], isLoading } = useQuery<ItemSearchResult[]>({
    queryKey: ["/api/search", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
  });

  const handleClose = () => {
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search Items</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items by name or information..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className="min-h-[200px]">
            {searchQuery.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                Type to search for items...
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No items found for "{searchQuery}"
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {searchResults.map((item) => (
                    <Card key={item.id} className="hover:bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {item.category?.icon && (
                                <div
                                  className="w-6 h-6 rounded flex items-center justify-center"
                                  style={{ backgroundColor: item.category.color }}
                                >
                                  <Icon name={item.category.icon} size={12} className="text-white" />
                                </div>
                              )}
                              <h3 className="font-medium">{item.name}</h3>
                              {item.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.category.name}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Container:</strong> {item.containerName}</p>
                              {item.value && <p><strong>Value:</strong> ${item.value}</p>}
                              {item.size && <p><strong>Size:</strong> {item.size}</p>}
                              {item.quantity && <p><strong>Quantity:</strong> {item.quantity}</p>}
                              {item.information && (
                                <p><strong>Info:</strong> {item.information}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}