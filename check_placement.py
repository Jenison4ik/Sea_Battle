#!/usr/bin/env python3
"""
Проверка правильной расстановки кораблей
"""
correct_ships = [
    [[2, 3], [2, 4], [2, 5], [2, 6]],  # 4-палубный
    [[5, 0], [6, 0], [7, 0]],          # 3-палубный
    [[0, 3], [0, 4], [0, 5]],          # 3-палубный
    [[4, 9], [5, 9]],                  # 2-палубный
    [[7, 5], [7, 6]],                  # 2-палубный
    [[9, 0], [9, 1]],                  # 2-палубный
    [[0, 0]],                          # 1-палубный
    [[3, 0]],                          # 1-палубный
    [[8, 8]],                          # 1-палубный
    [[6, 3]]                           # 1-палубный (исправлено)
]

print("Проверка правильной расстановки кораблей:")
print("=" * 70)

all_cells = set()
for ship_idx, ship in enumerate(correct_ships):
    ship_cells = set(tuple(cell) for cell in ship)
    print(f"\nКорабль {ship_idx + 1} (размер {len(ship)}): {ship}")
    
    # Проверяем пересечения
    if ship_cells & all_cells:
        print(f"  ❌ ПЕРЕСЕЧЕНИЕ: {ship_cells & all_cells}")
    
    # Проверяем близость
    for cell in ship:
        x, y = cell
        neighbors_found = []
        
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                neighbor = (nx, ny)
                
                # Проверяем границы
                if nx < 0 or nx > 9 or ny < 0 or ny > 9:
                    continue
                
                # Проверяем только если сосед не является частью текущего корабля
                if neighbor not in ship_cells and neighbor in all_cells:
                    neighbors_found.append(f"[{nx},{ny}]")
        
        if neighbors_found:
            print(f"  WARNING: Cell [{x},{y}] too close to: {', '.join(neighbors_found)}")
    
    # Добавляем клетки корабля
    all_cells.update(ship_cells)

print("\n" + "=" * 70)
if len(all_cells) == sum(len(ship) for ship in correct_ships):
    print("OK: All cells are unique")
else:
    print("ERROR: Duplicate cells found")

print(f"Total cells: {len(all_cells)}")
print(f"Expected: {sum(len(ship) for ship in correct_ships)}")

