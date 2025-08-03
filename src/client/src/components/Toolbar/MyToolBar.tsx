import { Button, Flex, Group, Input, Text, Tooltip } from "@mantine/core";
import { IconDownload, IconFileCv, IconInputAi, IconPalette, IconWorld } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import MySelectCvTheme from "../Select/MySelectCvTheme";
import { ICV } from "@/interface/cv";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import cvService from "@/api/services/cvService";

export default function MyToolBar({
  printRef,
  cv,
}: {
  printRef?: React.RefObject<HTMLDivElement>;
  cv?: ICV;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);

  const mutate = useMutation({
      mutationFn: async (cv: ICV) => {
        if (!cv.id) throw new Error('CV ID is required');
        return await cvService.updateCV(cv.id, cv);
      },
      onSuccess: () => {
        notifications.show({
          title: "Thành công",
          message: "Cập nhật CV thành công!",
          color: "green",
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: "Lỗi",
          message: "Không thể cập nhật CV. Vui lòng thử lại sau.",
          color: "red",
        });
      },
    });
  
  if (editableRef.current) {
    if (cv && cv.fileName) {
      editableRef.current.innerText = cv.fileName || "Chưa đặt tên";
    }
  }
  // Move useReactToPrint hook to component level
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleSaveCV = () => {
    console.log("Saving CV:", cv);
    if (cv) {
      mutate.mutate(cv);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cv && cv.fileName) {
      const text = e.currentTarget.innerText;
      cv.fileName = text;
    }
  };

  return (
    <Flex
      flex={1}
      direction="row"
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={16}
      py={16}
      px={16}
    >
      <Group gap={4}>
        <IconFileCv color="blue" stroke={1} size={24} />
        <div
          ref={editableRef}
          contentEditable="true"
          onInput={(e) => {
            handleTitleChange(e as React.ChangeEvent<HTMLInputElement>);
          }}
          className="min-w-[100px] max-w-[200px] inline-block px-1 py-[2px] border border-transparent hover:border-gray-300 focus:border-gray-300 rounded overflow-hidden break-words whitespace-nowrap focus:outline-none"
        ></div>
        <IconWorld stroke={1} size={24} />
      </Group>
      <Group gap={4}>
        <MySelectCvTheme />
        <Button leftSection={<IconPalette size={16} />} variant="default">
          Màu sắc
        </Button>
        <Tooltip
          label={
            <Text size="sm">
              Vui lòng chọn 'Lưu dưới dạng PDF' hoặc 'Save as PDF' trong hộp thoại In.
            </Text>
          }
        >
          <Button
            onClick={() => {
              handlePrint();
            }}
            leftSection={<IconDownload size={16} />}
            variant="default"
            loading={isExporting}
            disabled={isExporting}
          >
            {isExporting ? "Đang tải..." : "Tải xuống"}
          </Button>
        </Tooltip>
        <Button leftSection={<IconInputAi size={16} />} variant="default">
          Đánh giá
        </Button>
        <Button color="green" onClick={handleSaveCV}>
          Lưu
        </Button>
      </Group>
    </Flex>
  );
}
