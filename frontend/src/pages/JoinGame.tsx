import { useEffect, useRef } from "react";
import type React from "react";
import { GameWebSocket } from "../service/GameWebSocket";
import {
  isGameStartMessage,
  parseServerMessage,
} from "../types/serverMessages";
import { useApp } from "../contexts/AppContext";

export default function JoinGame({
  socketRef,
}: {
  socketRef: React.MutableRefObject<GameWebSocket>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setAppState } = useApp();

  useEffect(() => {
    const unsubscribe = socketRef.current.onMessage((event) => {
      const message = parseServerMessage(event.data);

      if (!message) return;

      if (isGameStartMessage(message)) {
        setAppState("build");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socketRef, setAppState]);

  function handleJoinGame() {
    const roomCode = inputRef.current?.value.trim() || "";
    // Отправка запроса на присоединение к игре
    if (roomCode) {
      socketRef.current.send({ type: "JOIN_SESSION", roomCode });
    }
  }

  return (
    <>
      <input ref={inputRef} type="text" placeholder="Введите код сессии" />
      <button onClick={handleJoinGame}>Присоединиться</button>
    </>
  );
}
