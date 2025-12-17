
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("FinAI: Iniciando ponto de entrada do React...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("FinAI: Erro crítico - Elemento #root não encontrado no DOM.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("FinAI: App montado com sucesso.");
} catch (error) {
  console.error("FinAI: Erro fatal durante a renderização inicial:", error);
}
