import { useRef } from "react";
import type React from "react";

export default function JoinGame({
  socketRef,
}: {
  socketRef: React.MutableRefObject<WebSocket>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleJoinGame() {
    const roomCode = inputRef.current?.value.trim() || "";
    // Отправка запроса на присоединение к игре
    if (roomCode) {
      socketRef.current.send(
        JSON.stringify({ type: "JOIN_SESSION", roomCode })
      );
    }
  }

  return (
    <>
      <input ref={inputRef} type="text" placeholder="Введите код сессии" />
      <button onClick={handleJoinGame}>Присоединиться</button>
    </>
  );
}
