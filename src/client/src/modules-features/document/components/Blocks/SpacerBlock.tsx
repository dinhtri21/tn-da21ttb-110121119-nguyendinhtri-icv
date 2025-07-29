import { ActionIcon } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

interface SpacerBlockProps {
  height?: number;
  onHeightChange?: (height: number) => void;
}

export function SpacerBlock({ height = 20, onHeightChange }: SpacerBlockProps) {
  const handleHeightChange = (delta: number) => {
    const newHeight = Math.max(1, height + delta); // Minimum height of 10px
    onHeightChange?.(newHeight);
  };

  return (
    <div
      style={{
        width: "100%",
        height: height,
        backgroundColor: "transparent",
        position: "relative",
        borderRadius: "4px",
      }}
      className="group hover:border hover:border-gray-300 border border-transparent focus-within:border focus-within:border-gray-300 rounded-md"
    >
      {/* Control buttons container */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ActionIcon
          className=" rounded bg-white hover:bg-gray-100 cursor-pointer border border-gray-200 shadow-sm transition-colors"
          size="sm"
          variant="light"
          color="green"
          onClick={() => handleHeightChange(-1)}
        >
          <IconChevronUp size={16} stroke={2} />
        </ActionIcon>
        <ActionIcon
          className="p-1 rounded bg-white hover:bg-gray-100 cursor-pointer border border-gray-200 shadow-sm transition-colors"
          size="sm"
          variant="light"
          color="green"
          onClick={() => handleHeightChange(1)}
        >
          <IconChevronDown size={16} stroke={2} />
        </ActionIcon>
      </div>

      {/* Height indicator */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-500">
        {height}px
      </div>

      {/* Center line indicator */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100px",
          height: "2px",
          backgroundColor: "#e5e7eb",
          borderRadius: "1px",
          opacity: 0,
        }}
        className="group-hover:opacity-100 transition-opacity duration-200"
      />
    </div>
  );
}
