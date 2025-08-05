// styled.d.ts
import 'styled-components';
import { theme } from './styles/theme'; // caminho correto

type ThemeType = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}
