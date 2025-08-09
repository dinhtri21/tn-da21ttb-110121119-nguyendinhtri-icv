import { ICV } from "@/interface/cv";

export interface Block {
  type: string;
  // value: ICV;
  height?: number; // Added for spacer blocks
}

export interface BlockType {
  type: string;
  label: string;
}

export interface BlockTypeMultiLang {
  type: string;
  labels: {
    vi: string;
    en: string;
    [key: string]: string;
  };
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface ResizableDividerProps {
  leftWidth: number;
  onWidthChange: (width: number) => void;
}

export interface SpacerBlock extends Block {
  type: 'spacer';
  height: number;
}

