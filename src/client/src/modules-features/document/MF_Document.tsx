"use client";
import MyToolBar from "@/components/Toolbar/MyToolBar";
import IBlock, { ICV } from "@/interface/cv";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button, Group } from "@mantine/core";
import { IconLayoutGrid } from "@tabler/icons-react";
import React, { useRef, useState } from "react";
import BlockEditor from "./components/BlockEditor";
import EmptyDropZone from "./components/EmptyDropZone";
import ResizablePreview from "./components/ResizablePreview";
import Sidebar from "./components/Sidebar";
import SortableBlock from "./components/SortableBlock";
import { BLOCKS } from "./constants/blocks";

export default function MF_Document() {
  const [leftBlocks, setLeftBlocks] = useState<IBlock[]>([]);
  const [rightBlocks, setRightBlocks] = useState<IBlock[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<"top" | "bottom" | null>(null);
  const [isOverEmpty, setIsOverEmpty] = useState(false);
  const [overColumn, setOverColumn] = useState<"left" | "right" | null>(null);
  const [leftWidth, setLeftWidth] = useState(35);
  const printRef = useRef<HTMLDivElement>(null);

  // Track which blocks are used
  const usedBlocks = [...leftBlocks, ...rightBlocks]
    .map((block) => block.type)
    .filter((type): type is string => type !== undefined);
  const [cvData, setCvData] = useState<ICV>({
    file: {
      fileName: "Chưa đặt tên",
    },
    template: {
      id: 1,
      leftSizeColum: leftWidth,
      rightSizeColum: 100 - leftWidth,
      leftColumn: leftBlocks.map((block, index) => ({
        id: index,
        type: block.type || undefined,
      })),
      rightColumn: rightBlocks.map((block, index) => ({
        id: index,
        type: block.type || undefined,
      })),
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getBlocks = (column: "left" | "right"): IBlock[] => {
    return column === "left" ? leftBlocks : rightBlocks;
  };

  const setBlocks = (column: "left" | "right", blocks: IBlock[]): void => {
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
    setBlocks(column, [...blocks, { type }]);
  };

  const removeBlock = (column: "left" | "right", index: number): void => {
    const blocks = getBlocks(column);
    setBlocks(
      column,
      blocks.filter((_, i) => i !== index)
    );
  };

  const updateBlock = (column: "left" | "right", index: number, value: ICV): void => {
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
    const { active, over } = event;

    if (!over) {
      setOverId(null);
      setOverPosition(null);
      setIsOverEmpty(false);
      setOverColumn(null);
      return;
    }

    const overId = over.id.toString();
    const activeId = active.id.toString();

    // Xử lý khi hover trên empty drop zones
    if (overId === "empty-drop-zone-left" || overId === "empty-drop-zone-right") {
      setIsOverEmpty(true);
      setOverColumn(overId === "empty-drop-zone-left" ? "left" : "right");
      setOverId(null);
      setOverPosition(null);
      return;
    }

    setIsOverEmpty(false);
    setOverColumn(null);

    if (overId.startsWith("left-block-") || overId.startsWith("right-block-")) {
      // Lấy column và index của block đang được hover
      const targetColumn = overId.startsWith("left-block-") ? "left" : "right";
      const targetIndex = parseInt(overId.replace(`${targetColumn}-block-`, ""));

      // Xác định nguồn của block đang kéo (sidebar hoặc column)
      let activeColumn = null;
      if (activeId.startsWith("left-block-")) {
        activeColumn = "left";
      } else if (activeId.startsWith("right-block-")) {
        activeColumn = "right";
      }

      // Chỉ xử lý nếu không phải là block đang kéo
      if (activeId !== overId) {
        setOverId(overId);

        // Nếu đang kéo từ sidebar hoặc từ cột khác
        if (!activeColumn || activeColumn !== targetColumn) {
          setOverPosition("bottom");
        } else {
          // Nếu đang sắp xếp trong cùng một cột, không hiện indicator
          setOverId(null);
          setOverPosition(null);
        }
      } else {
        setOverId(null);
        setOverPosition(null);
      }
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
        const newBlocks = [{ type: blockType }, ...leftBlocks];
        setLeftBlocks(newBlocks);
        return;
      }

      if (overId === "empty-drop-zone-right") {
        const newBlocks = [{ type: blockType }, ...rightBlocks];
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
        newBlocks.splice(insertIndex, 0, { type: blockType });
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

        // Điều chỉnh finalIndex dựa trên vị trí thả
        if (overPosition === "bottom") {
          finalIndex = targetIndex + 1;
        }

        // Quan trọng: Không cần điều chỉnh finalIndex khi di chuyển trong cùng một cột
        // if (activeColumn === targetColumn && activeIndex < finalIndex) {
        //   finalIndex -= 1;
        // }

        // Chỉ di chuyển nếu vị trí thực sự thay đổi
        if (finalIndex !== activeIndex || activeColumn !== targetColumn) {
          // Xử lý đặc biệt khi di chuyển trong cùng một cột
          if (activeColumn === targetColumn) {
            // Khi kéo lên trên (từ dưới lên)
            if (activeIndex > targetIndex) {
              finalIndex = overPosition === "bottom" ? targetIndex + 1 : targetIndex;
            }
            // Khi kéo xuống dưới (từ trên xuống)
            else {
              finalIndex = overPosition === "bottom" ? targetIndex + 1 : targetIndex;
            }
          }

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
      <div className="border-b border-gray-300 ">
        <MyToolBar
          printRef={printRef as React.RefObject<HTMLDivElement>}
          cv={{
            ...cvData,
            template: {
              id: 1,
              leftSizeColum: leftWidth,
              rightSizeColum: 100 - leftWidth,
              leftColumn: leftBlocks.map((block, index) => ({
                id: index,
                type: block.type || undefined,
                ...(block.type === "spacer" && {
                  height: block.height || 20,
                }),
              })),
              rightColumn: rightBlocks.map((block, index) => ({
                id: index,
                type: block.type || undefined,
                ...(block.type === "spacer" && {
                  height: block.height || 20,
                }),
              })),
            },
          }}
        />
      </div>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar onAddBlock={(type) => addBlock(type, "left")} usedBlocks={usedBlocks} />
        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-100 min-h-screen flex flex-col items-center">
          <div
            className="cv-container shadow-2xl"
            style={{
              width: "815px",
              minHeight: "1056px",
              margin: "0 auto",
            }}
          >
            {/* Print */}
            <div
              ref={printRef}
              className="drop-zone-area"
              style={{
                width: "815px",
                minHeight: "1056px",
                maxWidth: "815px",
                boxSizing: "border-box",
                margin: "0",
                fontSize: "14px",
                lineHeight: "1.4",
                display: "flex",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {/* Left Column */}
              <div
                className="cv-left-column bg-white pl-[24px] pr-[10px] pt-[24px] pb-[24px]"
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
                        setLeftBlocks={setLeftBlocks}
                        setRightBlocks={setRightBlocks}
                        type={block.type!}
                        column="leftColumn"
                        blockIndex={idx}
                        value={cvData}
                        setCvData={setCvData}
                        leftBlocks={leftBlocks}
                        rightBlocks={rightBlocks}
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
                className="cv-right-column bg-white px-2 pl-[10px] pr-[24px] pt-[24px] pb-[24px]"
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
                        type={block.type!}
                        column="rightColumn"
                        blockIndex={idx}
                        value={cvData}
                        setCvData={setCvData}
                        setLeftBlocks={setLeftBlocks}
                        setRightBlocks={setRightBlocks}
                        leftBlocks={leftBlocks}
                        rightBlocks={rightBlocks}
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
        </main>

        {/* Right sidebar */}
        <div className="w-64 bg-white border-l border-gray-300 p-4">
          <Group gap={4} align="center" mb={"xs"} justify="space-between">
            <h2 className="font-medium">Bố cục</h2>
            <IconLayoutGrid stroke={2} size={16} color="gray" />
          </Group>
          <div className="space-y-4">
            <ResizablePreview
              leftWidth={leftWidth}
              onWidthChange={setLeftWidth}
              leftBlocks={leftBlocks}
              rightBlocks={rightBlocks}
            />

            {/* <div>
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
            </div> */}
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
