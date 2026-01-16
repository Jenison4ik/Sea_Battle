import { useEffect } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import Main from "./pages/main";
import LoadingPage from "./pages/LoadingPage";
import ErrorPage from "./pages/ErrorPage";
import "./App.css";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";

function AppContent() {
  const { appState, setAppState, socketRef, reconnectTrigger } = useApp();

  useEffect(() => {
    // Закрываем предыдущее соединение если оно есть
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    // Устанавливаем состояние загрузки
    setAppState("loading");

    // Создаем новое WebSocket соединение
    const socket = new WebSocket("/ws");
    socketRef.current = socket;

    let isMounted = true;

    socket.onopen = () => {
      console.log("WebSocket connected");
      if (isMounted) {
        setAppState("main");
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (isMounted) {
        setAppState("error");
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket closed", event.code, event.reason);
      // Если соединение закрылось неожиданно (код не 1000 - нормальное закрытие), показываем ошибку
      if (isMounted && event.code !== 1000) {
        setAppState("error");
      }
      socketRef.current = null;
    };

    // Очистка при размонтировании
    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [reconnectTrigger, setAppState]); // Переподключение происходит при изменении reconnectTrigger

  // Отображаем соответствующий компонент в зависимости от состояния
  switch (appState) {
    case "loading":
      return <LoadingPage />;
    case "error":
      return <ErrorPage />;
    case "main":
      return <Main />;
    case "create":
      // Гарантируем, что socketRef.current не null перед рендерингом CreateGame
      if (!socketRef.current) {
        return <LoadingPage />;
      }
      return (
        <CreateGame
          socketRef={socketRef as React.MutableRefObject<WebSocket>}
        />
      );
    case "search":
      return (
        <JoinGame socketRef={socketRef as React.MutableRefObject<WebSocket>} />
      );
    case "build":
    case "ingame":
    case "endgame":
      return <Main />;
    default:
      return <LoadingPage />;
  }
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
