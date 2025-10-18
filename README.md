**RU**
`gridInventory` — грид-инвентарь для **Phaser 3** (TypeScript) в стиле *Resident Evil / Escape from Tarkov / DayZ / NEO Scavenger*: тетрис-ячейки, drag-&-drop, поворот, проверки коллизий и JSON-снапшоты. Ядро без привязки к рендеру; демо-UI на **rexUI**.

**Что умеет**

* Сетка `rows × cols`, настраиваемый размер ячейки.
* Предметы произвольного `w×h` — как в RE/Tarkov — с проверкой границ и пересечений.
* Повороты `0/90/180/270`, подсветка валидных/невалидных позиций.
* Drag-&-drop между слотами/контейнерами (рюкзак, жилет, ящик).
* Состояние: `toJSON()` / `fromJSON()`.

**Использование (идея)**

* Подключаете **core** (чистая логика) в свой проект.
* Для быстрого старта — демо-сцена Phaser + rexUI.
* Расширяете под себя: фильтры слотов, вес/объём, стаки.

**Кому подойдёт**
Инди-разработчикам на Phaser 3, кто хочет инвентарь как в *Resident Evil / Tarkov / DayZ / NEO Scavenger* без переписывания базы.

**Roadmap**
стэки • несколько контейнеров • лимиты веса/объёма • undo/redo • тесты

Теги: `phaser3`, `typescript`, `inventory`, `grid`, `rexui`, `game-dev`.

---

**EN**
`gridInventory` — a grid inventory for **Phaser 3** (TypeScript) inspired by *Resident Evil / Escape from Tarkov / DayZ / NEO Scavenger*: tetris-style slots, drag-&-drop, rotation, collision checks, and JSON snapshots. Renderer-agnostic core; small **rexUI** demo included.

**Features**

* Configurable `rows × cols` grid and cell size.
* Arbitrary `w×h` items — RE/Tarkov-style — with bounds & overlap checks.
* Rotations `0/90/180/270`, valid/invalid placement hints.
* Drag-&-drop across slots/containers (backpack, vest, stash).
* State: `toJSON()` / `fromJSON()`.

**Usage (idea)**

* Use the **core** logic in your project.
* Boot the Phaser + rexUI demo for a quick start.
* Extend as needed: slot filters, weight/volume limits, stacks.

**Who is it for**
Phaser 3 indie devs who want an inventory like *Resident Evil / Tarkov / DayZ / NEO Scavenger* without rebuilding fundamentals.

**Roadmap**
stacks • multi-containers • weight/volume • undo/redo • tests

Tags: `phaser3`, `typescript`, `inventory`, `grid`, `rexui`, `game-dev`.
