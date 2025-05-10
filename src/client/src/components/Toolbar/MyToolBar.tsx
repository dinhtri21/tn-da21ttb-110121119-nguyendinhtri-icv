import { Button, Flex, Group, Select } from "@mantine/core";
import {
  IconFileCv,
  IconPhoto,
  IconWorld,
  IconDownload,
  IconPalette,
  IconInputAi
} from "@tabler/icons-react";
import { Text } from "@mantine/core";
import MySelectCvTheme from "../Select/MySelectCvTheme";

export default function MyToolBar() {
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
        <Button leftSection={<IconDownload size={16} />} variant="default">
          Tải xuống
        </Button>
        <Button leftSection={<IconInputAi size={16} />} variant="default">
          Đánh giá
        </Button>
      </Group>
    </Flex>
  );
}
