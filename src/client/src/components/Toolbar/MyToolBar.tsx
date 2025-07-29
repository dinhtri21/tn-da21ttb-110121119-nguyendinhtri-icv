import { Button, Flex, Group, Text } from "@mantine/core";
import { IconDownload, IconFileCv, IconInputAi, IconPalette, IconWorld } from "@tabler/icons-react";
import { useState } from "react";
import { useReactToPrint } from "react-to-print";
import MySelectCvTheme from "../Select/MySelectCvTheme";
import { ICV } from "@/interface/cv";

export default function MyToolBar({ printRef, cv }: { printRef?: React.RefObject<HTMLDivElement>; cv?: ICV }) {
  const [isExporting, setIsExporting] = useState(false);

  // Move useReactToPrint hook to component level
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleSaveCV = () => {
    // Logic to save the CV
    console.log("Saving CV:", cv);
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
        <Text>Tên file</Text>
        <IconWorld stroke={1} size={24} />
      </Group>
      <Group gap={4}>
        <MySelectCvTheme />
        <Button leftSection={<IconPalette size={16} />} variant="default">
          Màu sắc
        </Button>
        <Button
          onClick={handlePrint}
          leftSection={<IconDownload size={16} />}
          variant="default"
          loading={isExporting}
          disabled={isExporting}
        >
          {isExporting ? "Đang tải..." : "Tải xuống"}
        </Button>
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
