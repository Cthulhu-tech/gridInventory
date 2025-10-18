import OverlapSizer from "phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer";
import { InventoryItem } from "./inventoryItem";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { InventoryKey } from "../../constant/gameControl";

export class RotateController {
  private scene: Phaser.Scene;
  private keyRotate: Phaser.Input.Keyboard.Key | null = null;
  private activeWrapper: OverlapSizer | null = null;
  private item: InventoryItem | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    if (this.scene.input?.keyboard) {
      this.keyRotate = this.scene.input.keyboard.addKey(InventoryKey.rotate);
      this.keyRotate.on("down", this.onKeyDown, this);

      this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
      this.scene.events.once(Phaser.Scenes.Events.DESTROY, this.destroy, this);
    }
  }

  setActive(wrapper: OverlapSizer | null, item: InventoryItem) {
    this.activeWrapper = wrapper;
    this.item = item;
  }

  clearActive() {
    this.activeWrapper = null;
    this.item = null;
  }

  private onKeyDown() {
    if (this.activeWrapper) this.handleRotate();
  }


  private handleRotate() {
    if (!this.activeWrapper || !this.item) return;

    const sub = this.activeWrapper.getElement("subWrapper") as OverlapSizer;
    if (!sub) return;

    const el = sub.getElement("el") as RoundRectangle;
    if (!el) return;

    const allowed = [0, 90, 180, 270];
    const curDeg  = this.item.currentDeg ?? 0;
    const curIdx  = allowed.indexOf(curDeg);
    const nextDeg = allowed[(curIdx + 1) % allowed.length];

    const orientationChanged = (curDeg % 180) !== (nextDeg % 180);

    if (orientationChanged) {
      [this.item.prevWidth, this.item.prevHeight] = [this.item.currentWidth, this.item.currentHeight];
      [this.item.currentWidth, this.item.currentHeight] = [this.item.currentHeight, this.item.currentWidth];
    } else {
      this.item.prevWidth  = this.item.currentWidth;
      this.item.prevHeight = this.item.currentHeight;
    }

    this.item.prevDeg    = curDeg;
    this.item.currentDeg = nextDeg;

    const baseW = el.width;
    const baseH = el.height;

    const swap = nextDeg % 180 !== 0;
    const newW = swap ? baseH : baseW;
    const newH = swap ? baseW : baseH;

    this.activeWrapper.setMinSize(newW, newH);
    this.activeWrapper.setSize(newW, newH);
    this.activeWrapper.layout();

    sub.setAngle(nextDeg);  this.activeWrapper.layout();
  }

  rollback(wrapper: OverlapSizer, item: InventoryItem) {
    const sub = wrapper.getElement("subWrapper") as OverlapSizer;
    if (!sub) return;

    const el = sub.getElement("el") as RoundRectangle;
    if (!el) return;

    const targetDeg = item.prevDeg ?? 0;

    if ((item.currentDeg ?? 0) % 180 !== (targetDeg % 180)) {
      item.currentWidth  = item.prevWidth  ?? item.currentWidth;
      item.currentHeight = item.prevHeight ?? item.currentHeight;
    }

    item.currentDeg = targetDeg;

    const baseW = el.width;
    const baseH = el.height;

    const swapBack = targetDeg % 180 !== 0;
    const wrapW = swapBack ? baseH : baseW;
    const wrapH = swapBack ? baseW : baseH;

    wrapper.setMinSize(wrapW, wrapH);
    wrapper.setSize(wrapW, wrapH);
    wrapper.layout();

    sub.setAngle(targetDeg);
    wrapper.layout();
  }

  commit(item: InventoryItem) {
    item.prevWidth = item.currentWidth;
    item.prevHeight = item.currentHeight;
    item.prevDeg = item.currentDeg;
  }

  private destroy() {
    this.keyRotate?.off("down", this.onKeyDown, this);
    this.activeWrapper = null;
    this.item = null;
  }
}
