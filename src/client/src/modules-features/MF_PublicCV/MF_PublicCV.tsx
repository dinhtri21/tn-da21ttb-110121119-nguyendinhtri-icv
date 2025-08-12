"use client";
import IBlock, { ICV } from "@/interface/cv";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Text,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { AvatarBlock } from "../MF_CV/components/Blocks/AvatarBlock";
import { AwardBlock } from "../MF_CV/components/Blocks/AwardBlock";
import { BusinessCardBlock } from "../MF_CV/components/Blocks/BusinessCardBlock";
import { CertificateBlock } from "../MF_CV/components/Blocks/CertificateBlock";
import { DefaultBlock } from "../MF_CV/components/Blocks/DefaultBlock";
import { EducationBlock } from "../MF_CV/components/Blocks/EducationBlock";
import { ExperienceBlock } from "../MF_CV/components/Blocks/ExperienceBlock";
import { OverviewBlock } from "../MF_CV/components/Blocks/OverviewBlock";
import { PersonalInfoBlock } from "../MF_CV/components/Blocks/PersonalInfoBlock";
import { ProjectBlock } from "../MF_CV/components/Blocks/ProjectBlock";
import { SkillBlock } from "../MF_CV/components/Blocks/SkillBlock";
import { IconDownload } from "@tabler/icons-react";
import { useReactToPrint } from "react-to-print";
import "./publicCV.css"; // Import the CSS

// Component to render blocks with proper component from MF_CV
const RenderBlock = ({
  type,
  data,
  language,
  color,
  blockIndex,
}: {
  type?: string;
  data: ICV;
  language: string;
  color: string;
  blockIndex: number;
}) => {
  // Create a mocked setCvData function that does nothing
  const noop = () => {};
  const readOnlyCvData = { ...data };

  if (!type) return null;

  // Wrap the block component with read-only styles
  const blockContent = () => {
    switch (type) {
      case "overview":
        return <OverviewBlock value={readOnlyCvData} setCvData={noop} />;
      case "avatar":
        return <AvatarBlock value={readOnlyCvData} setCvData={noop} />;
      case "businessCard":
        return <BusinessCardBlock value={readOnlyCvData} setCvData={noop} />;
      case "personalInfo":
        return <PersonalInfoBlock value={readOnlyCvData} setCvData={noop} />;
      case "education":
        return <EducationBlock value={readOnlyCvData} setCvData={noop} />;
      case "experience":
        return <ExperienceBlock value={readOnlyCvData} setCvData={noop} />;
      case "skills":
        return <SkillBlock value={readOnlyCvData} setCvData={noop} />;
      case "project":
        return <ProjectBlock value={readOnlyCvData} setCvData={noop} />;
      case "certificate":
        return <CertificateBlock value={readOnlyCvData} setCvData={noop} />;
      case "award":
        return <AwardBlock value={readOnlyCvData} setCvData={noop} />;
      case "spacer":
        // For spacer blocks, we just need a simple div with the correct height
        // Since it's a read-only view, we don't need the interactive controls
        const block = data.template?.leftColumn?.find((b, idx) => b.type === "spacer" && idx === blockIndex) || 
                     data.template?.rightColumn?.find((b, idx) => b.type === "spacer" && idx === blockIndex);
        const height = block?.height || 20;
        return <div style={{ height: `${height}px` }}></div>;
      default:
        return <DefaultBlock type={type} value={readOnlyCvData} setCvData={noop} />;
    }
  };

  return <div className="read-only-mode mb-1">{blockContent()}</div>;
};

interface IProps {
  data: ICV;
}

export default function MF_PublicCV({ data }: IProps) {
  const [leftBlocks, setLeftBlocks] = useState<IBlock[]>([]);
  const [rightBlocks, setRightBlocks] = useState<IBlock[]>([]);
  const [leftWidth, setLeftWidth] = useState(35);
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { colorScheme } = useMantineColorScheme();

  // Initialize React-to-print
  const handlePrint = useReactToPrint({
    documentTitle: `${data?.personalInfo?.fullName || ""} CV`,
    contentRef: printRef,
  });
  //  const handlePrint = useReactToPrint({
  //     contentRef: printRef,
  //   });

  // Update blocks when data changes
  useEffect(() => {
    setLeftBlocks(data?.template?.leftColumn || []);
    setRightBlocks(data?.template?.rightColumn || []);
    setLeftWidth(data?.template?.leftSizeColum || 35);
  }, [data]);

  // Add CSS to make all inputs and textareas read-only
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .read-only-mode input, 
      .read-only-mode textarea, 
      .read-only-mode [contenteditable="true"] {
        pointer-events: none;
        border: none !important;
        background-color: transparent !important;
        resize: none !important;
        cursor: default !important;
      }
      .read-only-mode .hover\\:border,
      .read-only-mode .hover\\:border-gray-300 {
        border-color: transparent !important;
      }
      .read-only-mode button,
      .read-only-mode .mantine-ActionIcon-root {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // If there's no data or CV is not public, show an error message
  if (!data || data.status !== "public") {
    return (
      <Center h="100vh" w="100%">
        <Text size="xl" fw={600} c="red">
          CV này không tồn tại hoặc không được công khai
        </Text>
      </Center>
    );
  }

  return (
    <Box
      bg={colorScheme === "dark" ? "dark.6" : "gray.1"}
      className="flex-1 py-8 min-h-screen flex flex-col items-center relative"
    >
      {/* Download button positioned at the left corner */}
      <div className="fixed left-8 top-8">
        <Tooltip
          label={
            <Text size="xs">
              Vui lòng chọn &apos;Lưu dưới dạng PDF&apos; hoặc &apos;Save as PDF&apos; trong hộp thoại In.
            </Text>
          }
        >
          <Button
            onClick={handlePrint}
            leftSection={<IconDownload size={16} />}
            color="green"
            loading={isExporting}
            disabled={isExporting}
            size="xs"
          >
            {isExporting ? "Đang tải..." : "Tải xuống CV"}
          </Button>
        </Tooltip>
      </div>

      <div
        className="cv-container shadow-2xl"
        style={{
          width: "815px",
          minHeight: "1056px",
          margin: "0 auto",
          transform: "scale(0.9)",
          transformOrigin: "top",
        }}
      >
        {/* CV Content */}
        <div
          ref={printRef}
          style={{
            width: "815px",
            minHeight: "1056px",
            maxWidth: "815px",
            boxSizing: "border-box",
            margin: "0",
            fontSize: "14px",
            lineHeight: "1.4",
            display: "flex",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {/* Left Column */}
          <div
            className="cv-left-column bg-white pl-[24px] pr-[10px] pt-[24px] pb-[24px]"
            style={{
              width: `${leftWidth}%`,
              minHeight: "100%",
              flexShrink: 0,
            }}
          >
            {leftBlocks.map((block, idx) => (
              <RenderBlock
                key={`left-block-${idx}`}
                blockIndex={idx}
                type={block.type}
                data={data}
                language={data?.template?.language || "vi"}
                color={data?.template?.color || "#608ABE"}
              />
            ))}
          </div>

          {/* Right Column */}
          <div
            className="cv-right-column bg-white px-2 pl-[10px] pr-[24px] pt-[24px] pb-[24px]"
            style={{
              width: `${100 - leftWidth}%`,
              minHeight: "100%",
              flexShrink: 0,
            }}
          >
            {rightBlocks.map((block, idx) => (
              <RenderBlock
                key={`right-block-${idx}`}
                blockIndex={idx}
                type={block.type}
                data={data}
                language={data?.template?.language || "vi"}
                color={data?.template?.color || "#608ABE"}
              />
            ))}
          </div>
        </div>
      </div>
    </Box>
  );
}
