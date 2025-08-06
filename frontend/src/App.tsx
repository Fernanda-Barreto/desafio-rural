import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ProducersList from './pages/ProducersList';
import ProducerForm from './components/organisms/ProducerForm';
import Header from './components/organisms/Header'; 
import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';


const AppContainer = styled.div`
  /* min-h-screen bg-gray-100 */
  min-height: 100vh;
  background-color: #f3f4f6; /* bg-gray-100 */
`;

const MainContent = styled.main`
  /* p-6 */
  padding: 1.5rem; /* p-6 */
  width: 100%;
  box-sizing: border-box;
`;

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'form' | 'list'>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'form':
    
        return <ProducerForm onClose={() => setCurrentPage('list')} />;
      case 'list':
      
        return <ProducersList onAddClick={() => setCurrentPage('form')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <MainContent>{renderPage()}</MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;