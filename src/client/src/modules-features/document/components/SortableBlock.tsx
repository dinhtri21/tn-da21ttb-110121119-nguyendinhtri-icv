import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DropZoneIndicator from "./DropZoneIndicator";
import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

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
          {...attributes}
          {...listeners}
          className={`cv-block-content bg-white rounded mb-3 transition-all duration-200 ${
            isDragging ? "shadow-lg scale-105" : ""
          }`}
        >
          <div className="flex-1">{children}</div>
        </div>

        {/* Overlay controls - only visible on hover and not printed */}
        <div className="cv-block-controls absolute top-[-34px] left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 print:hidden flex gap-2 p-[6px] bg-gray-100 backdrop-blur-sm rounded-t">
          <ActionIcon  size="sm" variant="light" color="red" onClick={() => removeBlock(column, index)}>
            <IconTrash stroke={1.5} />
          </ActionIcon>
          {/* <button
            className="cv-block-delete text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => removeBlock(column, index)}
            title="Xóa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button> */}
          <div
            className="cv-block-drag text-gray-400 hover:text-blue-500 transition-colors cursor-move"
            title="Kéo để di chuyển"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      <DropZoneIndicator isOver={isOverBottom} position="bottom" />
    </>
  );
}
