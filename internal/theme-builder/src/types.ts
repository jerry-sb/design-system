export type RadixColor =
  | 'gray'
  | 'mauve'
  | 'slate'
  | 'sage'
  | 'olive'
  | 'sand'
  | 'tomato'
  | 'red'
  | 'crimson'
  | 'pink'
  | 'plum'
  | 'purple'
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'grass'
  | 'brown'
  | 'orange'
  | 'sky'
  | 'mint'
  | 'lime'
  | 'yellow'
  | 'amber'
  | 'gold'
  | 'bronze'
  | 'iris'
  | 'black'
  | 'white';

export interface PaletteSpec {
  colorName: RadixColor;
  colorsOnly?: boolean; // true면 variables-only import
  p3?: boolean;
}

export interface ThemeConfig {
  palettes: PaletteSpec[]; // CLI가 읽는 설정
  colorsOnly?: boolean;
  outputDir?: string; // default: "src/styles/jerry-theme"
}

export interface ColorNameComponents {
  base: string;
  dark: boolean;
  p3: boolean;
  alpha: boolean;
}
