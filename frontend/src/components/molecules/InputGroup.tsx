import type React from "react"
import styled from "styled-components"
import { Input } from "../../components/atoms/Input" // Import corrigido para o alias

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  label {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }
`

interface InputGroupProps {
  label: string
  name: string
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, ...props }) => (
  <Wrapper>
    <label htmlFor={props.name}>{label}</label>
    <Input id={props.name} {...props} />
  </Wrapper>
)
