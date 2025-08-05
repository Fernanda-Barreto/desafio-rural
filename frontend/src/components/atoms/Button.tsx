import styled from "styled-components"

export const Button = styled.button<{ $variant?: "primary" | "secondary" | "danger" | "dark" }>`
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: white;
  background-color: ${({ theme, $variant }) => {
    switch ($variant) {
      case "secondary":
        return theme.colors.secondary
      case "danger":
        return theme.colors.danger
      case "dark":
        return "#1255" // Cor escura para o botão "Adicionar Novo Produtor"
      default:
        return theme.colors.primary
    }
  }};
  transition: 0.2s ease-in-out;
  &:hover {
    opacity: 0.9;
    ${({ $variant }) => $variant === "dark" && `background-color: #444;`} /* Hover para o botão escuro */
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`
