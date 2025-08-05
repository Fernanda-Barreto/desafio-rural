import styled from "styled-components"

export const Input = styled.input`
  padding: 0.75rem; /* Aumentado para 0.75rem para melhor visual */
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 1rem;
  transition: 0.2s ease-in-out;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 4px ${({ theme }) => theme.colors.primary}66;
  }
`
