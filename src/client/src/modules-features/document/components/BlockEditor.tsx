import { ICV } from "@/interface/cv";
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
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export default function BlockEditor({ type, value, setCvData }: BlockEditorProps) {
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
      let height = 20;
      try {
        const parsed =
          value.template?.leftColumn?.find((block) => block.type === "spacer")?.height ||
          value.template?.rightColumn?.find((block) => block.type === "spacer")?.height;
        height = parsed ?? 20;
      } catch (e) {
        console.error("Failed to parse spacer height:", e);
      }
      return (
        <SpacerBlock
          height={height}
          onHeightChange={(newHeight) => {
            setCvData((prevData) => ({
              ...prevData,
              template: {
                ...prevData.template,
                leftColumn: prevData.template?.leftColumn?.map((block) =>
                  block.type === "spacer" ? { ...block, height: newHeight } : block
                ),
                rightColumn: prevData.template?.rightColumn?.map((block) =>
                  block.type === "spacer" ? { ...block, height: newHeight } : block
                ),
              },
            }));
          }}
        />
      );
    }
    default:
      return <DefaultBlock type={type} value={value} setCvData={setCvData} />;
  }
}
