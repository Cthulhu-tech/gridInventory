import OverlapSizer from "phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer";
import { InventoryGrid } from "./inventoryGrid";
import GridSizer from "phaser3-rex-plugins/templates/ui/gridsizer/GridSizer";
import { DragController } from "./inventoryDragController";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import { InventoryItem } from "./inventoryItem";
import { Game } from "../scenes/Game";
import { EnumGameColor } from "../../constant/gameColor";
import { Inventory } from "../../constant/gameConst";
import { EnumeSpecialSize } from "../../constant/size";
import { InventoryImage } from "../../constant/gameImage";

export class InventoryGridUI {
  scene: Game;
  inventoryGrid: InventoryGrid;
  cellSize: number;
  cellPadding: number;
  overlapSizer: OverlapSizer;
  gridSizer: GridSizer;
  itemSprites: Map<string, OverlapSizer> = new Map();
  rexUI: UIPlugin;
  x: number;
  y: number;
  dragController: DragController;

  constructor(
    scene: Game,
    inventoryGrid: InventoryGrid,
    cellSize: number = 32,
    cellPadding: number = 0,
    x = 0,
    y = 0
  ) {
    this.scene = scene;
    this.rexUI = scene.rexUI;
    this.inventoryGrid = inventoryGrid;
    this.cellSize = cellSize;
    this.cellPadding = cellPadding;
    this.x = x;
    this.y = y;

    this.createGrid();

    this.dragController = new DragController(scene, this.overlapSizer, cellSize, cellPadding, inventoryGrid);
  }

  createGrid() {
    const width  = this.inventoryGrid.columns * (this.cellSize + this.cellPadding) + this.cellPadding;
    const height = this.inventoryGrid.rows * (this.cellSize + this.cellPadding) + this.cellPadding;

    this.overlapSizer = this.rexUI.add.overlapSizer({
      x: this.x,
      y: this.y,
      width,
      height,
      space: { left: this.cellPadding, right: this.cellPadding, top: this.cellPadding, bottom: this.cellPadding }
    });

    this.gridSizer = this.rexUI.add.gridSizer({
      width, height,
      column: this.inventoryGrid.columns,
      row: this.inventoryGrid.rows,
      columnProportions: Array(this.inventoryGrid.columns).fill(0),
      rowProportions: Array(this.inventoryGrid.rows).fill(0),
      space: {
        left: this.cellPadding, right: this.cellPadding,
        top: this.cellPadding, bottom: this.cellPadding,
        column: this.cellPadding, row: this.cellPadding
      },
      createCellContainerCallback: (scene: Phaser.Scene) =>
        (scene as Game).rexUI.add.imageBox(0, 0, InventoryImage.cell),
    });

    this.overlapSizer.add(this.gridSizer, {
      align: 'left-top',
      expand: true,
      offsetX: 0,
      offsetY: 0,
    });

    this.overlapSizer.layout();
  }

  addItem(item: InventoryItem, row: number, column: number): boolean {
    if (!this.inventoryGrid.addItem(item, row, column)) return false;

    const w = (item.width  * (this.cellSize + this.cellPadding) - this.cellPadding - 2);
    const h = (item.height * (this.cellSize + this.cellPadding) - this.cellPadding - 2);

    const x = this.cellPadding + column * (this.cellSize + this.cellPadding);
    const y = this.cellPadding + row    * (this.cellSize + this.cellPadding);

    const imagebox = this.rexUI.add.imageBox(0, 0, item.icon, '');
    const itemWrapper    = this.rexUI.add.overlapSizer({ width: w, height: h });
    const itemSubWrapper = this.rexUI.add.overlapSizer({ width: w, height: h });

    const el = this.rexUI.add.roundRectangle({
      width: w, height: h,
      color: EnumGameColor.COLOR_INVENTORY_ELEMENT,
      alpha: Inventory.ZONE_ALPHA,
      strokeColor: EnumGameColor.COLOR_INVENTORY_ELEMENT_STROKE,
      strokeAlpha: Inventory.STROKE_ALPHA,
      radius: EnumeSpecialSize.RADIUS,
      strokeWidth: EnumeSpecialSize.STROKE_WIDTH,
    });

    itemSubWrapper.add(el, { align: 'center-center', expand: true, key: 'el' });
    itemSubWrapper.add(imagebox, { align: 'center-center', expand: true, key: 'img' });

    itemSubWrapper.setOrigin(.5, .5);

    itemWrapper.addBackground(itemSubWrapper, 0, 'subWrapper');
    itemWrapper.setOrigin(0, 0); 

    this.overlapSizer.add(itemWrapper, {
      align: 'left-top',
      expand: false,
      offsetX: x,
      offsetY: y,
    });

    this.dragController.attach(item, itemWrapper, row, column);

    this.overlapSizer.layout();

    this.itemSprites.set(item.id, itemWrapper);
    return true;
  }

  addItemAuto(item: InventoryItem): boolean {
    const maxRow = this.inventoryGrid.rows - item.height;
    const maxCol = this.inventoryGrid.columns - item.width;

    for (let row = 0; row <= maxRow; row++) {
      for (let column = 0; column <= maxCol; column++) {
        if (this.addItem(item, row, column)) {
          return true;
        }
      }
    }
    return false;
  }

  removeItem(itemId: string): boolean {
    const go = this.itemSprites.get(itemId);
    if (!go) return false;
    this.inventoryGrid.removeItem(itemId);
    this.overlapSizer.remove(go, true);
    this.itemSprites.delete(itemId);
    this.overlapSizer.layout();
    return true;
  }
}
