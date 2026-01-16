# Примеры использования WebSocket API

## Подключение

```javascript
const ws = new WebSocket("ws://localhost/ws");

ws.onopen = () => {
  console.log("Подключено к серверу");
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("Получено сообщение:", message);
};

ws.onerror = (error) => {
  console.error("Ошибка WebSocket:", error);
};

ws.onclose = () => {
  console.log("Соединение закрыто");
};
```

## Пример игры

### Игрок 1: Создание сессии

```javascript
// Создание сессии
ws1.send(
  JSON.stringify({
    type: "CREATE_SESSION",
  })
);

// Ожидание ответа
// {"type": "SESSION_CREATED", "roomCode": "A7F3Q2"}
```

### Игрок 2: Присоединение к сессии

```javascript
// Присоединение к сессии
ws2.send(
  JSON.stringify({
    type: "JOIN_SESSION",
    roomCode: "A7F3Q2",
  })
);

// Оба игрока получают:
// {"type": "GAME_START", "firstTurn": "player1"}
```

### Расстановка кораблей (оба игрока)

```javascript
// Пример правильной расстановки кораблей
const ships = [
  // 1 корабль на 4 клетки
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],

  // 2 корабля на 3 клетки
  [
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [
    [4, 0],
    [4, 1],
    [4, 2],
  ],

  // 3 корабля на 2 клетки
  [
    [6, 0],
    [6, 1],
  ],
  [
    [8, 0],
    [8, 1],
  ],
  [
    [0, 5],
    [0, 6],
  ],

  // 4 корабля на 1 клетку
  [[2, 5]],
  [[4, 5]],
  [[6, 5]],
  [[8, 5]],
];

ws1.send(
  JSON.stringify({
    type: "PLACE_SHIPS",
    ships: ships,
  })
);

// Ответ:
// {"type": "SHIPS_PLACED"}
```

### Выстрел

```javascript
// Игрок 1 делает выстрел
ws1.send(
  JSON.stringify({
    type: "SHOT",
    x: 0,
    y: 0,
  })
);

// Игрок 1 получает (MY_SHOT):
// {
//   "type": "STATE",
//   "mode": "MY_SHOT",
//   "data": {
//     "ships": [
//       {
//         "heated_cords": [[0,0]],
//         "isKilled": false
//       }
//     ],
//     "shooted_cords": [[0,0]]
//   }
// }

// Игрок 2 получает (ENEMY_SHOT):
// {
//   "type": "STATE",
//   "mode": "ENEMY_SHOT",
//   "data": {
//     "ships": [
//       {
//         "cords": [[0,0], [0,1], [0,2], [0,3]],
//         "heated_cords": [[0,0]],
//         "isKilled": false
//       }
//     ],
//     "shooted_cords": [[0,0]]
//   }
// }
```

### Конец игры

```javascript
// Когда все корабли противника уничтожены:
// {
//   "type": "GAME_OVER",
//   "winner": "player1",
//   "stats": {
//     "shots": 34,
//     "hits": 10,
//     "misses": 24,
//     "accuracy": 29.4,
//     "sunkShips": 3
//   }
// }
```

## Heartbeat

```javascript
// Отправка ping каждые 30 секунд
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "PING",
      })
    );
  }
}, 30000);

// Ответ сервера:
// {"type": "PONG"}
```

## Обработка ошибок

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "ERROR") {
    console.error("Ошибка сервера:", message.message);
    // Обработка ошибки
  } else {
    // Обработка обычных сообщений
    handleGameMessage(message);
  }
};
```

## Полный пример клиента (JavaScript)

```javascript
class SeaBattleClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.roomCode = null;
    this.setupHandlers();
  }

  setupHandlers() {
    this.ws.onopen = () => {
      console.log("Подключено");
    };

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      this.handleMessage(msg);
    };

    this.ws.onerror = (error) => {
      console.error("Ошибка:", error);
    };

    this.ws.onclose = () => {
      console.log("Отключено");
    };
  }

  handleMessage(msg) {
    switch (msg.type) {
      case "SESSION_CREATED":
        this.roomCode = msg.roomCode;
        console.log("Комната создана:", this.roomCode);
        break;
      case "GAME_START":
        console.log("Игра началась, первый ход:", msg.firstTurn);
        break;
      case "SHIPS_PLACED":
        console.log("Корабли расставлены");
        break;
      case "STATE":
        this.handleGameState(msg);
        break;
      case "GAME_OVER":
        console.log("Игра окончена, победитель:", msg.winner);
        console.log("Статистика:", msg.stats);
        break;
      case "ERROR":
        console.error("Ошибка:", msg.message);
        break;
      case "PONG":
        console.log("Pong получен");
        break;
    }
  }

  handleGameState(msg) {
    if (msg.mode === "MY_SHOT") {
      console.log("Результат моего выстрела:", msg.data);
    } else if (msg.mode === "ENEMY_SHOT") {
      console.log("Противник выстрелил:", msg.data);
    }
  }

  createSession() {
    this.send({ type: "CREATE_SESSION" });
  }

  joinSession(roomCode) {
    this.send({ type: "JOIN_SESSION", roomCode });
  }

  placeShips(ships) {
    this.send({ type: "PLACE_SHIPS", ships });
  }

  shoot(x, y) {
    this.send({ type: "SHOT", x, y });
  }

  ping() {
    this.send({ type: "PING" });
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket не подключен");
    }
  }
}

// Использование:
// const client = new SeaBattleClient('ws://localhost/ws');
// client.createSession();
```
