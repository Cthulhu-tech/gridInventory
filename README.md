# AutoTile Click Canvas

* Logical grid `W×H`. Each logical cell renders as **2×2** subtiles.
* **Left-click** marks a cell as floor; **right-click** clears it.
* After each click:

  1. Build a binary floor mask.
  2. From the outer perimeter of that mask (8-connectivity), compute a wall mask.
  3. For every logical cell, look up its neighbors and use `AutoTileMath.quad(...)` to pick 4 indices (TL, TR, BL, BR) from the **48**-tile set.
  4. Place the 2×2 floor subtiles on the **Floor** layer, and the 2×2 wall subtiles on the **Solid** layer.

## Controls

* **Left-click** — place floor.
* **Right-click** — erase floor.

## Quick Start (with Vite)

```bash
npm i
npm run dev
```

Open in your browser and click on the canvas: left-click places floor, right-click erases it; walls and autotiling are recalculated automatically.


![screenshot](autotile.jpg)
