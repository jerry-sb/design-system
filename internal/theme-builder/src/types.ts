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
  | 'mono';

export type DepSource = { name: string; version: string; file: string; rel: string; hash: string };

export type ColorOption = 'all' | 'light' | 'dark';

export type PaletteOption = {
  option: ColorOption;
  p3?: boolean; // @support display-p3 지원여부
  theme?: boolean; // @theme inline 지원여부
  'reverse-theme'?: boolean; // @theme inline reverse
};

export interface PaletteSpec {
  colorName: RadixColor;
  base?: PaletteOption;
  alpha?: PaletteOption;
}

export interface ThemeConfig {
  palettes: PaletteSpec[]; // CLI가 읽는 설정
  var_prefix?: `${string}-`;
  theme_prefix?: `--${string}-`;
  outputDir?: string; // default: "src/styles/jerry-theme"
}

export interface ColorNameComponents {
  base: string;
  dark: boolean;
  p3: boolean;
  alpha: boolean;
}
