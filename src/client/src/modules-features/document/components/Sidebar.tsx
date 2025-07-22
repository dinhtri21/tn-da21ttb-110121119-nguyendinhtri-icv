import { Group } from "@mantine/core";
import { IconLayoutList } from "@tabler/icons-react";
import { BLOCKS } from "../constants/blocks";
import DraggableSidebarItem from "./DraggableSidebarItem";

export interface SidebarProps {
  onAddBlock: (type: string) => void;
}

export default function Sidebar({ onAddBlock }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-300 p-4">
      <Group gap={4} align="center" mb={"xs"} justify="space-between">
        <h2 className="font-medium">Thành phần</h2>
        <IconLayoutList stroke={2} size={16} color="gray" />
      </Group>
      <div className="flex flex-col gap-2">
        {BLOCKS.map((block) => (
          <DraggableSidebarItem key={block.type} block={block} onAddBlock={onAddBlock} />
        ))}
      </div>
    </div>
  );
}
