import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStorageContainerSchema, insertCategorySchema, insertSizeOptionSchema, insertItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Storage Containers
  app.get("/api/containers", async (req, res) => {
    try {
      const containers = await storage.getStorageContainers();
      res.json(containers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch containers" });
	  console.error(error);
    }
  });

  app.get("/api/containers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const container = await storage.getStorageContainer(id);
      if (!container) {
        return res.status(404).json({ message: "Container not found" });
      }
      res.json(container);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch container" });
    }
  });

  app.post("/api/containers", async (req, res) => {
    try {
      const validatedData = insertStorageContainerSchema.parse(req.body);
      const container = await storage.createStorageContainer(validatedData);
      res.status(201).json(container);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create container" });
    }
  });

  app.patch("/api/containers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStorageContainerSchema.partial().parse(req.body);
      const container = await storage.updateStorageContainer(id, validatedData);
      if (!container) {
        return res.status(404).json({ message: "Container not found" });
      }
      res.json(container);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update container" });
    }
  });

  app.delete("/api/containers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStorageContainer(id);
      if (!success) {
        return res.status(404).json({ message: "Container not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Container deletion error:", error);
      res.status(500).json({ message: "Failed to delete container" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Items
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/containers/:containerId/items", async (req, res) => {
    try {
      const containerId = parseInt(req.params.containerId);
      const items = await storage.getItemsByContainer(containerId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.patch("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteItem(id);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Search
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const fields = req.query.fields as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const searchFields = fields ? fields.split(',') : ['name'];
      const results = await storage.searchItems(query, searchFields);
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search items" });
    }
  });

  // Export all data
  app.get("/api/export", async (req, res) => {
    try {
      const [containers, categories, sizeOptions, items] = await Promise.all([
        storage.getStorageContainers(),
        storage.getCategories(),
        storage.getSizeOptions(),
        storage.getItems()
      ]);

      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        containers,
        categories,
        sizeOptions,
        items
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="storage-data-export.json"');
      res.json(exportData);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Import data (items only)
  app.post("/api/import", async (req, res) => {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ 
          error: "Invalid data format. Expected 'items' array." 
        });
      }

      let imported = 0;
      let updated = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const item of items) {
        try {
          // Clean up the item data - remove category object, keep only categoryId
          const { category, ...cleanItem } = item;
          if (category && !cleanItem.categoryId) {
            cleanItem.categoryId = category.id;
          }

          // Check if there's already an item at this position
          const existingAtPosition = await storage.getItemByPosition(
            cleanItem.containerId, 
            cleanItem.position
          );

          if (cleanItem.id) {
            // Try to update existing item by ID
            const existingItem = await storage.getItem(cleanItem.id);
            if (existingItem) {
              const { id, ...itemData } = cleanItem;
              await storage.updateItem(cleanItem.id, itemData);
              updated++;
            } else {
              // Item with this ID doesn't exist, but check position conflict
              if (existingAtPosition && existingAtPosition.id !== cleanItem.id) {
                // Remove the item at this position first
                await storage.deleteItem(existingAtPosition.id);
              }
              const { id, ...itemData } = cleanItem;
              await storage.createItem(itemData);
              imported++;
            }
          } else {
            // No ID provided - check for position conflict
            if (existingAtPosition) {
              // Replace the existing item at this position
              const { id, ...itemData } = cleanItem;
              await storage.updateItem(existingAtPosition.id, itemData);
              updated++;
            } else {
              // Create new item
              const { id, ...itemData } = cleanItem;
              await storage.createItem(itemData);
              imported++;
            }
          }
        } catch (error: any) {
          failed++;
          const itemName = item.name || `Item at position ${item.position?.row || '?'}, ${item.position?.column || '?'}`;
          errors.push(`${itemName}: ${error.message || 'Unknown error'}`);
        }
      }

      res.json({ 
        success: true, 
        summary: {
          imported,
          updated,
          failed,
          total: items.length
        },
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import data" });
    }
  });

  // Size Options
  app.get("/api/size-options", async (req, res) => {
    try {
      const sizeOptions = await storage.getSizeOptions();
      res.json(sizeOptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch size options" });
    }
  });

  app.post("/api/size-options", async (req, res) => {
    try {
      const validatedData = insertSizeOptionSchema.parse(req.body);
      const sizeOption = await storage.createSizeOption(validatedData);
      res.status(201).json(sizeOption);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create size option" });
    }
  });

  app.patch("/api/size-options/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSizeOptionSchema.partial().parse(req.body);
      const sizeOption = await storage.updateSizeOption(id, validatedData);
      if (!sizeOption) {
        return res.status(404).json({ message: "Size option not found" });
      }
      res.json(sizeOption);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update size option" });
    }
  });

  app.delete("/api/size-options/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSizeOption(id);
      if (!success) {
        return res.status(404).json({ message: "Size option not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete size option" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
