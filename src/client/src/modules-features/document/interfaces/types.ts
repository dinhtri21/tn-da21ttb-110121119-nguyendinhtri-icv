export interface Block {
  type: string;
  value: string;
}

export interface BlockType {
  type: string;
  label: string;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface ResizableDividerProps {
  leftWidth: number;
  onWidthChange: (width: number) => void;
}

