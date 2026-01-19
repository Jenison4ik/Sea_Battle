import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Игнорируем ошибки removeChild - они вызваны браузерными расширениями
    if (error.message.includes("removeChild")) {
      console.warn(
        "Ignoring removeChild error (likely caused by browser extension):",
        error.message
      );
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логируем только если это не ошибка removeChild
    if (!error.message.includes("removeChild")) {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Что-то пошло не так</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()}>
              Перезагрузить
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
