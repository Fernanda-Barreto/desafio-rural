// frontend/src/setupTests.ts

import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Polyfill para o ambiente de teste

// Configuração do jest-fetch-mock para simular a API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ total_fazendas: 5 }), // Resposta simulada
  }),
) as jest.Mock;