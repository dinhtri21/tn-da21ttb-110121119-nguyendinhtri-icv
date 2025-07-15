import { ProfileEditor } from "./editors/ProfileEditor";
import { EducationEditor } from "./editors/EducationEditor";
import { DefaultEditor } from "./editors/DefaultEditor";

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
    default:
      return <DefaultEditor type={type} value={value} onChange={onChange} />;
  }
}
