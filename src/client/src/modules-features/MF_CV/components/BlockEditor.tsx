import IBlock, { ICV } from "@/interface/cv";
import { AvatarBlock } from "./Blocks/AvatarBlock";
import { AwardBlock } from "./Blocks/AwardBlock";
import { BusinessCardBlock } from "./Blocks/BusinessCardBlock";
import { CertificateBlock } from "./Blocks/CertificateBlock";
import { DefaultBlock } from "./Blocks/DefaultBlock";
import { EducationBlock } from "./Blocks/EducationBlock";
import { ExperienceBlock } from "./Blocks/ExperienceBlock";
import { OverviewBlock } from "./Blocks/OverviewBlock";
import { PersonalInfoBlock } from "./Blocks/PersonalInfoBlock";
import { ProjectBlock } from "./Blocks/ProjectBlock";
import { SkillBlock } from "./Blocks/SkillBlock";
import { SpacerBlock } from "./Blocks/SpacerBlock";

export interface BlockEditorProps {
  type: string;
  value: ICV;
  blockIndex?: number;
  column?: string;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
  setLeftBlocks?: React.Dispatch<React.SetStateAction<IBlock[]>>;
  setRightBlocks?: React.Dispatch<React.SetStateAction<IBlock[]>>;
  leftBlocks?: IBlock[];
  rightBlocks?: IBlock[];
}

export default function BlockEditor({
  type,
  value,
  setCvData,
  blockIndex,
  column,
  setLeftBlocks,
  setRightBlocks,
  leftBlocks,
  rightBlocks,
}: BlockEditorProps) {
  switch (type) {
    case "education":
      return <EducationBlock value={value} setCvData={setCvData} />;
    case "personalInfo":
      return <PersonalInfoBlock value={value} setCvData={setCvData} />;
    case "businessCard":
      return <BusinessCardBlock value={value} setCvData={setCvData} />;
    case "avatar":
      return <AvatarBlock value={value} setCvData={setCvData} />;
    case "project":
      return <ProjectBlock value={value} setCvData={setCvData} />;
    case "overview":
      return <OverviewBlock value={value} setCvData={setCvData} />;
    case "skills":
      return <SkillBlock value={value} setCvData={setCvData} />;
    case "experience":
      return <ExperienceBlock value={value} setCvData={setCvData} />;
    case "award":
      return <AwardBlock value={value} setCvData={setCvData} />;
    case "certificate":
      return <CertificateBlock value={value} setCvData={setCvData} />;
    case "spacer": {
      return (
        <SpacerBlock
          blockIndex={blockIndex}
          setLeftBlocks={setLeftBlocks}
          setRightBlocks={setRightBlocks}
          column={column}
          height={
            column == "leftColumn" && leftBlocks?.[blockIndex ?? -1]?.height
              ? leftBlocks[blockIndex ?? -1].height
              : column == "rightColumn" && rightBlocks?.[blockIndex ?? -1]?.height
              ? rightBlocks[blockIndex ?? -1].height
              : 20
          }
        />
      );
    }
    default:
      return <DefaultBlock type={type} value={value} setCvData={setCvData} />;
  }
}
