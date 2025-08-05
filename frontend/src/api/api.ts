const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchDashboardData = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/total_fazendas`);
  if (!response.ok) {
    throw new Error('Falha ao buscar dados do dashboard.');
  }
  return await response.json();
};

export const createProducer = async (producerData: any) => {
  const response = await fetch(`${API_BASE_URL}/produtores/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producerData),
  });
  if (!response.ok) {
    throw new Error('Falha ao cadastrar produtor.');
  }
  return await response.json();
};