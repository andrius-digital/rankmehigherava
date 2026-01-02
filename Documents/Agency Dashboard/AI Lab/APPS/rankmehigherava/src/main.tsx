import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "sans-serif", color: "white", background: "#0a0a0a", minHeight: "100vh" }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <pre style={{ background: "#1a1a1a", padding: "10px", overflow: "auto", color: "#fff" }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: white; background: #0a0a0a; min-height: 100vh;">
      <h1>Failed to start application</h1>
      <p>${error instanceof Error ? error.message : "Unknown error"}</p>
      <pre style="background: #1a1a1a; padding: 10px; overflow: auto; color: #fff;">
        ${error instanceof Error ? error.stack : String(error)}
      </pre>
    </div>
  `;
}
