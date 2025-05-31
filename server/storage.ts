import {
  type StorageContainer,
  type InsertStorageContainer,
  type Category,
  type InsertCategory,
  type SizeOption,
  type InsertSizeOption,
  type Item,
  type InsertItem,
  type ItemWithCategory,
  type ItemSearchResult,
  storageContainers,
  categories,
  sizeOptions,
  items,
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, asc, and, isNotNull, sql } from "drizzle-orm";

export interface IStorage {
  // Storage containers
  getStorageContainers(): Promise<StorageContainer[]>;
  getStorageContainer(id: number): Promise<StorageContainer | undefined>;
  createStorageContainer(container: InsertStorageContainer): Promise<StorageContainer>;
  updateStorageContainer(id: number, container: Partial<InsertStorageContainer>): Promise<StorageContainer | undefined>;
  deleteStorageContainer(id: number): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Size options
  getSizeOptions(): Promise<SizeOption[]>;
  getSizeOption(id: number): Promise<SizeOption | undefined>;
  createSizeOption(sizeOption: InsertSizeOption): Promise<SizeOption>;
  updateSizeOption(id: number, sizeOption: Partial<InsertSizeOption>): Promise<SizeOption | undefined>;
  deleteSizeOption(id: number): Promise<boolean>;

  // Items
  getItems(): Promise<ItemWithCategory[]>;
  getItemsByContainer(containerId: number): Promise<ItemWithCategory[]>;
  getItem(id: number): Promise<ItemWithCategory | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  searchItems(query: string): Promise<ItemSearchResult[]>;
}

export class DatabaseStorage implements IStorage {
  async getStorageContainers(): Promise<StorageContainer[]> {
    return await db.select().from(storageContainers);
  }

  async getStorageContainer(id: number): Promise<StorageContainer | undefined> {
    const [container] = await db.select().from(storageContainers).where(eq(storageContainers.id, id));
    return container || undefined;
  }

  async createStorageContainer(container: InsertStorageContainer): Promise<StorageContainer> {
    const [newContainer] = await db
      .insert(storageContainers)
      .values(container)
      .returning();
    return newContainer;
  }

  async updateStorageContainer(id: number, container: Partial<InsertStorageContainer>): Promise<StorageContainer | undefined> {
    const [updated] = await db
      .update(storageContainers)
      .set(container)
      .where(eq(storageContainers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStorageContainer(id: number): Promise<boolean> {
    const result = await db.delete(storageContainers).where(eq(storageContainers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSizeOptions(): Promise<SizeOption[]> {
    return await db.select().from(sizeOptions).orderBy(asc(sizeOptions.sortOrder));
  }

  async getSizeOption(id: number): Promise<SizeOption | undefined> {
    const [sizeOption] = await db.select().from(sizeOptions).where(eq(sizeOptions.id, id));
    return sizeOption || undefined;
  }

  async createSizeOption(sizeOption: InsertSizeOption): Promise<SizeOption> {
    const [newSizeOption] = await db
      .insert(sizeOptions)
      .values(sizeOption)
      .returning();
    return newSizeOption;
  }

  async updateSizeOption(id: number, sizeOption: Partial<InsertSizeOption>): Promise<SizeOption | undefined> {
    const [updated] = await db
      .update(sizeOptions)
      .set(sizeOption)
      .where(eq(sizeOptions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSizeOption(id: number): Promise<boolean> {
    const result = await db.delete(sizeOptions).where(eq(sizeOptions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getItems(): Promise<ItemWithCategory[]> {
    const result = await db.select({
      id: items.id,
      name: items.name,
      value: items.value,
      categoryId: items.categoryId,
      size: items.size,
      quantity: items.quantity,
      information: items.information,
      photo: items.photo,
      containerId: items.containerId,
      position: items.position,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
      },
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id));

    return result.map(row => ({
      id: row.id,
      name: row.name,
      value: row.value,
      categoryId: row.categoryId,
      size: row.size,
      quantity: row.quantity,
      information: row.information,
      photo: row.photo,
      containerId: row.containerId,
      position: row.position,
      category: (row.category?.id !== null && row.category?.id !== undefined) ? row.category : undefined,
    }));
  }

  async getItemsByContainer(containerId: number): Promise<ItemWithCategory[]> {
    const result = await db.select({
      id: items.id,
      name: items.name,
      value: items.value,
      categoryId: items.categoryId,
      size: items.size,
      quantity: items.quantity,
      information: items.information,
      photo: items.photo,
      containerId: items.containerId,
      position: items.position,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
      },
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(eq(items.containerId, containerId));

    return result.map(row => ({
      id: row.id,
      name: row.name,
      value: row.value,
      categoryId: row.categoryId,
      size: row.size,
      quantity: row.quantity,
      information: row.information,
      photo: row.photo,
      containerId: row.containerId,
      position: row.position,
      category: (row.category?.id !== null && row.category?.id !== undefined) ? row.category : undefined,
    }));
  }

  async getItem(id: number): Promise<ItemWithCategory | undefined> {
    const result = await db.select({
      id: items.id,
      name: items.name,
      value: items.value,
      categoryId: items.categoryId,
      size: items.size,
      quantity: items.quantity,
      information: items.information,
      photo: items.photo,
      containerId: items.containerId,
      position: items.position,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
      },
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(eq(items.id, id));

    const [row] = result;
    if (!row) return undefined;

    return {
      id: row.id,
      name: row.name,
      value: row.value,
      categoryId: row.categoryId,
      size: row.size,
      quantity: row.quantity,
      information: row.information,
      photo: row.photo,
      containerId: row.containerId,
      position: row.position,
      category: (row.category?.id !== null && row.category?.id !== undefined) ? row.category : undefined,
    };
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }

  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined> {
    const [updated] = await db
      .update(items)
      .set(item)
      .where(eq(items.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteItem(id: number): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchItems(query: string): Promise<ItemSearchResult[]> {
    const result = await db.select({
      id: items.id,
      name: items.name,
      value: items.value,
      categoryId: items.categoryId,
      size: items.size,
      quantity: items.quantity,
      information: items.information,
      photo: items.photo,
      containerId: items.containerId,
      position: items.position,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
      },
      containerName: storageContainers.name,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(storageContainers, eq(items.containerId, storageContainers.id))
    .where(or(
      like(items.name, `%${query}%`),
      and(isNotNull(items.information), like(items.information, `%${query}%`))
    ));

    return result.map(row => ({
      id: row.id,
      name: row.name,
      value: row.value,
      categoryId: row.categoryId,
      size: row.size,
      quantity: row.quantity,
      information: row.information,
      photo: row.photo,
      containerId: row.containerId,
      position: row.position,
      containerName: row.containerName || '',
      category: (row.category?.id !== null && row.category?.id !== undefined) ? row.category : undefined,
    }));
  }
}

// Initialize default data
async function initializeDefaultData() {
  try {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      // Add default categories
      await db.insert(categories).values([
        { name: "Office Supplies", color: "#3b82f6", icon: "paperclip" },
        { name: "Electronics", color: "#10b981", icon: "usb" },
        { name: "Tools", color: "#f59e0b", icon: "wrench" },
        { name: "Books", color: "#8b5cf6", icon: "book" },
        { name: "Stationery", color: "#ef4444", icon: "pen" },
      ]);
    }

    // Check if size options already exist
    const existingSizes = await db.select().from(sizeOptions);
    if (existingSizes.length === 0) {
      // Add default size options
      await db.insert(sizeOptions).values([
        { name: "xs", label: "Extra Small", sortOrder: 1 },
        { name: "sm", label: "Small", sortOrder: 2 },
        { name: "md", label: "Medium", sortOrder: 3 },
        { name: "lg", label: "Large", sortOrder: 4 },
        { name: "xl", label: "Extra Large", sortOrder: 5 },
      ]);
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}

const storage = new DatabaseStorage();

// Initialize default data when the module loads
initializeDefaultData();

export { storage };