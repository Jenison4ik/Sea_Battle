#pragma once

#include "types.h"
#include <algorithm>
#include <cmath>

class GameEngine {
public:
    // Валидация расстановки кораблей
    static bool validateShipPlacement(const std::vector<std::vector<std::pair<int, int>>>& ships) {
        // Проверка количества кораблей: 1x4, 2x3, 3x2, 4x1
        std::vector<int> shipSizes;
        for (const auto& ship : ships) {
            shipSizes.push_back(ship.size());
        }
        
        std::sort(shipSizes.begin(), shipSizes.end(), std::greater<int>());
        
        // Проверяем правильное количество кораблей каждого размера
        int count4 = 0, count3 = 0, count2 = 0, count1 = 0;
        for (int size : shipSizes) {
            if (size == 4) count4++;
            else if (size == 3) count3++;
            else if (size == 2) count2++;
            else if (size == 1) count1++;
            else return false; // Неправильный размер корабля
        }
        
        if (count4 != 1 || count3 != 2 || count2 != 3 || count1 != 4) {
            return false;
        }
        
        // Проверка границ поля (0-9)
        for (const auto& ship : ships) {
            for (const auto& cell : ship) {
                if (cell.first < 0 || cell.first > 9 || cell.second < 0 || cell.second > 9) {
                    return false;
                }
            }
        }
        
        // Проверка на пересечения и близость кораблей
        std::set<std::pair<int, int>> allCells;
        for (const auto& ship : ships) {
            for (const auto& cell : ship) {
                // Проверка на дубликаты в одном корабле
                if (allCells.count(cell) > 0) {
                    return false;
                }
                
                // Проверка близости к другим кораблям
                for (int dx = -1; dx <= 1; ++dx) {
                    for (int dy = -1; dy <= 1; ++dy) {
                        if (dx == 0 && dy == 0) continue;
                        std::pair<int, int> neighbor = {cell.first + dx, cell.second + dy};
                        if (allCells.count(neighbor) > 0) {
                            return false; // Корабли слишком близко
                        }
                    }
                }
                
                allCells.insert(cell);
            }
        }
        
        // Проверка непрерывности кораблей
        for (const auto& ship : ships) {
            if (!isShipContinuous(ship)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Обработка выстрела
    static ShotResult processShot(GameSession& session, int x, int y) {
        Player& opponent = session.getOpponent();
        
        // Проверка границ
        if (x < 0 || x > 9 || y < 0 || y > 9) {
            return ShotResult::MISS; // Неправильные координаты считаются промахом
        }
        
        // Проверка на повторный выстрел
        if (opponent.board.shootedCells.count({x, y}) > 0) {
            return ShotResult::MISS; // Уже стреляли сюда
        }
        
        // Обработка выстрела
        ShotResult result = opponent.board.processShot(x, y);
        
        // Обновление статистики
        Player& currentPlayer = session.getCurrentPlayer();
        currentPlayer.stats.shots++;
        
        if (result == ShotResult::HIT || result == ShotResult::KILL || result == ShotResult::WIN) {
            currentPlayer.stats.hits++;
        } else {
            currentPlayer.stats.misses++;
        }
        
        if (result == ShotResult::KILL || result == ShotResult::WIN) {
            currentPlayer.stats.sunkShips++;
        }
        
        currentPlayer.stats.updateAccuracy();
        
        // Проверка победы
        if (opponent.board.allShipsKilled()) {
            result = ShotResult::WIN;
            session.state = GameState::FINISHED;
        }
        
        // Переключение хода
        if (result == ShotResult::MISS) {
            session.switchTurn();
        } else {
            session.updateActivity();
        }
        
        return result;
    }
    
private:
    // Проверка непрерывности корабля
    static bool isShipContinuous(const std::vector<std::pair<int, int>>& ship) {
        if (ship.size() <= 1) return true;
        
        // Проверяем, что все клетки на одной линии (горизонтально или вертикально)
        bool horizontal = true;
        bool vertical = true;
        
        int firstX = ship[0].first;
        int firstY = ship[0].second;
        
        for (size_t i = 1; i < ship.size(); ++i) {
            if (ship[i].first != firstX) horizontal = false;
            if (ship[i].second != firstY) vertical = false;
        }
        
        if (!horizontal && !vertical) return false;
        
        // Проверяем, что клетки идут подряд
        if (horizontal) {
            std::vector<int> ys;
            for (const auto& cell : ship) {
                ys.push_back(cell.second);
            }
            std::sort(ys.begin(), ys.end());
            for (size_t i = 1; i < ys.size(); ++i) {
                if (ys[i] - ys[i-1] != 1) return false;
            }
        } else {
            std::vector<int> xs;
            for (const auto& cell : ship) {
                xs.push_back(cell.first);
            }
            std::sort(xs.begin(), xs.end());
            for (size_t i = 1; i < xs.size(); ++i) {
                if (xs[i] - xs[i-1] != 1) return false;
            }
        }
        
        return true;
    }
};

