"use client";
import React, { useState } from "react";
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
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import MyToolBar from "@/components/Toolbar/MyToolBar";
import { Block } from "./interfaces/types";
import { BLOCKS } from "./constants/blocks";
import Sidebar from "./components/Sidebar";
import EmptyDropZone from "./components/EmptyDropZone";
import SortableBlock from "./components/SortableBlock";
import BlockEditor from "./components/BlockEditor";
import ResizablePreview from "./components/ResizablePreview";
import PreviewBlock from "./components/PreviewBlock";
import { IEducation } from "@/interface/education";

export default function MF_Document() {
  const [leftBlocks, setLeftBlocks] = useState<Block[]>([]);
  const [rightBlocks, setRightBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<"top" | "bottom" | null>(null);
  const [isOverEmpty, setIsOverEmpty] = useState(false);
  const [overColumn, setOverColumn] = useState<"left" | "right" | null>(null);
  const [leftWidth, setLeftWidth] = useState(35);

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

  const moveBlock = (
    fromColumn: "left" | "right",
    toColumn: "left" | "right",
    from: number,
    to: number
  ): void => {
    if (fromColumn === toColumn) {
      const blocks = getBlocks(fromColumn);
      const updated = [...blocks];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      setBlocks(fromColumn, updated);
    } else {
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

    if (overId.startsWith("left-block-") || overId.startsWith("right-block-")) {
      setOverId(overId);

      const mouseY = (event.activatorEvent as MouseEvent)?.clientY || 0;
      const element = document.getElementById(overId);

      if (element) {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        setOverPosition(mouseY < elementCenter ? "top" : "bottom");
      } else {
        setOverPosition("bottom");
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

    if (activeId.startsWith("sidebar-")) {
      const blockType = activeId.replace("sidebar-", "");

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
        addBlock(blockType, "left");
      }
      return;
    }

    if (activeId !== overId) {
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

      if (overId === "empty-drop-zone-left") {
        moveBlock(activeColumn, "left", activeIndex, 0);
        return;
      }

      if (overId === "empty-drop-zone-right") {
        moveBlock(activeColumn, "right", activeIndex, 0);
      }

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

        if (overPosition === "top") {
          finalIndex = targetIndex;
        } else {
          finalIndex = targetIndex + 1;
        }

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
        <Sidebar onAddBlock={(type) => addBlock(type, "left")} />

        <main className="flex-1 p-8 bg-amber-50 min-h-screen flex flex-col items-center">
          <MyToolBar />
          <h1 className="text-2xl font-bold mb-6">Trình tạo CV kéo thả</h1>

          <div
            className="cv-container"
            style={{
              width: "794px",
              minHeight: "1123px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <div
              id="print-section"
              className="drop-zone-area bg-white shadow-2xl"
              style={{
                width: "794px",
                minHeight: "1123px",
                maxWidth: "794px",
                // padding: "32px",
                borderRadius: "8px",
                boxSizing: "border-box",
                margin: "0",
                position: "relative",
                fontSize: "14px",
                lineHeight: "1.4",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              <div
                className="cv-content"
                style={{
                  width: "100%",
                  minHeight: "calc(1123px - 64px)",
                  display: "flex",
                  // gap: "16px",
                  position: "relative",
                }}
              >
                <div
                  className="cv-left-column bg-[#F7F7F7] pl-[24px] pr-[15px] pt-[24px] pb-[24px]"
                  style={{
                    width: `${leftWidth}%`,
                    minHeight: "100%",
                    flexShrink: 0,
                  }}
                >
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
                    <div className="text-gray-300 text-center py-10 border-2 border-dashed border-gray-600 rounded">
                      <p className="text-sm">Kéo các mục vào cột trái</p>
                    </div>
                  )}
                </div>

                <div
                  className="cv-right-column bg-white px-2 pl-[15px] pr-[24px] pt-[24px] pb-[24px]"
                  style={{
                    width: `${100 - leftWidth}%`,
                    minHeight: "100%",
                    flexShrink: 0,
                  }}
                >
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
            </div>
          </div>
        </main>

        <div className="w-64 bg-white border-l p-4">
          <h2 className="font-bold mb-4">Bố cục CV</h2>
          <div className="space-y-4">
            <ResizablePreview
              leftWidth={leftWidth}
              onWidthChange={setLeftWidth}
              leftBlocks={leftBlocks}
              rightBlocks={rightBlocks}
            />

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
