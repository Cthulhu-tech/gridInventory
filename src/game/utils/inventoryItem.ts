export class InventoryItem {
    id: string;
    name: string;
    description: string;
    width: number;
    height: number;
    icon: string;
    stack: number = 1;
    disabled: boolean = false;
    currentWidth: number;
    currentHeight: number;
    prevWidth: number;
    prevHeight: number;
    deg: number = 0;
    currentDeg: number = 0;
    prevDeg: number = 0;
    constructor({
        id, name, description, width, height, icon, stack = 1, disabled = false,
    }: {
        id: string;
        name: string;
        description: string;
        width: number;
        height: number;
        icon: string;
        stack?: number;
        disabled?: boolean;
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.width = width;
        this.height = height;
        this.icon = icon;
        this.stack = stack;
        this.disabled = disabled;
        this.currentWidth = width;
        this.currentHeight = height;
        this.prevWidth = width;
        this.prevHeight = height;
    }
}
