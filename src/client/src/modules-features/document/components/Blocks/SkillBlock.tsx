import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { IProject } from "@/interface/project";
import { useState } from "react";
import { BLOCKS } from "../../constants/blocks";
import { ISkills } from "@/interface/skills";

interface OverviewBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function SkillBlock({ value, onChange }: OverviewBlockProps) {
  const [project, setProject] = useState<ISkills>({
    id: "",
    documentId: "",
    description: "",
  });

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-1 font-medium text-[18px] text-[#404041]">
        {BLOCKS.find((b) => b.type === "skills")?.label}
      </label>
      <div className="w-full h-[2px] mb-1 bg-[#608ABE]"></div>
      <TiptapEditor
        placeholder="Giới thiệu chung mục tiêu nghề nghiệp..."
        content="<p><strong>Ngôn ngữ</strong></p><p>HTML, CSS, JavaScript, TypeScript, C#, SQL, NoSQL (MongoDB). <strong>Frontend</strong> </p><p>ReactJS, Next.js, React-Native. </p><p><strong>Backend</strong></p><p>.Net, NodeJS (ExpressJS), RESTful API, N-layer, Clean Architecture SQL Server, MySQL</p><p><strong>Công cụ</strong></p><p>Visual Studio, VS Code, GIT, Fork, Postman, Figma. </p><p><strong>Khác</strong></p><p>Mantine UI, Shadcn UI, Tailwind CSS.</p>"
        onChange={(content) => {
          setProject({ ...project, description: content });
        }}
      />
    </div>
  );
}
