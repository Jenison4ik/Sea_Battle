import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type AppState =
  | "loading"
  | "error"
  | "main"
  | "search"
  | "create"
  | "build"
  | "ingame"
  | "endgame";

export interface AppContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  socketRef: React.MutableRefObject<WebSocket | null>;
  reconnect: () => void;
  reconnectTrigger: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>("loading");
  const [reconnectTrigger, setReconnectTrigger] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);

  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setAppState("loading");
    // Триггерим переподключение через изменение состояния
    setReconnectTrigger((prev) => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{ appState, setAppState, socketRef, reconnect, reconnectTrigger }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
