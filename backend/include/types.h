#pragma once

#include <string>
#include <vector>
#include <set>
#include <memory>
#include <mutex>
#include <chrono>
#include <crow.h>

// Состояния игры
enum class GameState {
    WAITING_FOR_PLAYER,
    PLACING_SHIPS,
    IN_GAME,
    FINISHED
};

// Типы сообщений
enum class MessageType {
    CREATE_SESSION,
    JOIN_SESSION,
    SESSION_CREATED,
    GAME_START,
    PLACE_SHIPS,
    SHIPS_PLACED,
    SHOT,
    STATE,
    GAME_OVER,
    ERROR,
    PING,
    PONG
};

// Результат выстрела
enum class ShotResult {
    MISS,
    HIT,
    KILL,
    WIN
};

// Структура корабля
struct Ship {
    std::vector<std::pair<int, int>> cells;
    std::vector<std::pair<int, int>> heatedCells;
    bool isKilled;
    
    Ship() : isKilled(false) {}
    
    Ship(const std::vector<std::pair<int, int>>& cells) 
        : cells(cells), isKilled(false) {}
};

// Игровое поле
struct Board {
    std::vector<Ship> ships;
    std::set<std::pair<int, int>> shootedCells;
    
    Board() = default;
    
    // Проверка валидности расстановки кораблей
    bool isValidPlacement() const;
    
    // Обработка выстрела
    ShotResult processShot(int x, int y);
    
    // Проверка победы (все корабли убиты)
    bool allShipsKilled() const;
    
    // Получение статистики
    int getTotalHits() const;
    int getTotalShots() const;
    int getSunkShipsCount() const;
};

// Статистика игрока
struct PlayerStats {
    int shots;
    int hits;
    int misses;
    int sunkShips;
    double accuracy;
    
    PlayerStats() : shots(0), hits(0), misses(0), sunkShips(0), accuracy(0.0) {}
    
    void updateAccuracy() {
        if (shots > 0) {
            accuracy = (static_cast<double>(hits) / shots) * 100.0;
        }
    }
};

// Игрок
struct Player {
    crow::websocket::connection* socket;
    Board board;
    PlayerStats stats;
    bool shipsPlaced;
    std::string playerId;
    
    Player() : socket(nullptr), shipsPlaced(false) {}
    
    Player(crow::websocket::connection* ws, const std::string& id) 
        : socket(ws), shipsPlaced(false), playerId(id) {}
};

// Игровая сессия
struct GameSession {
    std::string roomCode;
    Player player1;
    Player player2;
    int currentTurn; // 1 или 2
    GameState state;
    std::mutex mutex;
    std::chrono::steady_clock::time_point createdAt;
    std::chrono::steady_clock::time_point lastActivity;
    
    GameSession() : currentTurn(1), state(GameState::WAITING_FOR_PLAYER) {
        createdAt = std::chrono::steady_clock::now();
        lastActivity = createdAt;
    }
    
    GameSession(const std::string& code, Player& p1) 
        : roomCode(code), player1(p1), currentTurn(1), 
          state(GameState::WAITING_FOR_PLAYER) {
        createdAt = std::chrono::steady_clock::now();
        lastActivity = createdAt;
    }
    
    // Получить текущего игрока
    Player& getCurrentPlayer() {
        return (currentTurn == 1) ? player1 : player2;
    }
    
    // Получить противника
    Player& getOpponent() {
        return (currentTurn == 1) ? player2 : player1;
    }
    
    // Переключить ход
    void switchTurn() {
        currentTurn = (currentTurn == 1) ? 2 : 1;
        lastActivity = std::chrono::steady_clock::now();
    }
    
    // Обновить активность
    void updateActivity() {
        lastActivity = std::chrono::steady_clock::now();
    }
    
    // Проверка таймаута (30 минут)
    bool isExpired() const {
        auto now = std::chrono::steady_clock::now();
        auto diff = std::chrono::duration_cast<std::chrono::minutes>(now - lastActivity);
        return diff.count() > 30;
    }
};

