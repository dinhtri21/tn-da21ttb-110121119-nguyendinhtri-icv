"use client";
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
import {
  ActionIcon,
  Box,
  Input,
  Stack,
  Tabs,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconComponents,
  IconFileCv,
  IconMessage2Star,
  IconMoon,
  IconSettings,
  IconSun,
  IconWorld,
} from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import BlockEditor from "./components/BlockEditor";
import EmptyDropZone from "./components/EmptyDropZone";
import EvaluationTab from "./components/EvaluationTab";
import MyMenu from "./components/MyMenu";
import ResizablePreview from "./components/ResizablePreview";
import Sidebar from "./components/Sidebar";
import SortableBlock from "./components/SortableBlock";
import { BLOCKS } from "./constants/blocks";
import { getBlockLabel } from "./constants/blocksMultiLang";

interface IProps {
  data: ICV;
}

export default function MF_Document({ data }: IProps) {
  const [leftBlocks, setLeftBlocks] = useState<IBlock[]>([]);
  const [rightBlocks, setRightBlocks] = useState<IBlock[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<"top" | "bottom" | null>(null);
  const [isOverEmpty, setIsOverEmpty] = useState(false);
  const [overColumn, setOverColumn] = useState<"left" | "right" | null>(null);
  const [leftWidth, setLeftWidth] = useState(35);
  const printRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  // Track which blocks are used
  const usedBlocks = [...leftBlocks, ...rightBlocks]
    .map((block) => block.type)
    .filter((type): type is string => type !== undefined);

  // Initialize cvData with default values
  const [cvData, setCvData] = useState<ICV>();

  if (editableRef.current) {
    if (cvData && cvData.fileName) {
      editableRef.current.innerText = cvData.fileName || "Chưa đặt tên";
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cvData && cvData.fileName) {
      const text = e.currentTarget.innerText;
    }
  };

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

  useEffect(() => {
    setCvData(data);
    setLeftBlocks(data?.template?.leftColumn || []);
    setRightBlocks(data?.template?.rightColumn || []);
    setLeftWidth(data?.template?.leftSizeColum || 35);
  }, [data]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="border-b border-gray-300 "></div>
      <Box className="flex min-h-screen bg-gray-50">
        {/* Left Sidebar */}

        <Stack
          bg={colorScheme === "dark" ? "dark.5" : "white"}
          gap={4}
          className="border-r border-gray-300  p-4"
        >
          <div className="flex items-center justify-between mb-2 gap-1">
            <Input
              value={cvData?.fileName || ""}
              onChange={(e) =>
                setCvData((prev) => ({
                  ...prev,
                  fileName: e.target.value,
                }))
              }
              size="sm"
              placeholder="Chưa đặt tên"
            />
            <ActionIcon
              onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === "light" ? (
                <IconSun stroke={1.5} />
              ) : (
                <IconMoon stroke={1.5} />
              )}
            </ActionIcon>
          </div>
          <Sidebar 
            onAddBlock={(type) => addBlock(type, "left")} 
            usedBlocks={usedBlocks} 
            language={cvData?.template?.language || 'vi'}
          />
        </Stack>
        {/* Main content */}
        <Box
          bg={colorScheme === "dark" ? "dark.6" : "gray.1"}
          className="flex-1 p-4  min-h-screen flex flex-col items-center"
        >
          <div
            className="cv-container shadow-2xl"
            style={{
              width: "815px",
              minHeight: "1056px",
              margin: "0 auto",
              transform: "scale(0.9)",
              transformOrigin: "top",
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
                        value={cvData!}
                        setCvData={setCvData as React.Dispatch<React.SetStateAction<ICV>>}
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
                      {cvData && (
                        <BlockEditor
                          type={block.type!}
                          column="rightColumn"
                          blockIndex={idx}
                          value={cvData}
                          setCvData={setCvData as React.Dispatch<React.SetStateAction<ICV>>}
                          setLeftBlocks={setLeftBlocks}
                          setRightBlocks={setRightBlocks}
                          leftBlocks={leftBlocks}
                          rightBlocks={rightBlocks}
                        />
                      )}
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
        </Box>

        {/* Right sidebar */}
        <Box
          bg={colorScheme === "dark" ? "dark.5" : "white"}
          className={`w-100 border-l border-gray-300 p-4`}
        >
          <MyMenu
            printRef={printRef as React.RefObject<HTMLDivElement>}
            cv={{
              ...cvData,
              template: {
                ...cvData?.template,
                leftSizeColum: Math.round(leftWidth),
                rightSizeColum: 100 - Math.round(leftWidth),
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

          <Tabs defaultValue="bocuc" mt={8}>
            <Tabs.List>
              <Tabs.Tab value="bocuc" leftSection={<IconComponents size={12} />}>
                Tuỳ chỉnh
              </Tabs.Tab>
              <Tabs.Tab value="danhgia" leftSection={<IconMessage2Star size={12} />}>
                Đánh giá
              </Tabs.Tab>
              <Tabs.Tab value="settings" leftSection={<IconSettings size={12} />}>
                Settings
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="bocuc" mt={10}>
              <ResizablePreview
                leftWidth={leftWidth}
                onWidthChange={setLeftWidth}
                leftBlocks={leftBlocks}
                rightBlocks={rightBlocks}
                value={cvData!}
                setCvData={setCvData as React.Dispatch<React.SetStateAction<ICV>>}
              />
            </Tabs.Panel>
            <Tabs.Panel value="danhgia" mt={10}>
              <EvaluationTab id={cvData?.id!} />
            </Tabs.Panel>
            <Tabs.Panel value="settings" mt={10}>
              Settings tab content
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Box>

      <DragOverlay>
        {activeId ? (
          <div className="bg-white rounded shadow-lg p-4 opacity-90 scale-105">
            {activeId.startsWith("sidebar-") ? (
              <div className="px-3 py-2">
                {getBlockLabel(activeId.replace("sidebar-", ""), cvData?.template?.language || "vi")}
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
