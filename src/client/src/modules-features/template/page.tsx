"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// TypeScript interfaces
interface Block {
  type: string;
  value: string;
}

interface BlockType {
  type: string;
  label: string;
}

interface MousePosition {
  x: number;
  y: number;
}

interface DraggableSidebarItemProps {
  block: BlockType;
  onAddBlock: (type: string) => void;
}

interface SidebarProps {
  onAddBlock: (type: string) => void;
}

interface DropZoneIndicatorProps {
  isOver: boolean;
  position: "top" | "bottom";
}

interface EmptyDropZoneProps {
  isOver: boolean;
  column: "left" | "right";
}

interface SortableBlockProps {
  id: string;
  index: number;
  column: "left" | "right";
  moveBlock: (fromColumn: "left" | "right", toColumn: "left" | "right", from: number, to: number) => void;
  removeBlock: (column: "left" | "right", index: number) => void;
  children: React.ReactNode;
  isOver: boolean;
  isOverTop: boolean;
  isOverBottom: boolean;
}

interface PreviewBlockProps {
  block: Block;
  column: "left" | "right";
}

interface ResizableDividerProps {
  leftWidth: number;
  onWidthChange: (width: number) => void;
}

interface ResizablePreviewProps {
  leftWidth: number;
  onWidthChange: (width: number) => void;
  leftBlocks: Block[];
  rightBlocks: Block[];
}

interface BlockEditorProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
}

const BLOCKS: BlockType[] = [
  { type: "profile", label: "Ảnh đại diện" },
  { type: "name", label: "Tên & Chức danh" },
  { type: "objective", label: "Mục tiêu nghề nghiệp" },
  { type: "experience", label: "Kinh nghiệm làm việc" },
  { type: "education", label: "Học vấn" },
  { type: "skills", label: "Kỹ năng" },
  { type: "project", label: "Dự án" },
  { type: "certificate", label: "Chứng chỉ" },
  { type: "award", label: "Giải thưởng" },
];

// Draggable sidebar item
function DraggableSidebarItem({ block, onAddBlock }: DraggableSidebarItemProps) {
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
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-100 hover:bg-blue-100 rounded px-3 py-2 text-left cursor-move"
      onClick={() => onAddBlock(block.type)}
    >
      {block.label}
    </div>
  );
}

function Sidebar({ onAddBlock }: SidebarProps) {
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

// Drop zone indicator
function DropZoneIndicator({ isOver, position }: DropZoneIndicatorProps) {
  if (!isOver) return null;

  return (
    <div
      className={`h-2 bg-blue-300 rounded-full my-2 transition-all duration-200 animate-pulse ${
        position === "top" ? "mb-1" : "mt-1"
      }`}
    />
  );
}

// Empty drop zone for each column
function EmptyDropZone({ isOver, column }: EmptyDropZoneProps) {
  const { setNodeRef } = useSortable({
    id: `empty-drop-zone-${column}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[20px] transition-all duration-200 ${
        isOver ? "mb-2" : "mb-1"
      } flex items-center justify-center`}
    >
      {isOver && (
        <div className="h-2 bg-blue-300 rounded-full transition-all duration-200 animate-pulse w-full" />
      )}
    </div>
  );
}

// Sortable block component
function SortableBlock({
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
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white rounded shadow p-4 mb-3 flex items-center justify-between transition-all duration-200 ${
          isDragging ? "shadow-lg scale-105" : ""
        }`}
      >
        <div className="flex-1">{children}</div>
        <button
          className="ml-2 text-red-500 hover:text-red-700"
          onClick={() => removeBlock(column, index)}
          title="Xóa"
        >
          ✕
        </button>
        <span className="cursor-move ml-2" title="Kéo để di chuyển">
          ☰
        </span>
      </div>
      <DropZoneIndicator isOver={isOverBottom} position="bottom" />
    </>
  );
}

// Preview component for right sidebar
function PreviewBlock({ block, column }: PreviewBlockProps) {
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

// Resizable divider for main content
function ResizableDivider({ leftWidth, onWidthChange }: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
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
    <div ref={containerRef} className="relative w-full h-full">
      <div
        className={`absolute top-0 bottom-0 w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors ${
          isDragging ? "bg-blue-500" : ""
        }`}
        style={{ left: `${leftWidth}%` }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}

// Resizable preview component
function ResizablePreview({ leftWidth, onWidthChange, leftBlocks, rightBlocks }: ResizablePreviewProps) {
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

function BlockEditor({ type, value, onChange }: BlockEditorProps) {
  if (type === "profile") {
    return (
      <div>
        <label className="block mb-2 font-medium text-gray-700">Ảnh đại diện</label>
        <input
          type="file"
          accept="image/*"
          className="mb-2 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  const getPlaceholder = (type: string): string => {
    switch (type) {
      case "name":
        return "Nhập tên và chức danh của bạn...";
      case "objective":
        return "Nhập mục tiêu nghề nghiệp...";
      case "experience":
        return "Nhập kinh nghiệm làm việc...";
      case "education":
        return "Nhập thông tin học vấn...";
      case "skills":
        return "Nhập các kỹ năng của bạn...";
      case "project":
        return "Nhập thông tin về các dự án...";
      case "certificate":
        return "Nhập các chứng chỉ...";
      case "award":
        return "Nhập các giải thưởng...";
      default:
        return "Nhập nội dung...";
    }
  };

  return (
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        {BLOCKS.find((b) => b.type === type)?.label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder(type)}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
        rows={4}
      />
    </div>
  );
}

export default function CVBuilderPage() {
  const [leftBlocks, setLeftBlocks] = useState<Block[]>([]);
  const [rightBlocks, setRightBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<"top" | "bottom" | null>(null);
  const [isOverEmpty, setIsOverEmpty] = useState(false);
  const [overColumn, setOverColumn] = useState<"left" | "right" | null>(null);
  const [leftWidth, setLeftWidth] = useState(50); // Percentage for left column width

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getBlocks = (column: "left" | "right"): Block[] => {
    return column === "left" ? leftBlocks : rightBlocks;
  };

  const setBlocks = (column: "left" | "right", blocks: Block[]): void => {
    if (column === "left") {
      setLeftBlocks(blocks);
    } else {
      setRightBlocks(blocks);
    }
  };

  const moveBlock = (fromColumn: "left" | "right", toColumn: "left" | "right", from: number, to: number): void => {
    if (fromColumn === toColumn) {
      // Same column reordering
      const blocks = getBlocks(fromColumn);
      const updated = [...blocks];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      setBlocks(fromColumn, updated);
    } else {
      // Cross-column move
      const fromBlocks = getBlocks(fromColumn);
      const toBlocks = getBlocks(toColumn);
      const [removed] = fromBlocks.splice(from, 1);
      toBlocks.splice(to, 0, removed);
      setBlocks(fromColumn, [...fromBlocks]);
      setBlocks(toColumn, [...toBlocks]);
    }
  };

  const addBlock = (type: string, column: "left" | "right" = "left"): void => {
    const blocks = getBlocks(column);
    setBlocks(column, [...blocks, { type, value: "" }]);
  };

  const removeBlock = (column: "left" | "right", index: number): void => {
    const blocks = getBlocks(column);
    setBlocks(
      column,
      blocks.filter((_, i) => i !== index)
    );
  };

  const updateBlock = (column: "left" | "right", index: number, value: string): void => {
    const blocks = getBlocks(column);
    setBlocks(
      column,
      blocks.map((block, i) => (i === index ? { ...block, value } : block))
    );
  };

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveId(event.active.id.toString());
  };

  // Helper function to check if mouse is inside drop zone area
  const isInsideDropZone = (event: DragOverEvent): boolean => {
    const cvArea = document.querySelector(".drop-zone-area");
    if (!cvArea) return false;

    const rect = cvArea.getBoundingClientRect();
    const mouseX = (event.activatorEvent as MouseEvent)?.clientX || 0;
    const mouseY = (event.activatorEvent as MouseEvent)?.clientY || 0;

    return (
      mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom
    );
  };

  const handleDragOver = (event: DragOverEvent): void => {
    const { over } = event;

    if (!over) {
      setOverId(null);
      setOverPosition(null);
      setIsOverEmpty(false);
      setOverColumn(null);
      return;
    }

    const overId = over.id.toString();

    // Check if we're over empty drop zones
    if (overId === "empty-drop-zone-left") {
      setIsOverEmpty(true);
      setOverColumn("left");
      setOverId(null);
      setOverPosition(null);
      return;
    }

    if (overId === "empty-drop-zone-right") {
      setIsOverEmpty(true);
      setOverColumn("right");
      setOverId(null);
      setOverPosition(null);
      return;
    }

    setIsOverEmpty(false);
    setOverColumn(null);

    // Determine if we're over a block and which position
    if (overId.startsWith("left-block-") || overId.startsWith("right-block-")) {
      setOverId(overId);

      // Get the mouse position and element rect
      const mouseY = (event.activatorEvent as MouseEvent)?.clientY || 0;
      const element = document.getElementById(overId);

      if (element) {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;

        // Determine if mouse is in top or bottom half
        setOverPosition(mouseY < elementCenter ? "top" : "bottom");
      } else {
        setOverPosition("bottom"); // Default to bottom
      }
    } else {
      setOverId(null);
      setOverPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const cvArea = document.querySelector(".drop-zone-area");
    let mouseX = 0,
      mouseY = 0;
    if (window.event && window.event instanceof MouseEvent) {
      mouseX = window.event.clientX;
      mouseY = window.event.clientY;
    }
    if (cvArea) {
      const rect = cvArea.getBoundingClientRect();
      const inside =
        mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;
      if (!inside) {
        setActiveId(null);
        setOverId(null);
        setOverPosition(null);
        setIsOverEmpty(false);
        setOverColumn(null);
        return;
      }
    }

    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    setOverPosition(null);
    setIsOverEmpty(false);
    setOverColumn(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Handle sidebar item drop
    if (activeId.startsWith("sidebar-")) {
      const blockType = activeId.replace("sidebar-", "");

      // Check if dropping in empty areas
      if (overId === "empty-drop-zone-left") {
        const newBlocks = [{ type: blockType, value: "" }, ...leftBlocks];
        setLeftBlocks(newBlocks);
        return;
      }

      if (overId === "empty-drop-zone-right") {
        const newBlocks = [{ type: blockType, value: "" }, ...rightBlocks];
        setRightBlocks(newBlocks);
        return;
      }

      // Find the target index and column
      let targetColumn: "left" | "right" | null = null;
      let targetIndex = -1;

      if (overId.startsWith("left-block-")) {
        targetColumn = "left";
        targetIndex = leftBlocks.findIndex((_, i) => `left-block-${i}` === overId);
      } else if (overId.startsWith("right-block-")) {
        targetColumn = "right";
        targetIndex = rightBlocks.findIndex((_, i) => `right-block-${i}` === overId);
      }

      if (targetColumn && targetIndex !== -1) {
        const blocks = getBlocks(targetColumn);
        let insertIndex: number;
        if (overPosition === "top") {
          insertIndex = targetIndex;
        } else {
          insertIndex = targetIndex + 1;
        }

        const newBlocks = [...blocks];
        newBlocks.splice(insertIndex, 0, { type: blockType, value: "" });
        setBlocks(targetColumn, newBlocks);
      } else {
        // Default to left column if no specific target
        addBlock(blockType, "left");
      }
      return;
    }

    // Handle block reordering
    if (activeId !== overId) {
      // Parse active block info
      let activeColumn: "left" | "right" | null = null;
      let activeIndex = -1;

      if (activeId.startsWith("left-block-")) {
        activeColumn = "left";
        activeIndex = leftBlocks.findIndex((_, i) => `left-block-${i}` === activeId);
      } else if (activeId.startsWith("right-block-")) {
        activeColumn = "right";
        activeIndex = rightBlocks.findIndex((_, i) => `right-block-${i}` === activeId);
      }

      if (!activeColumn || activeIndex === -1) return;

      // Handle drop on empty zones
      if (overId === "empty-drop-zone-left") {
        moveBlock(activeColumn, "left", activeIndex, 0);
        return;
      }

      if (overId === "empty-drop-zone-right") {
        moveBlock(activeColumn, "right", activeIndex, 0);
      }

      // Parse target block info
      let targetColumn: "left" | "right" | null = null;
      let targetIndex = -1;

      if (overId.startsWith("left-block-")) {
        targetColumn = "left";
        targetIndex = leftBlocks.findIndex((_, i) => `left-block-${i}` === overId);
      } else if (overId.startsWith("right-block-")) {
        targetColumn = "right";
        targetIndex = rightBlocks.findIndex((_, i) => `right-block-${i}` === overId);
      }

      if (targetColumn && targetIndex !== -1) {
        let finalIndex = targetIndex;

        // Adjust index based on position
        if (overPosition === "top") {
          finalIndex = targetIndex;
        } else {
          finalIndex = targetIndex + 1;
        }

        // Adjust for same column movement
        if (activeColumn === targetColumn && activeIndex < finalIndex) {
          finalIndex -= 1;
        }

        if (finalIndex !== activeIndex || activeColumn !== targetColumn) {
          moveBlock(activeColumn, targetColumn, activeIndex, finalIndex);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Sidebar */}
        <Sidebar onAddBlock={(type) => addBlock(type, "left")} />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Trình tạo CV kéo thả</h1>
          <div className="drop-zone-area max-w-6xl mx-auto bg-amber-50">
            <div className="min-h-[200px] flex gap-4 relative">
              {/* Left Column */}
              <div
                className="bg-white rounded-lg shadow-sm p-4 "
                style={{ width: `${leftWidth}%` }}
              >
                <h3 className="font-semibold mb-4 text-blue-600">Cột trái</h3>
                <SortableContext
                  items={[
                    "empty-drop-zone-left",
                    ...leftBlocks.map((_, idx) => `left-block-${idx}`),
                  ]}
                  strategy={verticalListSortingStrategy}
                >
                  <EmptyDropZone isOver={isOverEmpty && overColumn === "left"} column="left" />

                  {leftBlocks.map((block, idx) => (
                    <SortableBlock
                      key={idx}
                      id={`left-block-${idx}`}
                      index={idx}
                      column="left"
                      moveBlock={moveBlock}
                      removeBlock={removeBlock}
                      isOver={overId === `left-block-${idx}`}
                      isOverTop={overId === `left-block-${idx}` && overPosition === "top"}
                      isOverBottom={overId === `left-block-${idx}` && overPosition === "bottom"}
                    >
                      <BlockEditor
                        type={block.type}
                        value={block.value}
                        onChange={(val) => updateBlock("left", idx, val)}
                      />
                    </SortableBlock>
                  ))}
                </SortableContext>

                {leftBlocks.length === 0 && (
                  <div className="text-gray-400 text-center py-10 border-2 border-dashed border-gray-300 rounded">
                    <p className="text-sm">Kéo các mục vào cột trái</p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div
                className="bg-white rounded-lg shadow-sm p-4"
                style={{ width: `${100 - leftWidth}%` }}
              >
                <h3 className="font-semibold mb-4 text-green-600">Cột phải</h3>
                <SortableContext
                  items={[
                    "empty-drop-zone-right",
                    ...rightBlocks.map((_, idx) => `right-block-${idx}`),
                  ]}
                  strategy={verticalListSortingStrategy}
                >
                  <EmptyDropZone isOver={isOverEmpty && overColumn === "right"} column="right" />

                  {rightBlocks.map((block, idx) => (
                    <SortableBlock
                      key={idx}
                      id={`right-block-${idx}`}
                      index={idx}
                      column="right"
                      moveBlock={moveBlock}
                      removeBlock={removeBlock}
                      isOver={overId === `right-block-${idx}`}
                      isOverTop={overId === `right-block-${idx}` && overPosition === "top"}
                      isOverBottom={overId === `right-block-${idx}` && overPosition === "bottom"}
                    >
                      <BlockEditor
                        type={block.type}
                        value={block.value}
                        onChange={(val) => updateBlock("right", idx, val)}
                      />
                    </SortableBlock>
                  ))}
                </SortableContext>

                {rightBlocks.length === 0 && (
                  <div className="text-gray-400 text-center py-10 border-2 border-dashed border-gray-300 rounded">
                    <p className="text-sm">Kéo các mục vào cột phải</p>
                  </div>
                )}
              </div>
            </div>
            {/* Resizable Divider */}
            <ResizableDivider leftWidth={leftWidth} onWidthChange={setLeftWidth} />
          </div>
        </main>

        {/* Right Sidebar - Preview */}
        <div className="w-64 bg-white border-l p-4">
          <h2 className="font-bold mb-4">Bố cục CV</h2>
          <div className="space-y-4">
            {/* Resizable Preview */}
            <ResizablePreview
              leftWidth={leftWidth}
              onWidthChange={setLeftWidth}
              leftBlocks={leftBlocks}
              rightBlocks={rightBlocks}
            />

            {/* Block list */}
            <div>
              <h3 className="text-sm font-medium mb-2">Danh sách block</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leftBlocks.map((block, idx) => (
                  <PreviewBlock key={`left-${idx}`} block={block} column="left" />
                ))}
                {rightBlocks.map((block, idx) => (
                  <PreviewBlock key={`right-${idx}`} block={block} column="right" />
                ))}
                {leftBlocks.length === 0 && rightBlocks.length === 0 && (
                  <div className="text-gray-400 text-center py-4 text-sm">Chưa có block nào</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-white rounded shadow-lg p-4 opacity-90 scale-105">
            {activeId.startsWith("sidebar-") ? (
              <div className="px-3 py-2">
                {BLOCKS.find((b) => `sidebar-${b.type}` === activeId)?.label}
              </div>
            ) : (
              <div className="px-3 py-2">Block</div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
