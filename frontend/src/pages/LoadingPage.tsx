import "./LoadingPage.css";

export default function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="loading-spinner"></div>
      <h2>Подключение к серверу...</h2>
      <p>Пожалуйста, подождите</p>
    </div>
  );
}
