import GridSizer from "phaser3-rex-plugins/templates/ui/gridsizer/GridSizer";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import { Scene } from "phaser";

import { EnumeSpecialSize } from "../../constant/size";
import { InventoryGridUI } from "../utils/inventoryGridUI";
import { InventoryGrid } from "../utils/inventoryGrid";
import { SpecialImage, UiImage } from "../../constant/gameImage";
import { InventoryItem } from "../utils/inventoryItem";

export class Game extends Scene {
  private overlay: GridSizer;
  private leftColumn: GridSizer;
  private rightColumn: GridSizer;

  private inventroty_1: InventoryGridUI;
  private inventroty_2: InventoryGridUI;

  private positivePerk: PerkNamespace.Perk[];

  rexUI: UIPlugin;

  constructor(key = "Game") {
    super(key);
  }

  preload() {
    this.load.setPath("assets");
    this.load.image(UiImage["inventory-tablet"], "inventory-tablet.png");
    this.load.json("special_positive", "perks/positive.json");

    this.load.image(
      SpecialImage.intellectual_positive,
      "perks/intellectual_positive.png"
    );
    this.load.image(SpecialImage.combat_positive, "perks/combat_positive.png");
    this.load.image(SpecialImage.special_positive, "perks/special_positive.png");
  }

  create() {
    this.add.text(20, 20, 'R - rotate', {
      fontSize: 32,
    });

    this.add.text(20, 62, 'LMB - DRAG STAR', {
      fontSize: 32,
    });

    this.positivePerk = this.cache.json.get("special_positive");

    const { width, height } = this.scale;

    this.overlay = this.rexUI
      .add.gridSizer({
        x: width / 2,
        y: height / 2,
        width,
        height,
        column: 3,
        row: 1,
        columnProportions: [1, 1, 1],
        rowProportions: [1],
        space: {
          column: EnumeSpecialSize.CELL_SIZE,
        },
      })
      .setOrigin(0.5, 0.5);

    this.leftColumn = this.rexUI.add.gridSizer({
      x: 0,
      y: 0,
      column: 1,
      row: 1,
      columnProportions: [1],
      rowProportions: [1],
    });

    this.rightColumn = this.rexUI.add.gridSizer({
      x: 0,
      y: 0,
      column: 1,
      row: 1,
      columnProportions: [1],
      rowProportions: [1],
    });

    this.inventroty_1 = new InventoryGridUI(
      this,
      new InventoryGrid(EnumeSpecialSize.CELL_H, EnumeSpecialSize.CELL_W),
      EnumeSpecialSize.CELL_SIZE,
      0,
      0,
      0
    );

    this.inventroty_2 = new InventoryGridUI(
      this,
      new InventoryGrid(EnumeSpecialSize.CELL_H, EnumeSpecialSize.CELL_W),
      EnumeSpecialSize.CELL_SIZE,
      0,
      0,
      0
    );


    const all = [this.inventroty_1, this.inventroty_2];
    this.inventroty_1.dragController.setInventories(all);
    this.inventroty_2.dragController.setInventories(all);

    this.leftColumn.add(this.inventroty_1.overlapSizer, 0, 0, "center-center", 0, false);
    this.rightColumn.add(this.inventroty_2.overlapSizer, 0, 0, "center-center", 0, false);
  
    this.overlay.add(this.leftColumn, 0, 0, "left-center", 0, false);
    this.overlay.add(this.rightColumn, 2, 0, "right-center", 0, false);

    this.positivePerkInit();
    this.overlay.layout();
  }

  private positivePerkInit() {
    this.positivePerk.forEach((perk) => {
      this.inventroty_1.addItemAuto(
        new InventoryItem({
          id: perk.id,
          name: perk.name,
          description: perk.effect,
          width: perk.width,
          height: perk.height,
          icon: `${perk.category}_positive`,
        })
      );
    });
  }
}
