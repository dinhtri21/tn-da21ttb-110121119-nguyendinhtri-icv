import { Box, Group, useMantineColorScheme } from "@mantine/core";
import { IconLayoutList } from "@tabler/icons-react";
import { BLOCKS } from "../constants/blocks";
import DraggableSidebarItem from "./DraggableSidebarItem";
import { Text } from "@mantine/core";

export interface SidebarProps {
  onAddBlock: (type: string) => void;
  usedBlocks: string[];
}

export default function Sidebar({ onAddBlock, usedBlocks }: SidebarProps) {

  return (
    <Box className="max-w-60 w-full ">
      <Group gap={4} align="center" justify="space-between">
        <Text mb={1} fz={"sm"} fw={500}>
          Thành phần
        </Text>
        <IconLayoutList stroke={2} size={16} color="gray" />
      </Group>
      <p className="text-gray-400 text-xs mb-2">💡 Kéo thả vào vào cv để chỉnh sửa</p>
      <div className="flex flex-col gap-[10px]  ">
        {BLOCKS.map((block) => (
          <DraggableSidebarItem
            key={block.type}
            block={block}
            onAddBlock={onAddBlock}
            isDisabled={usedBlocks.includes(block.type) && block.type !== "spacer"}
          />
        ))}
      </div>
    </Box>
  );
}
