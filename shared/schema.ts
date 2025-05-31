import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Storage containers table
export const storageContainers = sqliteTable("storage_containers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  gridConfig: text("grid_config").notNull(),
});

// Categories table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  icon: text("icon"),
});

// Size options table
export const sizeOptions = sqliteTable("size_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// Items table
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  value: real("value"),
  categoryId: integer("category_id").references(() => categories.id),
  size: text("size"),
  quantity: integer("quantity").default(1),
  information: text("information"),
  photo: text("photo"),
  containerId: integer("container_id").notNull().references(() => storageContainers.id),
  position: text("position").notNull(),
});

// Insert schemas
export const insertStorageContainerSchema = createInsertSchema(storageContainers).omit({
  id: true,
}).extend({
  gridConfig: z.object({
    rows: z.array(z.object({
      columns: z.number(),
      isDivider: z.boolean().optional(),
    })),
  }),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertSizeOptionSchema = createInsertSchema(sizeOptions).omit({
  id: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
}).extend({
  position: z.object({
    row: z.number(),
    column: z.number(),
  }),
});

// Types with proper JSON parsing
export type StorageContainer = {
  id: number;
  name: string;
  description: string | null;
  gridConfig: {
    rows: Array<{ columns: number; isDivider?: boolean }>;
  };
};

export type InsertStorageContainer = z.infer<typeof insertStorageContainerSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type SizeOption = typeof sizeOptions.$inferSelect;
export type InsertSizeOption = z.infer<typeof insertSizeOptionSchema>;

export type Item = {
  id: number;
  name: string;
  value: number | null;
  categoryId: number | null;
  size: string | null;
  quantity: number | null;
  information: string | null;
  photo: string | null;
  containerId: number;
  position: {
    row: number;
    column: number;
  };
};

export type InsertItem = z.infer<typeof insertItemSchema>;

// Extended types for joins
export type ItemWithCategory = Item & {
  category?: Category;
};

export type ItemSearchResult = ItemWithCategory & {
  containerName: string;
};
