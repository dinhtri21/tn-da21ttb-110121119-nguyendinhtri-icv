import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon } from "@mantine/core";
import { IconArrowsMove, IconTrash } from "@tabler/icons-react";
import DropZoneIndicator from "./DropZoneIndicator";

export interface SortableBlockProps {
  id: string;
  index: number;
  column: "left" | "right";
  moveBlock: (
    fromColumn: "left" | "right",
    toColumn: "left" | "right",
    from: number,
    to: number
  ) => void;
  removeBlock: (column: "left" | "right", index: number) => void;
  children: React.ReactNode;
  isOver: boolean;
  isOverTop: boolean;
  isOverBottom: boolean;
}

export default function SortableBlock({
  id,
  index,
  column,
  moveBlock,
  removeBlock,
  children,
  isOver,
  isOverTop,
  isOverBottom,
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: id,
    data: {
      column: column,
      index: index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <DropZoneIndicator isOver={isOverTop} position="top" />
      <div className="group relative cv-block-container">
        <div
          ref={setNodeRef}
          style={style}
          className={`cv-block-content bg-transparent rounded mb-1 transition-all duration-200 ${
            isDragging ? "shadow-lg scale-105" : ""
          }`}
        >
          <div className="flex-1">{children}</div>
        </div>

        {/* Overlay controls - only visible on hover and not printed */}
        <div className="cv-block-controls absolute top-[-34px] left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 print:hidden flex gap-2 p-[6px] bg-gray-100 backdrop-blur-sm rounded-t">
          <ActionIcon
            size="sm"
            variant="light"
            {...attributes}
            {...listeners}
            title="Kéo để di chuyển"
            className="cursor-move"
          >
            <IconArrowsMove stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="sm" variant="light" color="red" onClick={() => removeBlock(column, index)}>
            <IconTrash stroke={1.5} />
          </ActionIcon>
        </div>
      </div>
      <DropZoneIndicator isOver={isOverBottom} position="bottom" />
    </>
  );
}
