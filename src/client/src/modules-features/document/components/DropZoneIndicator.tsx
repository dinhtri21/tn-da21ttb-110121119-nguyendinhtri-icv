export interface DropZoneIndicatorProps {
  isOver: boolean;
  position: "top" | "bottom";
}
export default function DropZoneIndicator({ isOver, position }: DropZoneIndicatorProps) {
  if (!isOver) return null;

  return (
    <div
      className={`h-2 bg-blue-300 rounded-full my-2 transition-all duration-200 animate-pulse ${
        position === "top" ? "mb-1" : "mt-1"
      }`}
    />
  );
}
