import { useSortable } from "@dnd-kit/sortable";

export interface EmptyDropZoneProps {
  isOver: boolean;
  column: "left" | "right";
}

export default function EmptyDropZone({ isOver, column }: EmptyDropZoneProps) {
  const { setNodeRef } = useSortable({
    id: `empty-drop-zone-${column}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[1px] transition-all duration-200 ${
        isOver ? "mb-2" : "mb-1"
      } flex items-center justify-center`}
    >
      {isOver && (
        <div className="h-2 bg-blue-300 rounded-full transition-all duration-200 animate-pulse w-full" />
      )}
    </div>
  );
} 