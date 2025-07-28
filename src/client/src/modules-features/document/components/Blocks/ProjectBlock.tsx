import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { IProject } from "@/interface/project";
import { useState } from "react";
import { BLOCKS } from "../../constants/blocks";

interface EducationBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProjectBlock({ value, onChange }: EducationBlockProps) {
  const [project, setProject] = useState<IProject[]>([
    {
      client: "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      position: "",
      responsibilities: "",
      technologies: "",
      link: "",
    },
    {
      client: "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      position: "",
      responsibilities: "",
      technologies: "",
      link: "",
    },
  ]);

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-1 font-medium text-[18px] text-[#404041]">
        {BLOCKS.find((b) => b.type === "project")?.label}
      </label>
      <div className="w-full h-[2px] mb-1 bg-blue-200"></div>
      <div className="space-y-1">
        {project &&
          project?.length > 0 &&
          project?.map((proj, index) => (
            <div key={index}>
              {/* Dự án và thời gian */}
              <div className="flex justify-between items-center gap-1">
                {/* Tên dự án */}
                <div className="flex-1 text-gray-700">
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) =>
                      setProject(
                        project.map((p, i) => (i === index ? { ...p, name: e.target.value } : p))
                      )
                    }
                    placeholder="Tên dự án"
                    style={{
                      color: "#404041",
                    }}
                    className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                  />
                </div>

                {/* Thời gian */}
                <div className="flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
                  <input
                    value={proj.startDate}
                    onChange={(e) =>
                      setProject(
                        project.map((p, i) =>
                          i === index ? { ...p, startDate: e.target.value } : p
                        )
                      )
                    }
                    placeholder="2020"
                    type="text"
                    style={{
                      color: "#737373",
                    }}
                    maxLength={4}
                    className="cv-input max-w-[32px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                  />
                  <span>-</span>
                  <input
                    value={proj.endDate}
                    onChange={(e) =>
                      setProject(
                        project.map((p, i) => (i === index ? { ...p, endDate: e.target.value } : p))
                      )
                    }
                    placeholder="2024"
                    type="text"
                    maxLength={4}
                    style={{
                      color: "#737373",
                    }}
                    className="cv-input max-w-[32px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <TiptapEditor
                  placeholder="Mô tả về dự án"
                  content="<p><strong>Vị trí:</strong> Developer.</p><p><strong>Trách nhiệm</strong>: Full-stack developer.</p><p><strong>Công nghệ sử dụng: </strong></p><p>   - Frontend: ReactJS. </p><p>   - Backend: NodeJS, MySQL.</p><p>   - Kiến trúc: N-layer</p><p><strong>Github: </strong>https://.... 2</p>"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
