/**
 * Типы для всех сообщений от сервера
 * Основано на WebSocket API из README.md
 */

// ==================== Базовые типы ====================

/** Координата на поле [x, y] */
export type Coordinate = [number, number];

/** Корабль в режиме MY_SHOT (видно только подбитые клетки) */
export interface ShipMyShot {
  heated_cords: Coordinate[];
  isKilled: boolean;
}

/** Корабль в режиме ENEMY_SHOT (видно начало, конец и подбитые клетки) */
export interface ShipEnemyShot {
  first_cord: Coordinate;
  sec_cord: Coordinate;
  heated_cords: Coordinate[];
  isKilled: boolean;
}

/** Данные состояния для режима MY_SHOT */
export interface StateDataMyShot {
  ships: ShipMyShot[];
  shooted_cords: Coordinate[];
}

/** Данные состояния для режима ENEMY_SHOT */
export interface StateDataEnemyShot {
  ships: ShipEnemyShot[];
  shooted_cords: Coordinate[];
}

/** Статистика игры */
export interface GameStats {
  shots: number;
  hits: number;
  misses: number;
  accuracy: number;
  sunkShips: number;
}

// ==================== Типы сообщений от сервера ====================

/** Сообщение о создании сессии */
export interface SessionCreatedMessage {
  type: "SESSION_CREATED";
  roomCode: string;
}

/** Сообщение о начале игры */
export interface GameStartMessage {
  type: "GAME_START";
  firstTurn: string; // "player1" или "player2"
}

/** Сообщение о размещении кораблей */
export interface ShipsPlacedMessage {
  type: "SHIPS_PLACED";
}

/** Сообщение о состоянии игры в режиме MY_SHOT */
export interface StateMyShotMessage {
  type: "STATE";
  mode: "MY_SHOT";
  data: StateDataMyShot;
}

/** Сообщение о состоянии игры в режиме ENEMY_SHOT */
export interface StateEnemyShotMessage {
  type: "STATE";
  mode: "ENEMY_SHOT";
  data: StateDataEnemyShot;
}

/** Сообщение о конце игры */
export interface GameOverMessage {
  type: "GAME_OVER";
  winner: string; // "player1" или "player2"
  stats: GameStats;
}

/** Сообщение об ошибке */
export interface ErrorMessage {
  type: "ERROR";
  message: string;
}

/** Сообщение PONG (ответ на PING) */
export interface PongMessage {
  type: "PONG";
}

// ==================== Объединенный тип ====================

/** Все возможные сообщения от сервера */
export type ServerMessage =
  | SessionCreatedMessage
  | GameStartMessage
  | ShipsPlacedMessage
  | StateMyShotMessage
  | StateEnemyShotMessage
  | GameOverMessage
  | ErrorMessage
  | PongMessage;

// ==================== Type Guards ====================

/** Проверка, является ли сообщение SessionCreatedMessage */
export function isSessionCreatedMessage(
  message: ServerMessage
): message is SessionCreatedMessage {
  return message.type === "SESSION_CREATED";
}

/** Проверка, является ли сообщение GameStartMessage */
export function isGameStartMessage(
  message: ServerMessage
): message is GameStartMessage {
  return message.type === "GAME_START";
}

/** Проверка, является ли сообщение ShipsPlacedMessage */
export function isShipsPlacedMessage(
  message: ServerMessage
): message is ShipsPlacedMessage {
  return message.type === "SHIPS_PLACED";
}

/** Проверка, является ли сообщение StateMyShotMessage */
export function isStateMyShotMessage(
  message: ServerMessage
): message is StateMyShotMessage {
  return message.type === "STATE" && message.mode === "MY_SHOT";
}

/** Проверка, является ли сообщение StateEnemyShotMessage */
export function isStateEnemyShotMessage(
  message: ServerMessage
): message is StateEnemyShotMessage {
  return message.type === "STATE" && message.mode === "ENEMY_SHOT";
}

/** Проверка, является ли сообщение GameOverMessage */
export function isGameOverMessage(
  message: ServerMessage
): message is GameOverMessage {
  return message.type === "GAME_OVER";
}

/** Проверка, является ли сообщение ErrorMessage */
export function isErrorMessage(
  message: ServerMessage
): message is ErrorMessage {
  return message.type === "ERROR";
}

/** Проверка, является ли сообщение PongMessage */
export function isPongMessage(message: ServerMessage): message is PongMessage {
  return message.type === "PONG";
}

/** Проверка, является ли сообщение любым STATE сообщением */
export function isStateMessage(
  message: ServerMessage
): message is StateMyShotMessage | StateEnemyShotMessage {
  return message.type === "STATE";
}

// ==================== Утилиты для парсинга ====================

/**
 * Парсит JSON строку в ServerMessage
 * @param jsonString - JSON строка от сервера
 * @returns ServerMessage или null, если парсинг не удался
 */
export function parseServerMessage(jsonString: string): ServerMessage | null {
  try {
    const parsed = JSON.parse(jsonString);
    // Базовая валидация наличия поля type
    if (parsed && typeof parsed.type === "string") {
      return parsed as ServerMessage;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse server message:", error);
    return null;
  }
}
