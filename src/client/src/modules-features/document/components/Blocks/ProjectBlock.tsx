import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { IProject } from "@/interface/project";
import { useState } from "react";
import { BLOCKS } from "../../constants/blocks";
import { ActionIcon } from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

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

  // Xác định xem có cần hiển thị timeline hay không (khi có từ 2 project trở lên)
  const showTimeline = project.length >= 1;

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <div className="flex justify-between items-center mb-1">
        <label className="block font-medium text-[18px] text-[#404041]">
          {BLOCKS.find((b) => b.type === "project")?.label}
        </label>
        <ActionIcon
          size="sm"
          className="opacity-0 group-hover:opacity-100"
          variant="light"
          color="green"
          onClick={() =>
            setProject([
              ...project,
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
            ])
          }
        >
          <IconPlus stroke={1.5} />
        </ActionIcon>
      </div>
      <div className="w-full h-[2px] mb-1 bg-[#608ABE]"></div>
      <div className="space-y-2 relative">
        {/* Timeline vertical line - chỉ hiển thị khi có từ 2 project trở lên */}
        {showTimeline && (
          <div
            className="absolute left-[10px] top-[10px] bottom-0 w-[1.2px] bg-[#A6C2E4]"
            style={{
              height: "calc(100% - 10px)",
            }}
          ></div>
        )}

        {project &&
          project?.length > 0 &&
          project?.map((proj, index) => (
            <div key={index} className={`${showTimeline ? "pl-6" : ""} relative`}>
              {/* Timeline bullet - chỉ hiển thị khi có từ 2 project trở lên */}
              {showTimeline && (
                <div className="absolute left-[6px] top-[10px] w-[9.2px] h-[9.2px] rounded-full bg-white border-2 border-[#608ABE]"></div>
              )}

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
                <div className="flex items-center gap-1">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => setProject(project.filter((_, i) => i !== index))}
                  >
                    <IconMinus stroke={1.5} />
                  </ActionIcon>
                  <div className="flex items-center gap-1 whitespace-nowrap bg-[#F0F0F0] px-[6px] rounded-md text-gray-500">
                    <input
                      value={proj.startDate}
                      onChange={(e) =>
                        setProject(
                          project.map((p, i) =>
                            i === index ? { ...p, startDate: e.target.value } : p
                          )
                        )
                      }
                      placeholder="21/01/2024"
                      type="text"
                      style={{
                        color: "#a5a5a5",
                        height: "20px",
                      }}
                      maxLength={10}
                      className="cv-input max-w-[73px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                    />
                    <div className="h-[20px] flex items-center">
                      <span className="text-[#a5a5a5]">-</span>
                    </div>
                    <input
                      value={proj.endDate}
                      onChange={(e) =>
                        setProject(
                          project.map((p, i) =>
                            i === index ? { ...p, endDate: e.target.value } : p
                          )
                        )
                      }
                      placeholder="21/01/2024"
                      type="text"
                      maxLength={10}
                      style={{
                        color: "#a5a5a5",
                        height: "20px",
                      }}
                      className="cv-input max-w-[73px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                    />
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <TiptapEditor
                  placeholder="Mô tả về dự án"
                  content="<p>Phát triển một ứng dụng web thương mại điện tử để bán giày.</p><p><strong>Vị trí:</strong> Developer.</p><p><strong>Trách nhiệm</strong>: Full-stack developer.</p><p><strong>Công nghệ sử dụng:</strong></p><p>- Frontend: ReactJS.</p><p>- Backend: NodeJS, MySQL.</p><p>- Kiến trúc: N-layer</p><p><strong>Github: </strong>https://.......</p>"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
