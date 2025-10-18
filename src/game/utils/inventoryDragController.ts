import OverlapSizer from "phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer";
import { InventoryGrid } from "./inventoryGrid";
import { InventoryItem } from "./inventoryItem";
import { RotateController } from "./inventoryRotateController";
import type { InventoryGridUI } from "./inventoryGridUI";
import { GameDepth } from "../../constant/gameConst";

export class DragController {
  private scene: Phaser.Scene;
  private parent: OverlapSizer;
  private cellSize: number;
  private cellPadding: number;
  private inventoryGrid: InventoryGrid;
  private rotateController: RotateController;

  private inventories: InventoryGridUI[] = [];

  constructor(
    scene: Phaser.Scene,
    parent: OverlapSizer,
    cellSize: number,
    cellPadding: number,
    grid: InventoryGrid
  ) {
    this.scene = scene;
    this.parent = parent;
    this.cellSize = cellSize;
    this.cellPadding = cellPadding;
    this.inventoryGrid = grid;
    this.rotateController = new RotateController(this.scene);
  }

  public setInventories(inventories: InventoryGridUI[]) {
    this.inventories = inventories;
  }

  private findUIByParent(parent: OverlapSizer): InventoryGridUI | undefined {
    return this.inventories.find(ui => ui.overlapSizer === parent);
  }

  private uiWorldRect(ui: InventoryGridUI): Phaser.Geom.Rectangle {
    const tl = new Phaser.Math.Vector2();
    ui.overlapSizer.getTopLeft(tl);
    const w = ui.overlapSizer.width ?? (ui.overlapSizer).displayWidth ?? 0;
    const h = ui.overlapSizer.height ?? (ui.overlapSizer).displayHeight ?? 0;
    return new Phaser.Geom.Rectangle(tl.x, tl.y, w, h);
  }

  private pickTargetUI(wrapper: OverlapSizer, pointer: Phaser.Input.Pointer): InventoryGridUI | undefined {
    const tl = new Phaser.Math.Vector2();
    wrapper.getTopLeft(tl);
    const wr = new Phaser.Geom.Rectangle(tl.x, tl.y, wrapper.width, wrapper.height);

    let best: { ui: InventoryGridUI; area: number } | null = null;
    for (const ui of this.inventories) {
      const ur = this.uiWorldRect(ui);
      const inter = Phaser.Geom.Rectangle.Intersection(wr, ur);
      const area = Math.max(0, inter.width) * Math.max(0, inter.height);
      if (area > 0 && (!best || area > best.area)) best = { ui, area };
    }
    if (best) return best.ui;

    return this.inventories.find(ui => this.uiWorldRect(ui).contains(pointer.x, pointer.y));
  }

  attach(item: InventoryItem, wrapper: OverlapSizer, startRow: number, startCol: number): void {
    wrapper.setInteractive({ draggable: true });
    this.scene.input.setDraggable(wrapper, true);

    const sourceUI = this.findUIByParent(this.parent);
    if (!sourceUI) return;

    const step = this.cellSize + this.cellPadding;

    let oldRow = startRow;
    let oldCol = startCol;

    let holdDx = 0;
    let holdDy = 0;

    let baseWorldX = 0;
    let baseWorldY = 0;

    const topLeft = new Phaser.Math.Vector2();

    const currentLocalOffset = (col: number, row: number) => ({
      x: this.cellPadding + col * step,
      y: this.cellPadding + row * step,
    });

    let detached = false;

    wrapper.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      wrapper.getTopLeft(topLeft);
      const off = currentLocalOffset(oldCol, oldRow);
      baseWorldX = topLeft.x - off.x;
      baseWorldY = topLeft.y - off.y;

      this.parent.remove(wrapper, false);
      this.parent.layout();
      detached = true;

      holdDx = pointer.x - topLeft.x;
      holdDy = pointer.y - topLeft.y;

      wrapper.setPosition(pointer.x - holdDx, pointer.y - holdDy);
      this.scene.children.bringToTop(wrapper);
      wrapper.setDepth(GameDepth.UpperObject);

      this.rotateController.setActive(wrapper, item);
    });

    wrapper.on("drag", (pointer: Phaser.Input.Pointer) => {
      wrapper.setPosition(pointer.x - holdDx, pointer.y - holdDy);
    });

    wrapper.on("dragend", (pointer: Phaser.Input.Pointer) => {
      const targetUI = this.pickTargetUI(wrapper, pointer) ?? sourceUI;

      const targetTL = new Phaser.Math.Vector2();
      targetUI.overlapSizer.getTopLeft(targetTL);

      wrapper.getTopLeft(topLeft);
      const localX = topLeft.x - targetTL.x;
      const localY = topLeft.y - targetTL.y;

      const targetStep = targetUI.cellSize + targetUI.cellPadding;
      const newCol = Math.round((localX - targetUI.cellPadding) / targetStep);
      const newRow = Math.round((localY - targetUI.cellPadding) / targetStep);

      const w = item.currentWidth ?? item.width;
      const h = item.currentHeight ?? item.height;

      if (targetUI === sourceUI) {
        const fits =
          newCol >= 0 &&
          newRow >= 0 &&
          newCol + w <= this.inventoryGrid.columns &&
          newRow + h <= this.inventoryGrid.rows &&
          this.inventoryGrid.canPlaceItemIgnoring(
            item.id,
            { ...item, width: w, height: h },
            newRow,
            newCol
          );

        const finalCol = fits ? newCol : oldCol;
        const finalRow = fits ? newRow : oldRow;

        this.parent.add(wrapper, {
          align: "left-top",
          expand: false,
          offsetX: this.cellPadding + finalCol * step,
          offsetY: this.cellPadding + finalRow * step,
        });
        this.parent.layout();
        detached = false;

        if (fits) {
          this.inventoryGrid.moveItem(item.id, finalRow, finalCol, w, h);
          oldCol = finalCol;
          oldRow = finalRow;
          this.rotateController.commit(item);
        } else {
          this.rotateController.rollback(wrapper, item);
        }

        wrapper.setDepth(GameDepth.BackGround);
        this.rotateController.clearActive();
        return;
      }

      const fitsTarget =
        newCol >= 0 &&
        newRow >= 0 &&
        newCol + w <= targetUI.inventoryGrid.columns &&
        newRow + h <= targetUI.inventoryGrid.rows &&
        targetUI.inventoryGrid.canPlaceItemIgnoring(
          item.id,
          { ...item, width: w, height: h },
          newRow,
          newCol
        );

      if (!fitsTarget) {
        this.parent.add(wrapper, {
          align: "left-top",
          expand: false,
          offsetX: this.cellPadding + oldCol * step,
          offsetY: this.cellPadding + oldRow * step,
        });
        this.parent.layout();
        detached = false;

        this.rotateController.rollback(wrapper, item);
        wrapper.setDepth(GameDepth.BackGround);
        this.rotateController.clearActive();
        return;
      }

      this.inventoryGrid.removeItem(item.id);

      if (!detached) this.parent.remove(wrapper, false);

      const srcUI = sourceUI;
      srcUI.itemSprites.delete(item.id);

      targetUI.inventoryGrid.addItem({ ...item, width: w, height: h }, newRow, newCol);

      targetUI.overlapSizer.add(wrapper, {
        align: "left-top",
        expand: false,
        offsetX: targetUI.cellPadding + newCol * targetStep,
        offsetY: targetUI.cellPadding + newRow * targetStep,
      });
      targetUI.overlapSizer.layout();
      targetUI.itemSprites.set(item.id, wrapper);
      detached = false;

      this.rotateController.commit(item);

      wrapper.removeAllListeners("dragstart");
      wrapper.removeAllListeners("drag");
      wrapper.removeAllListeners("dragend");
      wrapper.setDepth(GameDepth.BackGround);
      this.rotateController.clearActive();

      targetUI.dragController.attach(item, wrapper, newRow, newCol);
    });
  }
}
