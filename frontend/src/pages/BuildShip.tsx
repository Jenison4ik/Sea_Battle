import { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import GameBoard from "../components/GameBoard";
import {
  generateRandomShips,
  validateShipPlacement,
  shipsToServerFormat,
} from "../utils/shipUtils";
import type { Ship } from "../utils/shipUtils";
import {
  parseServerMessage,
  isShipsPlacedMessage,
  isErrorMessage,
} from "../types/serverMessages";
import { RotateCw } from "lucide-react";
import styles from "./BuildShip.module.css";

export default function BuildShip() {
  const { socketRef, setAppState } = useApp();
  const [ships, setShips] = useState<Ship[]>([]);
  const [isPlacing, setIsPlacing] = useState(false);

  // Генерируем случайную расстановку при монтировании
  useEffect(() => {
    setShips(generateRandomShips());
  }, []);

  // Подписываемся на сообщения от сервера
  useEffect(() => {
    if (!socketRef.current) return;

    const gameSocket = socketRef.current;
    const unsubscribe = gameSocket.onMessage((event) => {
      const message = parseServerMessage(event.data);

      if (!message) {
        console.error("Failed to parse server message");
        return;
      }

      if (isShipsPlacedMessage(message)) {
        // Корабли успешно размещены, переходим к игре
        setAppState("ingame");
      } else if (isErrorMessage(message)) {
        console.error("Server error:", message.message);
        alert(`Ошибка: ${message.message}`);
        setIsPlacing(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socketRef, setAppState]);

  const handleShuffle = () => {
    setShips(generateRandomShips());
  };

  const handleShipsChange = (newShips: Ship[]) => {
    setShips(newShips);
  };

  const handlePlaceShips = () => {
    if (!socketRef.current) {
      alert("Нет соединения с сервером");
      return;
    }

    // Валидация расстановки
    if (!validateShipPlacement(ships)) {
      alert(
        "Неверная расстановка кораблей! Проверьте, что все корабли размещены правильно."
      );
      return;
    }

    setIsPlacing(true);

    // Отправляем корабли на сервер
    const shipsData = shipsToServerFormat(ships);
    socketRef.current.send({
      type: "PLACE_SHIPS",
      ships: shipsData,
    });
  };

  const isValid = validateShipPlacement(ships);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Расставьте корабли</h2>
      <p className={styles.description}>
        Перетащите корабль для перемещения. Нажмите R для поворота.
      </p>

      <div className={styles.boardWrapper}>
        <GameBoard
          ships={ships}
          onShipsChange={handleShipsChange}
          editable={true}
          showShips={true}
        />
      </div>

      <div className={styles.controls}>
        <button
          className={styles.shuffleButton}
          onClick={handleShuffle}
          disabled={isPlacing}
          title="Перемешать корабли"
        >
          <RotateCw size={20} />
        </button>

        <button
          className={styles.submitButton}
          onClick={handlePlaceShips}
          disabled={!isValid || isPlacing}
        >
          {isPlacing ? "Отправка..." : "Поехали"}
        </button>
      </div>

      {!isValid && (
        <div className={styles.error}>
          Неверная расстановка кораблей. Проверьте, что все корабли размещены
          правильно.
        </div>
      )}
    </div>
  );
}
