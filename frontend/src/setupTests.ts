// frontend/src/setupTests.ts

import '@testing-library/jest-dom';
import 'whatwg-fetch'; 


global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ total_fazendas: 5 }), 
  }),
) as jest.Mock;