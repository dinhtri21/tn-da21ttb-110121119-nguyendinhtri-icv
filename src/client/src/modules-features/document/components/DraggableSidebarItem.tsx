import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockType } from "../interfaces/types";

export interface DraggableSidebarItemProps {
  block: BlockType;
  onAddBlock: (type: string) => void;
  isDisabled?: boolean;
}

export default function DraggableSidebarItem({ block, onAddBlock, isDisabled }: DraggableSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: `sidebar-${block.type}`,
    data: {
      type: "sidebar-item",
      block: block,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDisabled ? 0.5 : style.opacity,
        cursor: isDisabled ? 'not-allowed' : 'move'
      }}
      {...(isDisabled ? {} : { ...attributes, ...listeners })}
      className={`bg-gray-100 rounded px-3 py-2 text-left ${
        isDisabled ? 'cursor-not-allowed' : 'hover:bg-blue-100 cursor-move'
      }`}
      onClick={() => !isDisabled && onAddBlock(block.type)}
    >
      {block.label}
    </div>
  );
} 