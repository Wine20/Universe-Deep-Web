import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  // Log a detailed error for developers
  console.error("Erro fatal: Não foi possível encontrar o elemento 'root' para montar a aplicação. A inicialização foi interrompida.");
  
  // Display a user-friendly message on the page
  document.body.innerHTML = `
    <div style="background-color: #020617; color: #e2e8f0; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem;">
      <div>
        <h1 style="font-size: 1.5rem; font-weight: bold; color: #f87171;">Erro Crítico na Aplicação</h1>
        <p style="margin-top: 1rem; color: #94a3b8;">Não foi possível carregar a interface do Bluewhite AI.</p>
        <p style="margin-top: 0.5rem; color: #94a3b8;">Por favor, tente recarregar a página. Se o problema persistir, o arquivo principal da aplicação pode estar corrompido.</p>
      </div>
    </div>
  `;
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
