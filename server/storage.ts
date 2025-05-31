import { 
  storageContainers, 
  categories, 
  items,
  sizeOptions,
  type StorageContainer,
  type InsertStorageContainer,
  type Category,
  type InsertCategory,
  type SizeOption,
  type InsertSizeOption,
  type Item,
  type InsertItem,
  type ItemWithCategory,
  type ItemSearchResult
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private storageContainers: Map<number, StorageContainer>;
  private categories: Map<number, Category>;
  private sizeOptions: Map<number, SizeOption>;
  private items: Map<number, Item>;
  private currentContainerId: number;
  private currentCategoryId: number;
  private currentSizeOptionId: number;
  private currentItemId: number;

  constructor() {
    this.storageContainers = new Map();
    this.categories = new Map();
    this.sizeOptions = new Map();
    this.items = new Map();
    this.currentContainerId = 1;
    this.currentCategoryId = 1;
    this.currentSizeOptionId = 1;
    this.currentItemId = 1;

    // Initialize with default categories and sizes
    this.initializeDefaultCategories();
    this.initializeDefaultSizes();
  }

  private initializeDefaultCategories() {
    const defaultCategories = [
      { name: "Office Supplies", color: "#3b82f6", icon: "paperclip" },
      { name: "Electronics", color: "#8b5cf6", icon: "usb" },
      { name: "Books", color: "#f59e0b", icon: "book" },
      { name: "Tools", color: "#ef4444", icon: "wrench" },
      { name: "Stationery", color: "#10b981", icon: "pen" },
    ];

    defaultCategories.forEach(cat => {
      const category: Category = { ...cat, id: this.currentCategoryId++ };
      this.categories.set(category.id, category);
    });
  }

  private initializeDefaultSizes() {
    const defaultSizes = [
      { name: "xs", label: "Extra Small", sortOrder: 1 },
      { name: "s", label: "Small", sortOrder: 2 },
      { name: "m", label: "Medium", sortOrder: 3 },
      { name: "l", label: "Large", sortOrder: 4 },
      { name: "xl", label: "Extra Large", sortOrder: 5 },
    ];

    defaultSizes.forEach(size => {
      const sizeOption: SizeOption = { ...size, id: this.currentSizeOptionId++ };
      this.sizeOptions.set(sizeOption.id, sizeOption);
    });
  }

  // Storage Containers
  async getStorageContainers(): Promise<StorageContainer[]> {
    return Array.from(this.storageContainers.values());
  }

  async getStorageContainer(id: number): Promise<StorageContainer | undefined> {
    return this.storageContainers.get(id);
  }

  async createStorageContainer(container: InsertStorageContainer): Promise<StorageContainer> {
    const id = this.currentContainerId++;
    const newContainer: StorageContainer = { 
      ...container, 
      id,
      description: container.description || null
    };
    this.storageContainers.set(id, newContainer);
    return newContainer;
  }

  async updateStorageContainer(id: number, container: Partial<InsertStorageContainer>): Promise<StorageContainer | undefined> {
    const existing = this.storageContainers.get(id);
    if (!existing) return undefined;
    
    const updated: StorageContainer = { ...existing, ...container };
    this.storageContainers.set(id, updated);
    return updated;
  }

  async deleteStorageContainer(id: number): Promise<boolean> {
    return this.storageContainers.delete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { 
      ...category, 
      id,
      icon: category.icon || null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated: Category = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Size Options
  async getSizeOptions(): Promise<SizeOption[]> {
    return Array.from(this.sizeOptions.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getSizeOption(id: number): Promise<SizeOption | undefined> {
    return this.sizeOptions.get(id);
  }

  async createSizeOption(sizeOption: InsertSizeOption): Promise<SizeOption> {
    const id = this.currentSizeOptionId++;
    const newSizeOption: SizeOption = { 
      ...sizeOption, 
      id,
      sortOrder: sizeOption.sortOrder || 0
    };
    this.sizeOptions.set(id, newSizeOption);
    return newSizeOption;
  }

  async updateSizeOption(id: number, sizeOption: Partial<InsertSizeOption>): Promise<SizeOption | undefined> {
    const existing = this.sizeOptions.get(id);
    if (!existing) return undefined;
    
    const updated: SizeOption = { ...existing, ...sizeOption };
    this.sizeOptions.set(id, updated);
    return updated;
  }

  async deleteSizeOption(id: number): Promise<boolean> {
    return this.sizeOptions.delete(id);
  }

  // Items
  async getItems(): Promise<ItemWithCategory[]> {
    return Array.from(this.items.values()).map(item => ({
      ...item,
      category: item.categoryId ? this.categories.get(item.categoryId) : undefined,
    }));
  }

  async getItemsByContainer(containerId: number): Promise<ItemWithCategory[]> {
    return Array.from(this.items.values())
      .filter(item => item.containerId === containerId)
      .map(item => ({
        ...item,
        category: item.categoryId ? this.categories.get(item.categoryId) : undefined,
      }));
  }

  async getItem(id: number): Promise<ItemWithCategory | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    return {
      ...item,
      category: item.categoryId ? this.categories.get(item.categoryId) : undefined,
    };
  }

  async createItem(item: InsertItem): Promise<Item> {
    const id = this.currentItemId++;
    const newItem: Item = { 
      ...item, 
      id,
      value: item.value || null,
      categoryId: item.categoryId || null,
      size: item.size || null,
      quantity: item.quantity || 1,
      information: item.information || null,
      photo: item.photo || null
    };
    this.items.set(id, newItem);
    return newItem;
  }

  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    
    const updated: Item = { ...existing, ...item };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }

  async searchItems(query: string): Promise<ItemSearchResult[]> {
    const lowerQuery = query.toLowerCase();
    const results: ItemSearchResult[] = [];

    for (const item of Array.from(this.items.values())) {
      if (item.name.toLowerCase().includes(lowerQuery) ||
          item.information?.toLowerCase().includes(lowerQuery)) {
        const container = this.storageContainers.get(item.containerId);
        if (container) {
          results.push({
            ...item,
            category: item.categoryId ? this.categories.get(item.categoryId) : undefined,
            containerName: container.name,
          });
        }
      }
    }

    return results;
  }
}

import { db } from "./db";
import { eq, like, or } from "drizzle-orm";
import { storageContainers, categories, sizeOptions, items } from "@shared/schema";

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
    return result.rowCount > 0;
  }

  async getSizeOptions(): Promise<SizeOption[]> {
    return await db.select().from(sizeOptions).orderBy(sizeOptions.sortOrder);
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
    return result.rowCount > 0;
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
      ...row,
      category: row.category.id ? row.category : undefined,
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
      ...row,
      category: row.category.id ? row.category : undefined,
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
      ...row,
      category: row.category.id ? row.category : undefined,
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
    return result.rowCount > 0;
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
      like(items.information, `%${query}%`)
    ));

    return result.map(row => ({
      ...row,
      category: row.category.id ? row.category : undefined,
    }));
  }
}

export const storage = new DatabaseStorage();
