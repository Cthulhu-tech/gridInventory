import { InventoryItem } from "./inventoryItem";

export class InventoryGrid {
    rows: number;
    columns: number;
    grid: string[][] | null[][];
    items: Map<string, InventoryItem> = new Map();
    
    constructor(rows: number, columns: number) {
        this.rows = rows;
        this.columns = columns;
        this.grid = Array.from({ length: rows }, () => Array(columns).fill(null));
    }

    addItem(item: InventoryItem, row: number, column: number): boolean {
        if (this.canPlaceItem(item, row, column)) {
            for (let r = 0; r < item.height; r++) {
                for (let c = 0; c < item.width; c++) {
                    this.grid[row + r][column + c] = item.id;
                }
            }
            this.items.set(item.id, item);
            return true;
        }
        return false;
    }

    canPlaceItem(item: InventoryItem, row: number, column: number): boolean {
        if (row + item.height > this.rows || column + item.width > this.columns) {
            return false;
        }
        for (let r = 0; r < item.height; r++) {
            for (let c = 0; c < item.width; c++) {
                if (this.grid[row + r][column + c] !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    removeItem(itemId: string): boolean {
        const item = this.items.get(itemId);
        if (item) {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.columns; c++) {
                    if (this.grid[r][c] === itemId) {
                        this.grid[r][c] = null;
                    }
                }
            }
            this.items.delete(itemId);
            return true;
        }
        return false;
    }

    getItemAt(row: number, column: number): InventoryItem | null {
        const itemId = this.grid[row][column];
        return itemId ? this.items.get(itemId) ?? null : null;
    }

    findItemTopLeft(itemId: string): { row: number; col: number } | null {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                if (this.grid[r][c] === itemId)
                    return { row: r, col: c };
            }
        }
        return null;
    }

    canPlaceItemIgnoring(itemId: string, item: InventoryItem, row: number, col: number): boolean {
        for (let r = 0; r < item.height; r++) {
            for (let c = 0; c < item.width; c++) {
                const cell = this.grid[row + r][col + c];
                if (cell !== null && cell !== itemId) return false;
            }
        }
        return true;
    }

    moveItem(itemId: string, newRow: number, newCol: number, w?: number, h?: number): boolean {
        const item = this.items.get(itemId);
        if (!item) return false;
      
        const width  = w ?? item.currentWidth  ?? item.width;
        const height = h ?? item.currentHeight ?? item.height;
      
        for (let r = 0; r < this.rows; r++) {
          for (let c = 0; c < this.columns; c++) {
            if (this.grid[r][c] === itemId) this.grid[r][c] = null;
          }
        }

        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            this.grid[newRow + r][newCol + c] = itemId;
          }
        }
        return true;
    }
}
