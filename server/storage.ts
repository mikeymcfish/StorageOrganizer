import { 
  storageContainers, 
  categories, 
  items,
  type StorageContainer,
  type InsertStorageContainer,
  type Category,
  type InsertCategory,
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
  private items: Map<number, Item>;
  private currentContainerId: number;
  private currentCategoryId: number;
  private currentItemId: number;

  constructor() {
    this.storageContainers = new Map();
    this.categories = new Map();
    this.items = new Map();
    this.currentContainerId = 1;
    this.currentCategoryId = 1;
    this.currentItemId = 1;

    // Initialize with default categories
    this.initializeDefaultCategories();
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

  // Storage Containers
  async getStorageContainers(): Promise<StorageContainer[]> {
    return Array.from(this.storageContainers.values());
  }

  async getStorageContainer(id: number): Promise<StorageContainer | undefined> {
    return this.storageContainers.get(id);
  }

  async createStorageContainer(container: InsertStorageContainer): Promise<StorageContainer> {
    const id = this.currentContainerId++;
    const newContainer: StorageContainer = { ...container, id };
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
    const newCategory: Category = { ...category, id };
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
    const newItem: Item = { ...item, id };
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

    for (const item of this.items.values()) {
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

export const storage = new MemStorage();
