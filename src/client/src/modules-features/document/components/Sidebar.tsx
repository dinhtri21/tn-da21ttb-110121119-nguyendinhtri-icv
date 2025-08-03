import { Group } from "@mantine/core";
import { IconLayoutList } from "@tabler/icons-react";
import { BLOCKS } from "../constants/blocks";
import DraggableSidebarItem from "./DraggableSidebarItem";

export interface SidebarProps {
  onAddBlock: (type: string) => void;
  usedBlocks: string[];
}

export default function Sidebar({ onAddBlock, usedBlocks }: SidebarProps) {
  return (
    <div className="max-w-60 w-full bg-white ">
      <Group gap={4} align="center" mb="" justify="space-between">
        <h2 className="font-medium">Thành phần</h2>
        <IconLayoutList stroke={2} size={16} color="gray" />
      </Group>
      <p className="text-gray-400 text-xs mb-2">💡 Kéo thả vào vào cv để chỉnh sửa</p>
      <div className="flex flex-col gap-2">
        {BLOCKS.map((block) => (
          <DraggableSidebarItem
            key={block.type}
            block={block}
            onAddBlock={onAddBlock}
            isDisabled={usedBlocks.includes(block.type) && block.type !== "spacer"}
          />
        ))}
      </div>
    </div>
  );
}
