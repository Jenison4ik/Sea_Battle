#include "../include/types.h"
#include <algorithm>

bool Board::isValidPlacement() const {
    // Проверка количества кораблей
    if (ships.size() != 10) return false;
    
    // Проверка размеров кораблей
    std::vector<int> sizes;
    for (const auto& ship : ships) {
        sizes.push_back(ship.cells.size());
    }
    
    std::sort(sizes.begin(), sizes.end(), std::greater<int>());
    
    int count4 = 0, count3 = 0, count2 = 0, count1 = 0;
    for (int size : sizes) {
        if (size == 4) count4++;
        else if (size == 3) count3++;
        else if (size == 2) count2++;
        else if (size == 1) count1++;
        else return false;
    }
    
    return (count4 == 1 && count3 == 2 && count2 == 3 && count1 == 4);
}

ShotResult Board::processShot(int x, int y) {
    // Добавляем клетку в выстреленные
    shootedCells.insert({x, y});
    
    // Ищем корабль, в который попали
    for (auto& ship : ships) {
        for (const auto& cell : ship.cells) {
            if (cell.first == x && cell.second == y) {
                // Попадание
                ship.heatedCells.push_back({x, y});
                
                // Проверяем, убит ли корабль
                if (ship.heatedCells.size() == ship.cells.size()) {
                    ship.isKilled = true;
                    return ShotResult::KILL;
                }
                
                return ShotResult::HIT;
            }
        }
    }
    
    // Промах
    return ShotResult::MISS;
}

bool Board::allShipsKilled() const {
    for (const auto& ship : ships) {
        if (!ship.isKilled) {
            return false;
        }
    }
    return true;
}

int Board::getTotalHits() const {
    int hits = 0;
    for (const auto& ship : ships) {
        hits += ship.heatedCells.size();
    }
    return hits;
}

int Board::getTotalShots() const {
    return shootedCells.size();
}

int Board::getSunkShipsCount() const {
    int count = 0;
    for (const auto& ship : ships) {
        if (ship.isKilled) {
            count++;
        }
    }
    return count;
}

