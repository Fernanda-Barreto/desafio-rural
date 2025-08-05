import React, { useEffect } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../redux/store';
import { fetchAllDashboardData } from '../redux/producersSlice';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Container from '../components/organisms/Container';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardContent = styled.div<{ theme: DefaultTheme }>`
  h1 {
    margin-bottom: ${props => props.theme.spacing.medium};
    text-align: center;
  }
  .dashboard-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: ${props => props.theme.spacing.large};
    text-align: center;
    
    h2 {
      background: ${props => props.theme.colors.background};
      padding: ${props => props.theme.spacing.medium};
      border-radius: ${props => props.theme.borderRadius};
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      font-size: 1.2rem;
    }
  }
  .dashboard-charts {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.medium};
  }
  .chart-container {
    width: 300px;
    height: 350px;
    padding: ${props => props.theme.spacing.medium};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius};
    background: ${props => props.theme.colors.background};
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    text-align: center;
    
    h3 {
      margin-bottom: ${props => props.theme.spacing.small};
    }
  }
`;

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector((state: RootState) => state.producers);

  useEffect(() => {
    dispatch(fetchAllDashboardData());
  }, [dispatch]);

  if (loading === 'pending') {
    return <div>Carregando dados...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  const porEstadoData = {
    labels: dashboard?.por_estado.map(item => item.estado),
    datasets: [{
      label: '# de Fazendas',
      data: dashboard?.por_estado.map(item => item.count),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }],
  };

  const porCulturaData = {
    labels: dashboard?.por_cultura.map(item => item.cultura),
    datasets: [{
      label: '# de Fazendas',
      data: dashboard?.por_cultura.map(item => item.count),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }],
  };

  const porUsoSoloData = {
    labels: ['Área Agricultável', 'Área de Vegetação'],
    datasets: [{
      label: 'Uso do Solo (ha)',
      data: [dashboard?.por_uso_solo.area_agricultavel, dashboard?.por_uso_solo.area_vegetacao],
      backgroundColor: ['#4BC0C0', '#2F855A'],
    }],
  };

  return (
    <Container>
      <DashboardContent>
        <h1>Dashboard de Produtores Rurais</h1>
        <div className="dashboard-stats">
          <h2>Total de Fazendas: {dashboard?.total_fazendas}</h2>
          <h2>Total de Hectares: {dashboard?.total_hectares}</h2>
        </div>
        <div className="dashboard-charts">
          <div className="chart-container">
            <h3>Fazendas por Estado</h3>
            <Pie data={porEstadoData} />
          </div>
          <div className="chart-container">
            <h3>Fazendas por Cultura</h3>
            <Pie data={porCulturaData} />
          </div>
          <div className="chart-container">
            <h3>Uso do Solo</h3>
            <Pie data={porUsoSoloData} />
          </div>
        </div>
      </DashboardContent>
    </Container>
  );
};

export default Dashboard;