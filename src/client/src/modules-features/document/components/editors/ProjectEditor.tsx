import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { IProject } from "@/interface/project";
import { useState } from "react";
import { BLOCKS } from "../../constants/blocks";

interface EducationEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProjectEditor({ value, onChange }: EducationEditorProps) {
  const [project, setProject] = useState<IProject>({
    client: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    position: "",
    responsibilities: "",
    technologies: "",
    link: "",
  });

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-1 font-medium text-[18px] text-gray-700">
        {BLOCKS.find((b) => b.type === "project")?.label}
      </label>
      <div className="w-full h-[2px] mb-1 bg-blue-200"></div>
      <div className="space-y-1">
        <div className="flex justify-between items-center gap-1">
          {/* Tên dự án */}
          <div className="flex-1 text-gray-600">
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              placeholder="Tên dự án"
              className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
          </div>

          {/* Thời gian */}
          <div className="flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
            <input
              value={project.startDate}
              onChange={(e) => setProject({ ...project, startDate: e.target.value })}
              placeholder="2020"
              type="text"
              className="cv-input max-w-[32px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
            <span>-</span>
            <input
              value={project.endDate}
              onChange={(e) => setProject({ ...project, endDate: e.target.value })}
              placeholder="2024"
              type="text"
              className="cv-input max-w-[32px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
          </div>
        </div>

        {/* Mô tả */}
        <div>
          {/* <LexicalEditor /> */}
          <TiptapEditor />
          {/* <input
            value={project.position}
            onChange={(e) => setProject({ ...project, position: e.target.value })}
            type="text"
            placeholder="Ngành học"
            className="cv-input text-gray-600 w-full border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
          /> */}
        </div>
      </div>
    </div>
  );
}
