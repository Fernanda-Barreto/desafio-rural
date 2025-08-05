import React from 'react';
import styled, { DefaultTheme } from 'styled-components';

// --- Estilos de Navegação ---
const Nav = styled.nav<{ theme: DefaultTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.medium} ${({ theme }) => theme.spacing.large};
  background-color: #08213aff; // Cor de fundo escura para a barra
  color: white;
  width: 100%;
  box-shadow: 0 2px 4px rgba(68, 99, 119, 0.85);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavButton = styled.button<{ theme: DefaultTheme; $isActive: boolean }>`
  padding: 0.75rem 1rem; /* Aumentei o padding para se parecer mais com o botão do Tailwind */
  border-radius: ${({ theme }) => theme.borderRadius};
  border: none; /* Removi a borda para se assemelhar ao exemplo */
  background-color: ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : 'transparent')};
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
  font-weight: ${({ $isActive }) => ($isActive ? 'bold' : 'normal')};
  
  &:hover {
    background-color: ${({ theme, $isActive }) =>
      $isActive ? '#0056b3' : 'rgba(255, 255, 255, 0.1)'}; // Cor de hover mais suave para botões inativos
    transform: ${({ $isActive }) => ($isActive ? 'scale(1.02)' : 'none')}; /* Efeito de scale para o botão ativo */
  }

  /* Estilos específicos para o botão ativo */
  ${({ theme, $isActive }) =>
    $isActive &&
    `
    background-color: #0056b3; // Cor azul mais escura para ativo
    &:hover {
      background-color: #004494; // Efeito de hover ainda mais escuro para o ativo
    }
  `}
`;

interface HeaderProps {
  currentPage: 'dashboard' | 'form' | 'list';
  setCurrentPage: (page: 'dashboard' | 'form' | 'list') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <Nav>
      <NavButton onClick={() => setCurrentPage('dashboard')} $isActive={currentPage === 'dashboard'}>
        Dashboard
      </NavButton>
      <NavButton onClick={() => setCurrentPage('list')} $isActive={currentPage === 'list'}>
        Listar Produtores
      </NavButton>
      <NavButton onClick={() => setCurrentPage('form')} $isActive={currentPage === 'form'}>
        Cadastrar Produtor
      </NavButton>
    </Nav>
  );
};

export default Header;