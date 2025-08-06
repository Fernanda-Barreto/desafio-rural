// src/redux/producersSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';



export interface CulturaPlantada {
  id?: number;
  nome_cultura: string;
  safra: string;
}

export interface PropriedadeRural {
  id?: number;
  nome_fazenda: string;
  cidade: string;
  estado: string;
  area_total_ha: number;
  area_agricultavel_ha: number;
  area_vegetacao_ha: number;
  culturas: CulturaPlantada[];
}

export interface Producer {
  id?: number;
  nome_produtor: string;
  cpf_cnpj: string;
  propriedades: PropriedadeRural[];
}

export interface DashboardData {
  total_fazendas: number;
  total_hectares: number;
  por_estado: { estado: string, count: number }[];
  por_cultura: { cultura: string, count: number }[];
  por_uso_solo: { area_agricultavel: number, area_vegetacao: number };
}

export interface ProducersState {
  producers: Producer[];
  dashboard: DashboardData | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProducersState = {
  producers: [],
  dashboard: null,
  loading: 'idle',
  error: null,
};

// NOVO: Ação para buscar todos os dados do dashboard E CALCULAR NO FRONTEND
export const fetchAllDashboardDataFromProducers = createAsyncThunk(
  'producers/fetchAllDashboardDataFromProducers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Iniciando busca de produtores para o dashboard...');
      const response = await fetch('/api/produtores/');
      
      if (!response.ok) {
        console.error('Erro na requisição da API de produtores:', response.statusText);
        throw new Error('Failed to fetch producers list');
      }
      
      const allProducers = (await response.json()) as Producer[];
      console.log('Dados de produtores recebidos:', allProducers);

      if (!allProducers || allProducers.length === 0) {
        console.warn('Nenhum produtor encontrado. O dashboard será exibido com zeros.');
        const emptyDashboard: DashboardData = {
          total_fazendas: 0,
          total_hectares: 0,
          por_estado: [],
          por_cultura: [],
          por_uso_solo: { area_agricultavel: 0, area_vegetacao: 0 },
        };
        return emptyDashboard;
      }

      let totalFazendas = 0;
      let totalHectares = 0;
      const porEstadoMap = new Map<string, number>();
      const porCulturaMap = new Map<string, number>();
      let areaAgricultavelTotal = 0;
      let areaVegetacaoTotal = 0;

      allProducers.forEach(producer => {
        producer.propriedades.forEach(propriedade => {
          totalFazendas++;
          totalHectares += propriedade.area_total_ha;
          areaAgricultavelTotal += propriedade.area_agricultavel_ha;
          areaVegetacaoTotal += propriedade.area_vegetacao_ha;
          
          const estadoNormalizado = propriedade.estado.toUpperCase().trim();
          porEstadoMap.set(estadoNormalizado, (porEstadoMap.get(estadoNormalizado) || 0) + 1);
          
          propriedade.culturas.forEach(cultura => {
            const culturaNormalizada = cultura.nome_cultura.toUpperCase().trim();
            porCulturaMap.set(culturaNormalizada, (porCulturaMap.get(culturaNormalizada) || 0) + 1);
          });
        });
      });

      const porEstado = Array.from(porEstadoMap.entries()).map(([estado, count]) => ({
        estado,
        count
      }));

      const porCultura = Array.from(porCulturaMap.entries()).map(([cultura, count]) => ({
        cultura,
        count
      }));

      const dashboardData: DashboardData = {
        total_fazendas: totalFazendas,
        total_hectares: totalHectares,
        por_estado: porEstado,
        por_cultura: porCultura,
        por_uso_solo: {
          area_agricultavel: areaAgricultavelTotal,
          area_vegetacao: areaVegetacaoTotal,
        },
      };

      console.log('Dados do dashboard calculados:', dashboardData);
      return dashboardData;
    } catch (err) {
      console.error('Erro no cálculo do dashboard:', err);
      return rejectWithValue((err as Error).message || 'Erro ao buscar e calcular dados do dashboard.');
    }
  }
);


// RESTANTE DAS AÇÕES (MANTIDAS)
export const fetchAllDashboardData = createAsyncThunk(
  'producers/fetchAllDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const [totalFazendasRes, totalHectaresRes, porEstadoRes, porCulturaRes, porUsoSoloRes] = await Promise.all([
        fetch('/api/dashboard/total_fazendas'),
        fetch('/api/dashboard/total_hectares'),
        fetch('/api/dashboard/por_estado'),
        fetch('/api/dashboard/por_cultura'),
        fetch('/api/dashboard/por_uso_solo'),
      ]);

      if (!totalFazendasRes.ok || !totalHectaresRes.ok) {
        throw new Error('Failed to fetch dashboard totals');
      }

      const data = {
        total_fazendas: (await totalFazendasRes.json()).total_fazendas,
        total_hectares: (await totalHectaresRes.json()).total_hectares,
        por_estado: await porEstadoRes.json(),
        por_cultura: await porCulturaRes.json(),
        por_uso_solo: await porUsoSoloRes.json(),
      };
      return data as DashboardData;
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Erro ao buscar dados do dashboard.');
    }
  }
);


// READ: Buscar lista de produtores
export const fetchProducers = createAsyncThunk(
  'producers/fetchProducers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/produtores/');
      if (!response.ok) {
        throw new Error('Failed to fetch producers list');
      }
      return (await response.json()) as Producer[];
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Failed to fetch producers list');
    }
  }
);

// READ: Buscar produtor por CPF ou CNPJ
export const fetchProducerByCpfCnpj = createAsyncThunk(
  'producers/fetchProducerByCpfCnpj',
  async (cpf_cnpj: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/produtores/?cpf_cnpj=${cpf_cnpj}`);
      if (!response.ok) {
        throw new Error('Failed to fetch producer by CPF/CNPJ');
      }
      const data = await response.json();
      return (data.length > 0 ? data[0] : null) as Producer | null;
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Failed to fetch producer by CPF/CNPJ');
    }
  }
);


// CREATE: Criar um novo produtor
export const createProducer = createAsyncThunk(
  'producers/createProducer',
  async (producerData: Producer, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch('/api/produtores/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producerData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create producer');
      }
      dispatch(fetchAllDashboardData());
      dispatch(fetchProducers());
      return (await response.json()) as Producer;
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Failed to create producer');
    }
  }
);

// UPDATE: Atualizar um produtor
export const updateProducer = createAsyncThunk(
  'producers/updateProducer',
  async ({ id, data }: { id: number; data: Producer }, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/produtores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update producer');
      }
      dispatch(fetchProducers());
      return (await response.json()) as Producer;
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Failed to update producer');
    }
  }
);

// DELETE: Deletar um produtor
export const deleteProducer = createAsyncThunk(
  'producers/deleteProducer',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/produtores/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete producer');
      }
      dispatch(fetchAllDashboardData());
      dispatch(fetchProducers());
      return id;
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Failed to delete producer');
    }
  }
);

// --- Slice e Reducers ---
export const producersSlice = createSlice({
  name: 'producers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Use o novo thunk aqui
      .addCase(fetchAllDashboardDataFromProducers.pending, (state) => { state.loading = 'pending'; })
      .addCase(fetchAllDashboardDataFromProducers.fulfilled, (state, action: PayloadAction<DashboardData>) => {
        state.loading = 'succeeded';
        state.dashboard = action.payload;
      })
      .addCase(fetchAllDashboardDataFromProducers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(fetchProducers.pending, (state) => { state.loading = 'pending'; })
      .addCase(fetchProducers.fulfilled, (state, action: PayloadAction<Producer[]>) => {
        state.loading = 'succeeded';
        state.producers = action.payload;
      })
      .addCase(fetchProducers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to fetch producers list';
      })
      .addCase(fetchProducerByCpfCnpj.pending, (state) => { state.loading = 'pending'; })
      .addCase(fetchProducerByCpfCnpj.fulfilled, (state) => { 
        state.loading = 'succeeded'; 
        state.error = null;
      })
      .addCase(fetchProducerByCpfCnpj.rejected, (state, action) => { 
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to fetch producer by CPF/CNPJ';
      })
      .addCase(createProducer.pending, (state) => { state.loading = 'pending'; })
      .addCase(createProducer.fulfilled, (state) => { state.loading = 'succeeded'; })
      .addCase(createProducer.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to create producer';
      })
      .addCase(updateProducer.pending, (state) => { state.loading = 'pending'; })
      .addCase(updateProducer.fulfilled, (state) => { state.loading = 'succeeded'; })
      .addCase(updateProducer.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to update producer';
      })
      .addCase(deleteProducer.pending, (state) => { state.loading = 'pending'; })
      .addCase(deleteProducer.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = 'succeeded';
        state.producers = state.producers.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProducer.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to delete producer';
      });
  },
});

export default producersSlice.reducer;