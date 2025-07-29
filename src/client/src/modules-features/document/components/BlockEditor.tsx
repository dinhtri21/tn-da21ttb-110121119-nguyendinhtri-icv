import { AvatarBlock } from "./Blocks/AvatarBlock";
import { BusinessCardBlock } from "./Blocks/BusinessCardBlock";
import { DefaultBlock } from "./Blocks/DefaultBlock";
import { EducationBlock } from "./Blocks/EducationBlock";
import { ExperienceBlock } from "./Blocks/ExperienceBlock";
import { OverviewBlock } from "./Blocks/OverviewBlock";
import { PersonalInfoBlock } from "./Blocks/PersonalInfoBlock";
import { ProfileBlock } from "./Blocks/ProfileBlock";
import { ProjectBlock } from "./Blocks/ProjectBlock";
import { SkillBlock } from "./Blocks/SkillBlock";
import { SpacerBlock } from "./Blocks/SpacerBlock";

export interface BlockEditorProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
}

export default function BlockEditor({ type, value, onChange }: BlockEditorProps) {
  switch (type) {
    case "profile":
      return <ProfileBlock value={value} onChange={onChange} />;
    case "education":
      return <EducationBlock value={value} onChange={onChange} />;
    case "personalInfo":
      return <PersonalInfoBlock value={value} onChange={onChange} />;
    case "businessCard":
      return <BusinessCardBlock value={value} onChange={onChange} />;
    case "avatar":
      return <AvatarBlock value={value} onChange={onChange} />;
    case "project":
      return <ProjectBlock value={value} onChange={onChange} />;
    case "overview":
      return <OverviewBlock value={value} onChange={onChange} />;
    case "skills":
      return <SkillBlock value={value} onChange={onChange} />;
    case "experience":
      return <ExperienceBlock value={value} onChange={onChange} />;
    case "spacer": {
      let height = 20;
      try {
        const parsed = value ? JSON.parse(value) : null;
        height = parsed?.height ?? 20;
      } catch (e) {
        console.error('Failed to parse spacer height:', e);
      }
      return (
        <SpacerBlock
          height={height}
          onHeightChange={(newHeight) => {
            onChange(JSON.stringify({ height: newHeight }));
          }}
        />
      );
    }
    default:
      return <DefaultBlock type={type} value={value} onChange={onChange} />;
  }
}
