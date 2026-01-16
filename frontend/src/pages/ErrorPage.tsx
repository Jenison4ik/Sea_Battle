import { useApp } from "../contexts/AppContext";
import "./ErrorPage.css";

export default function ErrorPage() {
  const { reconnect } = useApp();

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2>Ошибка подключения</h2>
        <p>Не удалось установить соединение с сервером</p>
        <button onClick={reconnect} className="retry-button">
          Попробовать ещё раз
        </button>
      </div>
    </div>
  );
}
