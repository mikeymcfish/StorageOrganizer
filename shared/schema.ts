import { pgTable, text, serial, integer, real, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Storage containers table
export const storageContainers = pgTable("storage_containers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  gridConfig: json("grid_config").$type<{
    rows: Array<{ columns: number; isDivider?: boolean }>;
  }>().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  icon: text("icon"),
});

// Size options table
export const sizeOptions = pgTable("size_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  size: text("size"),
  quantity: integer("quantity").default(1),
  information: text("information"),
  photo: text("photo"),
  containerId: integer("container_id").notNull().references(() => storageContainers.id),
  position: json("position").$type<{
    row: number;
    column: number;
  }>().notNull(),
});

// Insert schemas
export const insertStorageContainerSchema = createInsertSchema(storageContainers).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertSizeOptionSchema = createInsertSchema(sizeOptions).omit({
  id: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

// Types
export type StorageContainer = typeof storageContainers.$inferSelect;
export type InsertStorageContainer = z.infer<typeof insertStorageContainerSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type SizeOption = typeof sizeOptions.$inferSelect;
export type InsertSizeOption = z.infer<typeof insertSizeOptionSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

// Extended types for joins
export type ItemWithCategory = Item & {
  category?: Category;
};

export type ItemSearchResult = ItemWithCategory & {
  containerName: string;
};

// Relations
export const storageContainersRelations = relations(storageContainers, ({ many }) => ({
  items: many(items),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export const sizeOptionsRelations = relations(sizeOptions, ({ many }) => ({
  items: many(items),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  container: one(storageContainers, {
    fields: [items.containerId],
    references: [storageContainers.id],
  }),
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  sizeOption: one(sizeOptions, {
    fields: [items.size],
    references: [sizeOptions.name],
  }),
}));
