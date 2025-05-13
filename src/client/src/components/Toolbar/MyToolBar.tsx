import { Button, Container, Flex, Group, Select } from "@mantine/core";
import {
  IconFileCv,
  IconPhoto,
  IconWorld,
  IconDownload,
  IconPalette,
  IconInputAi,
} from "@tabler/icons-react";
import { Text } from "@mantine/core";
import MySelectCvTheme from "../Select/MySelectCvTheme";

export default function MyToolBar() {
  const handleExportPDF = async () => {
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      body: JSON.stringify({
        siteUrl: "http://localhost:3000/document",
        selector: "#print-section",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      alert("Lỗi khi xuất PDF");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-nguyen-van-a.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <Flex flex={1} direction="row" justify="space-between" align="center">
        <Group gap={4}>
          <IconFileCv stroke={1} size={24} />
          <Text>Tên file</Text>
          <IconWorld stroke={1} size={24} />
        </Group>
        <Group gap={4}>
          <MySelectCvTheme />
          <Button leftSection={<IconPalette size={16} />} variant="default">
            Màu sắc
          </Button>
          <Button
            onClick={() => handleExportPDF()}
            leftSection={<IconDownload size={16} />}
            variant="default"
          >
            Tải xuống
          </Button>
          <Button leftSection={<IconInputAi size={16} />} variant="default">
            Đánh giá
          </Button>
        </Group>
      </Flex>
    
  );
}
