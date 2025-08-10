import IBlock, { ICV } from "@/interface/cv";
import { useEffect, useRef, useState } from "react";
import { BLOCKS } from "../constants/blocks";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  ColorPicker,
  Group,
  Select,
  Stack,
  useMantineColorScheme,
} from "@mantine/core";
import { Text } from "@mantine/core";
import { IconLanguage, IconTransfer, IconWorld } from "@tabler/icons-react";
import cvService from "@/api/services/cvService";
import { notifications } from "@mantine/notifications";

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
  const [targetLanguage, setTargetLanguage] = useState<string>(value?.template?.language || "vi");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTranslate = async () => {
    if (!value?.id) {
      notifications.show({
        title: "Lỗi",
        message: "Không thể dịch CV vì không tìm thấy ID",
        color: "red",
      });
      return;
    }

    try {
      setIsTranslating(true);
      const response = await cvService.translateCV(value.id, targetLanguage);

      if (response.data.isSuccess) {
        // if (response.data.data) {
        //   setCvData(response.data.data);
        // }
        notifications.show({
          title: "Thành công",
          message: "CV đã được dịch thành công!",
          color: "green",
        });
        window.location.reload(); // Reload the page to reflect changes
      } else {
        notifications.show({
          title: "Lỗi",
          message: response.data.message || "Không thể dịch CV. Vui lòng thử lại sau.",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: "Đã xảy ra lỗi khi dịch CV. Vui lòng thử lại sau.",
        color: "red",
      });
      console.error("Lỗi khi dịch CV:", error);
    } finally {
      setIsTranslating(false);
    }
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
        <Text size="xs" c="gray.6" mb={10}>
          Kéo thanh ở giữa để điều chỉnh
        </Text>
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
                className="bg-gray-100 px-2 py-1 relative "
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
                className=" px-2 py-1 relative"
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
         <Text size="xs" c="gray.6" mb={10}>
          Chọn màu để làm chủ đạo cho toàn cv
        </Text>
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

      <Box mt={4}>
        <Text mb={1} fz={"sm"} fw={500} className="flex items-center gap-1">
          Ngôn ngữ
        </Text>
          <Text size="xs" c="gray.6" mb={10}>
            Chọn ngôn ngữ hiển thị cho các thành phần
          </Text>
        <div className="flex gap-2">
          <ActionIcon
            variant={value?.template?.language === "vi" ? "filled" : "light"}
            color="blue"
            size="md"
            onClick={() => {
              setCvData((prev) => ({
                ...prev,
                template: {
                  ...prev?.template,
                  language: "vi",
                },
              }));
            }}
          >
            VI
          </ActionIcon>
          <ActionIcon
            variant={value?.template?.language === "en" ? "filled" : "light"}
            color="blue"
            size="md"
            onClick={() => {
              setCvData((prev) => ({
                ...prev,
                template: {
                  ...prev?.template,
                  language: "en",
                },
              }));
            }}
          >
            EN
          </ActionIcon>
        </div>
      </Box>

      <Box mt={4}>
        <Text mb={1} fz={"sm"} fw={500} className="flex items-center gap-1">
          Dịch nội dung
        </Text>
          <Text size="xs" c="gray.6" mb={10}>
          Dịch nội dung CV sang ngôn ngữ khác
        </Text>
        <div className="flex gap-2 items-end">
          <Select
            // label="Ngôn ngữ đích"
            placeholder="Chọn ngôn ngữ"
            data={[
              { value: "vi", label: "Tiếng Việt" },
              { value: "en", label: "Tiếng Anh" },
            ]}
            value={targetLanguage}
            defaultValue={value?.template?.language}
            onChange={(value) => setTargetLanguage(value || "vi")}
            className="flex-1"
            size="xs"
          />
          <Button
            variant="filled"
            color="blue"
            size="xs"
            onClick={handleTranslate}
            loading={isTranslating}
            // leftSection={<IconTransfer size={16} />}
          >
            Dịch
          </Button>
        </div>
      </Box>
    </Stack>
  );
}
