import { BLOCKS } from "../constants/blocks";
import DraggableSidebarItem from "./DraggableSidebarItem";

export interface SidebarProps {
  onAddBlock: (type: string) => void;
}

export default function Sidebar({ onAddBlock }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r p-4">
      <h2 className="font-bold mb-4">Bố cục CV</h2>
      <div className="flex flex-col gap-2">
        {BLOCKS.map((block) => (
          <DraggableSidebarItem key={block.type} block={block} onAddBlock={onAddBlock} />
        ))}
      </div>
    </div>
  );
} 