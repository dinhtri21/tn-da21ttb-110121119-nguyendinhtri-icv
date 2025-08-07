import IBlock, { ICV } from "@/interface/cv";
import { useEffect, useRef, useState } from "react";
import { BLOCKS } from "../constants/blocks";
import { Box, Center, ColorPicker, Group, Stack, useMantineColorScheme } from "@mantine/core";
import { Text } from "@mantine/core";

export interface ResizablePreviewProps {
  leftWidth: number;
  onWidthChange: (width: number) => void;
  leftBlocks: IBlock[];
  rightBlocks: IBlock[];
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export default function ResizablePreview({
  leftWidth,
  onWidthChange,
  leftBlocks,
  rightBlocks,
  value,
  setCvData,
}: ResizablePreviewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { colorScheme, setColorScheme } = useMantineColorScheme();

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
      const clampedWidth = Math.max(30, Math.min(70, newWidth));
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
    <Stack
    //  className="min-w-[370px]"
    >
      <Box className="rounded">
        <Text mb={1} fz={"sm"} fw={500}>
          Tuỳ chỉnh tỉ lệ
        </Text>
        <p className="text-gray-400 text-xs mb-2">💡 Kéo thanh ở giữa để điều chỉnh</p>
        <Center>
          <div
            ref={containerRef}
            className="relative border border-blue-300 rounded overflow-hidden w-full "
          >
            {/* Resizable preview */}
            <div className="flex gap-0 relative  rounded min-h-full">
              {/* Left column */}
              <Box
                bg={colorScheme == "dark" ? "rgba(54, 75, 93, 0.5)" : "#E4F1FC"}
                className="bg-gray-100 p-2 relative "
                style={{ width: `${leftWidth}%` }}
              >
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 flex justify-center">
                    <Text c={colorScheme == "dark" ? "gray.3" : "blue.9"} fz="xs">
                      {Math.round(leftWidth)}%
                    </Text>
                  </div>
                  {/* {leftBlocks.map((block, idx) => (
                  <Box
                    c={colorScheme == "dark" ? "gray.3" : "gray.9"}
                    bg={colorScheme == "dark" ? "dark.3" : "gray.2"}
                    key={idx}
                    className="text-xs rounded px-2 py-2 truncate"
                  >
                    {BLOCKS.find((b) => b.type === block.type)?.label}
                  </Box>
                ))} */}
                </div>
              </Box>

              {/* Resizable divider */}
              <div
                className={`absolute top-0 bottom-0 w-[2px] h-full bg-blue-300 hover:bg-blue-500 cursor-col-resize transition-colors z-10 ${
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

              {/* Right column */}
              <Box
                bg={colorScheme == "dark" ? "rgba(54, 75, 93, 0.5)" : "#E4F1FC"}
                className=" p-2 relative"
                style={{ width: `${100 - leftWidth}%` }}
              >
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 flex justify-center">
                    <Text fz="xs" c={colorScheme == "dark" ? "gray.3" : "blue.9"}>
                      {Math.round(100 - leftWidth)}%
                    </Text>
                  </div>
                  {/* {rightBlocks.map((block, idx) => (
                  <Box
                    bg={colorScheme == "dark" ? "dark.3" : "gray.2"}
                    c={colorScheme == "dark" ? "gray.3" : "gray.9"}
                    key={idx}
                    className="text-xs rounded px-2 py-2 truncate"
                  >
                    {BLOCKS.find((b) => b.type === block.type)?.label}
                  </Box>
                ))} */}
                </div>
              </Box>
            </div>
          </div>
        </Center>
      </Box>
      <Box>
        <Text mb={1} fz={"sm"} fw={500}>
          Màu chủ đạo
        </Text>
        <p className="text-gray-400 text-xs mb-2">💡 Chọn màu để làm chủ đạo cho toàn cv</p>
        <Center>
          <ColorPicker
            size="sm"
            format="hex"
            swatches={[
              "#2e2e2e",
              "#868e96",
              "#fa5252",
              "#e64980",
              "#be4bdb",
              "#7950f2",
              "#4c6ef5",
              "#228be6",
              "#15aabf",
              "#12b886",
              "#40c057",
              "#82c91e",
              "#fab005",
              "#fd7e14",
            ]}
            value={value?.template?.color || "#608ABE"}
            onChange={(color) => {
              setCvData((prev) => ({
                ...prev,
                template: {
                  ...prev.template,
                  color: color,
                },
                
              }));
            }}
          />
        </Center>
      </Box>
    </Stack>
  );
}
