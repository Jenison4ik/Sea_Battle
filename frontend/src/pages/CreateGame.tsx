import { LoaderPinwheel } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./CreateGame.module.css";
export default function CreateGame({
  socketRef,
}: {
  socketRef: React.MutableRefObject<WebSocket>;
}) {
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    // socketRef.current гарантированно не null на этом этапе
    const socket = socketRef.current;

    socket.send(JSON.stringify({ type: "CREATE_SESSION" }));

    socket.onmessage = (event) => {
      // Обработка сообщений от сервера
      try {
        const data = JSON.parse(event.data);
        if (data.roomCode) {
          setSession(data.roomCode);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Ошибка при обработке сообщения:", errorMessage);
      }
    };
  }, [socketRef]);

  return (
    <>
      <h3>Код сессии:</h3>
      <p>{session}</p>
      <div className={styles["load-box"]}>
        <p>Ожидание игрока</p>
        <LoaderPinwheel className={styles.spiner} />
      </div>
    </>
  );
}
