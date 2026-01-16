#pragma once

#include "types.h"
#include <unordered_map>
#include <random>
#include <sstream>
#include <iomanip>

class SessionManager {
private:
    std::unordered_map<std::string, std::shared_ptr<GameSession>> sessions;
    std::mutex sessionsMutex;
    std::random_device rd;
    std::mt19937 gen;
    
    // Генерация уникального кода комнаты
    std::string generateRoomCode() {
        std::uniform_int_distribution<> dis(0, 15);
        std::stringstream ss;
        for (int i = 0; i < 6; ++i) {
            int val = dis(gen);
            if (val < 10) {
                ss << val;
            } else {
                ss << static_cast<char>('A' + val - 10);
            }
        }
        return ss.str();
    }
    
public:
    SessionManager() : gen(rd()) {}
    
    // Создать новую сессию
    std::string createSession(Player& player1) {
        std::lock_guard<std::mutex> lock(sessionsMutex);
        
        std::string roomCode;
        do {
            roomCode = generateRoomCode();
        } while (sessions.find(roomCode) != sessions.end());
        
        auto session = std::make_shared<GameSession>(roomCode, player1);
        sessions[roomCode] = session;
        
        return roomCode;
    }
    
    // Присоединиться к сессии
    std::shared_ptr<GameSession> joinSession(const std::string& roomCode, Player& player2) {
        std::lock_guard<std::mutex> lock(sessionsMutex);
        
        auto it = sessions.find(roomCode);
        if (it == sessions.end()) {
            return nullptr;
        }
        
        auto session = it->second;
        std::lock_guard<std::mutex> sessionLock(session->mutex);
        
        if (session->state != GameState::WAITING_FOR_PLAYER) {
            return nullptr; // Комната уже заполнена
        }
        
        session->player2 = player2;
        session->state = GameState::PLACING_SHIPS;
        session->updateActivity();
        
        return session;
    }
    
    // Получить сессию по коду
    std::shared_ptr<GameSession> getSession(const std::string& roomCode) {
        std::lock_guard<std::mutex> lock(sessionsMutex);
        
        auto it = sessions.find(roomCode);
        if (it == sessions.end()) {
            return nullptr;
        }
        
        return it->second;
    }
    
    // Удалить сессию
    void removeSession(const std::string& roomCode) {
        std::lock_guard<std::mutex> lock(sessionsMutex);
        sessions.erase(roomCode);
    }
    
    // Очистить истекшие сессии
    void cleanupExpiredSessions() {
        std::lock_guard<std::mutex> lock(sessionsMutex);
        
        auto it = sessions.begin();
        while (it != sessions.end()) {
            if (it->second->isExpired()) {
                it = sessions.erase(it);
            } else {
                ++it;
            }
        }
    }
    
    // Получить сессию по WebSocket соединению
    std::shared_ptr<GameSession> findSessionBySocket(crow::websocket::connection* socket) {
        std::lock_guard<std::mutex> lock(sessionsMutex);
        
        for (auto& [code, session] : sessions) {
            std::lock_guard<std::mutex> sessionLock(session->mutex);
            if (session->player1.socket == socket || session->player2.socket == socket) {
                return session;
            }
        }
        
        return nullptr;
    }
};

