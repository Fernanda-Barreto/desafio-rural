// src/components/Dashboard.tsx
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../redux/store';
import { fetchAllDashboardDataFromProducers } from '../redux/producersSlice'; 
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);


const MainWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
`;

const DashboardTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #1a202c;
`;

const DashboardSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DashboardChartsSection = styled(DashboardSection)`
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const Card = styled.div`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector((state: RootState) => state.producers);

  useEffect(() => {
   
    dispatch(fetchAllDashboardDataFromProducers());
  }, [dispatch]);

  if (loading === 'pending') {
    return (
      <MainWrapper>
        <DashboardTitle>Carregando dados...</DashboardTitle>
      </MainWrapper>
    );
  }

  if (error) {
    return (
      <MainWrapper>
        <DashboardTitle>Erro: {error}</DashboardTitle>
      </MainWrapper>
    );
  }
  

  const stateAbbreviationMap: { [key: string]: string } = {
    'SÃO PAULO': 'SP',
    'MINAS GERAIS': 'MG',
    'PARANÁ': 'PR',
    'SANTA CATARINA': 'SC',
    'RIO GRANDE DO SUL': 'RS',
    'MATO GROSSO': 'MT',
    'MATO GROSSO DO SUL': 'MS',
    'GOIÁS': 'GO',
    'TOCANTINS': 'TO',
    'BAHIA': 'BA',
    
  };

 
  const porEstadoMap = new Map();
  dashboard?.por_estado.forEach(item => {
    const estadoBruto = item.estado.toUpperCase().trim();
    const estadoNormalizado = stateAbbreviationMap[estadoBruto] || estadoBruto;
    porEstadoMap.set(estadoNormalizado, (porEstadoMap.get(estadoNormalizado) || 0) + item.count);
  });
  const porEstadoLabels = Array.from(porEstadoMap.keys());
  const porEstadoCounts = Array.from(porEstadoMap.values());
  
  const porEstadoData = {
    labels: porEstadoLabels,
    datasets: [{
      label: '# de Fazendas',
      data: porEstadoCounts,
      backgroundColor: ['#4299e1', '#48bb78', '#f6e05e', '#ed8936', '#9f7aea', '#dd6b20', '#4fd1c5', '#a0aec0'],
    }],
  };
  
  // Paleta de cores para os gráficos
  const newPalette = ['#667eea', '#805ad5', '#d53f8c', '#dd6b20', '#f6ad55', '#4fd1c5', '#4299e1', '#48bb78'];

  
  const porCulturaMap = new Map();
  dashboard?.por_cultura.forEach(item => {
    const culturaNormalizada = item.cultura.toUpperCase().trim();
    porCulturaMap.set(culturaNormalizada, (porCulturaMap.get(culturaNormalizada) || 0) + item.count);
  });
  const porCulturaLabels = Array.from(porCulturaMap.keys());
  const porCulturaCounts = Array.from(porCulturaMap.values());

  const porCulturaData = {
    labels: porCulturaLabels,
    datasets: [{
      label: '# de Fazendas',
      data: porCulturaCounts,
      backgroundColor: newPalette.slice(0, porCulturaLabels.length),
    }],
  };

  const porUsoSoloData = {
    labels: ['Área Agricultável', 'Área de Vegetação'],
    datasets: [{
      label: 'Uso do Solo (ha)',
      data: [dashboard?.por_uso_solo.area_agricultavel, dashboard?.por_uso_solo.area_vegetacao],
      backgroundColor: ['#48bb78', '#f6e05e'],
    }],
  };
  
 
  const pieOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <MainWrapper>
      <DashboardTitle>Dashboard de Produtores Rurais</DashboardTitle>

      <DashboardSection>
        <Card>
          <CardHeader>
            <CardTitle>Total de Fazendas: {dashboard?.total_fazendas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total de Hectares: {dashboard?.total_hectares}</CardTitle>
          </CardHeader>
        </Card>
      </DashboardSection>

      <DashboardChartsSection>
        <Card>
          <CardHeader>
            <CardTitle>Fazendas por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={porEstadoData} options={pieOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fazendas por Cultura</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={porCulturaData} options={pieOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso do Solo</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={porUsoSoloData} options={pieOptions} />
          </CardContent>
        </Card>
      </DashboardChartsSection>
    </MainWrapper>
  );
};

export default Dashboard;