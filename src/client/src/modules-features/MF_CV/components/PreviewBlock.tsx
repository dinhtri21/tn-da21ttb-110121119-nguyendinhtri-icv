import { BLOCKS } from "../constants/blocks";
import { Block } from "../interfaces/types";

export interface PreviewBlockProps {
  block: Block;
  column: "left" | "right";
}

export default function PreviewBlock({ block, column }: PreviewBlockProps) {
  return (
    <div
      className={`bg-gray-100 rounded p-2 mb-2 text-sm ${
        column === "left" ? "border-l-2 border-blue-500" : "border-r-2 border-green-500"
      }`}
    >
      <div className="font-medium text-gray-700">
        {BLOCKS.find((b) => b.type === block.type)?.label}
      </div>
      <div className="text-gray-500 text-xs mt-1">
        {column === "left" ? "Cột trái" : "Cột phải"}
      </div>
    </div>
  );
}
