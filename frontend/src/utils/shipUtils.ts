import type { Coordinate } from "../types/serverMessages";

export interface Ship {
  id: number;
  cells: Coordinate[];
  isHorizontal: boolean;
}

/**
 * Генерирует случайную валидную расстановку кораблей
 */
export function generateRandomShips(): Ship[] {
  const ships: Ship[] = [];
  const grid = Array(10)
    .fill(null)
    .map(() => Array(10).fill(false));
  let shipId = 0;

  // Размеры кораблей: 1x4, 2x3, 3x2, 4x1
  const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

  for (const size of shipSizes) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 1000;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      const isHorizontal = Math.random() < 0.5;
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);

      const cells: Coordinate[] = [];
      for (let i = 0; i < size; i++) {
        const cellX = isHorizontal ? x + i : x;
        const cellY = isHorizontal ? y : y + i;
        cells.push([cellX, cellY]);
      }

      if (isValidPlacement(cells, grid)) {
        // Размещаем корабль
        for (const [cx, cy] of cells) {
          grid[cy][cx] = true;
        }
        ships.push({
          id: shipId++,
          cells,
          isHorizontal,
        });
        placed = true;
      }
    }

    if (!placed) {
      // Если не удалось разместить, генерируем заново
      return generateRandomShips();
    }
  }

  return ships;
}

/**
 * Проверяет, можно ли разместить корабль в указанных клетках
 */
export function isValidPlacement(
  cells: Coordinate[],
  grid: boolean[][],
  excludeShip?: Ship
): boolean {
  // Проверка границ
  for (const [x, y] of cells) {
    if (x < 0 || x > 9 || y < 0 || y > 9) {
      return false;
    }
  }

  // Проверка пересечений и близости
  const allOccupiedCells = new Set<string>();

  // Собираем все занятые клетки из grid
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (grid[y][x]) {
        allOccupiedCells.add(`${x},${y}`);
      }
    }
  }

  // Исключаем клетки текущего корабля, если он указан
  if (excludeShip) {
    for (const [x, y] of excludeShip.cells) {
      allOccupiedCells.delete(`${x},${y}`);
    }
  }

  const currentShipCells = new Set<string>();
  for (const [x, y] of cells) {
    currentShipCells.add(`${x},${y}`);
  }

  // Проверка пересечений
  for (const [x, y] of cells) {
    if (allOccupiedCells.has(`${x},${y}`)) {
      return false;
    }
  }

  // Проверка близости (минимум 1 клетка между кораблями)
  for (const [x, y] of cells) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx > 9 || ny < 0 || ny > 9) continue;

        const neighborKey = `${nx},${ny}`;
        // Проверяем только если сосед не является частью текущего корабля
        if (
          !currentShipCells.has(neighborKey) &&
          allOccupiedCells.has(neighborKey)
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Проверяет непрерывность корабля
 */
export function isShipContinuous(cells: Coordinate[]): boolean {
  if (cells.length <= 1) return true;

  // Проверяем, что все клетки на одной линии
  const firstX = cells[0][0];
  const firstY = cells[0][1];

  let horizontal = true;
  let vertical = true;

  for (let i = 1; i < cells.length; i++) {
    if (cells[i][0] !== firstX) horizontal = false;
    if (cells[i][1] !== firstY) vertical = false;
  }

  if (!horizontal && !vertical) return false;

  // Проверяем, что клетки идут подряд
  if (horizontal) {
    const ys = cells.map((c) => c[1]).sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) {
      if (ys[i] - ys[i - 1] !== 1) return false;
    }
  } else {
    const xs = cells.map((c) => c[0]).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] - xs[i - 1] !== 1) return false;
    }
  }

  return true;
}

/**
 * Валидирует полную расстановку кораблей
 */
export function validateShipPlacement(ships: Ship[]): boolean {
  // Проверка количества кораблей
  if (ships.length !== 10) return false;

  // Проверка размеров кораблей
  const sizes = ships.map((s) => s.cells.length).sort((a, b) => b - a);
  const expectedSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  if (JSON.stringify(sizes) !== JSON.stringify(expectedSizes)) {
    return false;
  }

  // Создаем сетку для проверки пересечений
  const grid = Array(10)
    .fill(null)
    .map(() => Array(10).fill(false));

  for (const ship of ships) {
    // Проверка непрерывности
    if (!isShipContinuous(ship.cells)) {
      return false;
    }

    // Проверка размещения
    if (!isValidPlacement(ship.cells, grid)) {
      return false;
    }

    // Размещаем корабль на сетке
    for (const [x, y] of ship.cells) {
      grid[y][x] = true;
    }
  }

  return true;
}

/**
 * Поворачивает корабль (меняет ориентацию)
 */
export function rotateShip(ship: Ship): Ship {
  if (ship.cells.length === 1) {
    // Однопалубный корабль не поворачивается
    return ship;
  }

  const [firstX, firstY] = ship.cells[0];
  const newCells: Coordinate[] = [[firstX, firstY]];

  const size = ship.cells.length;

  if (ship.isHorizontal) {
    // Поворачиваем вертикально
    for (let i = 1; i < size; i++) {
      newCells.push([firstX, firstY + i]);
    }
  } else {
    // Поворачиваем горизонтально
    for (let i = 1; i < size; i++) {
      newCells.push([firstX + i, firstY]);
    }
  }

  return {
    ...ship,
    cells: newCells,
    isHorizontal: !ship.isHorizontal,
  };
}

/**
 * Перемещает корабль в новую позицию
 */
export function moveShip(
  ship: Ship,
  newPosition: Coordinate,
  grid: boolean[][]
): Ship | null {
  const [newX, newY] = newPosition;
  const size = ship.cells.length;
  const newCells: Coordinate[] = [];

  if (ship.isHorizontal) {
    for (let i = 0; i < size; i++) {
      newCells.push([newX + i, newY]);
    }
  } else {
    for (let i = 0; i < size; i++) {
      newCells.push([newX, newY + i]);
    }
  }

  // Проверяем границы
  for (const [x, y] of newCells) {
    if (x < 0 || x > 9 || y < 0 || y > 9) {
      return null;
    }
  }

  // Проверяем валидность размещения
  if (!isValidPlacement(newCells, grid, ship)) {
    return null;
  }

  return {
    ...ship,
    cells: newCells,
  };
}

/**
 * Конвертирует корабли в формат для отправки на сервер
 */
export function shipsToServerFormat(ships: Ship[]): Coordinate[][] {
  return ships.map((ship) => ship.cells);
}
