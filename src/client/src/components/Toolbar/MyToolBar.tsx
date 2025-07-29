import { Button, Flex, Group, Text } from "@mantine/core";
import {
  IconDownload,
  IconFileCv,
  IconInputAi,
  IconPalette,
  IconWorld
} from "@tabler/icons-react";
import { useState } from "react";
import { useReactToPrint } from "react-to-print";
import MySelectCvTheme from "../Select/MySelectCvTheme";

export default function MyToolBar({ printRef }: { printRef: React.RefObject<HTMLDivElement> }) {
  const [isExporting, setIsExporting] = useState(false);

  // Move useReactToPrint hook to component level
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  // const handleExportPDF = async () => {
  //   const element = document.getElementById("print-section");

  //   if (!element) {
  //     alert("Không tìm thấy phần tử để xuất PDF");
  //     return;
  //   }

  //   setIsExporting(true);

  //   try {
  //     // Đợi cho tất cả styles được load và áp dụng
  //     const styles = await extractAllStyles();
  //     const content = element.outerHTML;

  //     const res = await fetch("/api/export-pdf", {
  //       method: "POST",
  //       body: JSON.stringify({ content, styles }),
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData.error || "Lỗi khi xuất PDF");
  //     }

  //     const blob = await res.blob();
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `cv-nguyen-van-a-${Date.now()}.pdf`;
  //     a.click();
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Export error:", error);
  //     alert(`Lỗi khi xuất PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

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
      </Group>
    </Flex>
  );
}
