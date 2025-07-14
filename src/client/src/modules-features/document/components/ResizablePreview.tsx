import { useRef, useState, useEffect } from "react";
import { BLOCKS } from "../constants/blocks";
import { Block } from "../interfaces/types";

export interface ResizablePreviewProps {
  leftWidth: number;
  onWidthChange: (width: number) => void;
  leftBlocks: Block[];
  rightBlocks: Block[];
}

export default function ResizablePreview({
  leftWidth,
  onWidthChange,
  leftBlocks,
  rightBlocks,
}: ResizablePreviewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Giới hạn từ 20% đến 80%
      const clampedWidth = Math.max(20, Math.min(80, newWidth));
      onWidthChange(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onWidthChange]);

  return (
    <div className="bg-gray-50 rounded p-3">
      <h3 className="text-sm font-medium mb-3">Xem trước bố cục</h3>
      <div ref={containerRef} className="relative">
        <div className="flex gap-0 relative h-32 border rounded overflow-hidden">
          <div className="bg-blue-100 p-2 relative" style={{ width: `${leftWidth}%` }}>
            <div className="text-xs text-blue-600 font-medium mb-1">Cột trái</div>
            <div className="space-y-1">
              {leftBlocks.slice(0, 3).map((block, idx) => (
                <div key={idx} className="text-xs bg-blue-200 rounded px-1 py-0.5 truncate">
                  {BLOCKS.find((b) => b.type === block.type)?.label}
                </div>
              ))}
              {leftBlocks.length > 3 && (
                <div className="text-xs text-blue-500">+{leftBlocks.length - 3} khác</div>
              )}
            </div>
          </div>

          {/* Resizable divider */}
          <div
            className={`absolute top-0 bottom-0 w-1 bg-gray-400 hover:bg-blue-500 cursor-col-resize transition-colors z-10 ${
              isDragging ? "bg-blue-500 shadow-lg" : ""
            }`}
            style={{ left: `${leftWidth}%`, transform: "translateX(-50%)" }}
            onMouseDown={handleMouseDown}
            title="Kéo để điều chỉnh tỷ lệ cột"
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-gray-500 rounded-full opacity-0 hover:opacity-100 transition-opacity">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-0.5 h-4 bg-white rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-green-100 p-2 relative" style={{ width: `${100 - leftWidth}%` }}>
            <div className="text-xs text-green-600 font-medium mb-1">Cột phải</div>
            <div className="space-y-1">
              {rightBlocks.slice(0, 3).map((block, idx) => (
                <div key={idx} className="text-xs bg-green-200 rounded px-1 py-0.5 truncate">
                  {BLOCKS.find((b) => b.type === block.type)?.label}
                </div>
              ))}
              {rightBlocks.length > 3 && (
                <div className="text-xs text-green-500">+{rightBlocks.length - 3} khác</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-center mt-2 text-xs text-gray-500">
          <div>
            Tỷ lệ: {Math.round(leftWidth)}% - {Math.round(100 - leftWidth)}%
          </div>
          <div className="text-gray-400">💡 Kéo thanh để điều chỉnh</div>
        </div>
      </div>
    </div>
  );
}
