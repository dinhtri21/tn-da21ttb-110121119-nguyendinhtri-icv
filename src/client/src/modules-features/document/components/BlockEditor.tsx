import { ProfileEditor } from "./editors/ProfileEditor";
import { EducationEditor } from "./editors/EducationEditor";
import { DefaultEditor } from "./editors/DefaultEditor";
import { PersonalInfoEditor } from "./editors/PersonalInfoEditor";
import { BusinessCardEditor } from "./editors/BusinessCardEditor";
import { AvatarEditor } from "./editors/AvatarEditor";
import { SpacerEditor } from "./editors/SpacerEditor";

export interface BlockEditorProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
}

export default function BlockEditor({ type, value, onChange }: BlockEditorProps) {
  switch (type) {
    case "profile":
      return <ProfileEditor value={value} onChange={onChange} />;
    case "education":
      return <EducationEditor value={value} onChange={onChange} />;
    case "personalInfo":
      return <PersonalInfoEditor value={value} onChange={onChange} />;
    case "businessCard":
      return <BusinessCardEditor value={value} onChange={onChange} />;
    case "avatar":
      return <AvatarEditor value={value} onChange={onChange} />;
    case "spacer": {
      let height = 20;
      try {
        const parsed = value ? JSON.parse(value) : null;
        height = parsed?.height ?? 20;
      } catch (e) {
        console.error('Failed to parse spacer height:', e);
      }
      return (
        <SpacerEditor
          height={height}
          onHeightChange={(newHeight) => {
            onChange(JSON.stringify({ height: newHeight }));
          }}
        />
      );
    }
    default:
      return <DefaultEditor type={type} value={value} onChange={onChange} />;
  }
}
