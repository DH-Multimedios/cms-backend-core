export interface TextBlock {
  type: 'text';
  content: string;
  color?: string;
  fontSize?: string;
  align?: 'left' | 'center' | 'right';
  padding?: string;
}

export interface HeadingBlock {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3;
  color?: string;
  align?: 'left' | 'center' | 'right';
  padding?: string;
}

export interface ButtonBlock {
  type: 'button';
  label: string;
  url: string;
  align?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
}

export interface ImageBlock {
  type: 'image';
  src: string;
  alt?: string;
  link?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DividerBlock {
  type: 'divider';
  borderColor?: string;
  borderWidth?: string;
  padding?: string;
}

export interface SpacerBlock {
  type: 'spacer';
  height: number;
}

export type Block = TextBlock | HeadingBlock | ButtonBlock | ImageBlock | DividerBlock | SpacerBlock;

export interface Column {
  blocks: Block[];
  width?: string;
  padding?: string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface Section {
  type: 'section';
  columns: Column[];
  backgroundColor?: string;
  padding?: string;
}
