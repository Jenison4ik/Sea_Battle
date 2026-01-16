import { useApp } from "../contexts/AppContext";

export default function Main() {
  const { appState, setAppState } = useApp();

  const handleCreateGame = () => {
    setAppState("create");
  };

  const handleJoinGame = () => {
    setAppState("search");
  };

  return (
    <>
      <h1>Морской бой</h1>
      <button onClick={handleCreateGame}>Создать игру</button>
      <button onClick={handleJoinGame}>Присоединиться к игре</button>
      <p>Текущее состояние: {appState}</p>
    </>
  );
}
