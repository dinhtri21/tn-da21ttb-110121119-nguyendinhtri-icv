import { IEducation } from "@/interface/education";
import { BLOCKS } from "../../constants/blocks";
import { useState } from "react";
import { IExperience } from "@/interface/experience";
import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { ActionIcon } from "@mantine/core";
import { IconBrowserCheck, IconMinus } from "@tabler/icons-react";

interface ExperienceBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExperienceBlock({ value, onChange }: ExperienceBlockProps) {
  const [experience, setExperience] = useState<IExperience>({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
    currentlyWorking: false,
  });

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-1 font-medium text-[18px] text-[#404041]">
        {BLOCKS.find((b) => b.type === "experience")?.label}
      </label>
      <div className="w-full h-[2px] mb-1 bg-[#608ABE]"></div>
      <div className="space-y-1">
        {/* Trường học và thời gian */}
        <div className="flex flex-wrap justify-between items-start gap-1">
          {/* Tên trường */}
          <div className="flex-1 min-w-[200px] text-gray-600">
            <input
              type="text"
              value={experience.title}
              onChange={(e) => setExperience({ ...experience, title: e.target.value })}
              placeholder="Tên đơn vị"
              style={{
                color: "#404041",
              }}
              className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
          </div>
          {/* Thời gian */}
          <div className="relative flex-shrink-0 minw-[90px] flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
            <input
              value={experience.startDate}
              onChange={(e) => setExperience({ ...experience, startDate: e.target.value })}
              placeholder="02/2020"
              type="text"
              maxLength={7}
              style={{
                color: "#a5a5a5",
                height: "20px",
              }}
              className="cv-input  max-w-[52px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
            <div className="h-[20px] flex items-center">
              <span className="text-[#a5a5a5]">-</span>
            </div>
            <div>
              {experience.currentlyWorking ? (
                <span
                  style={{
                    color: "#a5a5a5",
                    height: "20px",
                  }}
                >
                  Hiện tại
                </span>
              ) : (
                <input
                  value={experience.endDate}
                  onChange={(e) => setExperience({ ...experience, endDate: e.target.value })}
                  placeholder="2024"
                  maxLength={10}
                  type="text"
                  style={{
                    color: "#a5a5a5",
                    height: "20px",
                  }}
                  className="cv-input max-w-[32px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                />
              )}
            </div>
            <div className="absolute right-[-24px] top-0">
              <ActionIcon
                size="sm"
                variant="light"
                color="green"
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) =>
                  setExperience({
                    ...experience,
                    currentlyWorking: experience.currentlyWorking ? false : true,
                  })
                }
              >
                <IconBrowserCheck stroke={1.5} />
              </ActionIcon>
            </div>
          </div>
        </div>

        {/* Ngành học */}
        <div>
          <TiptapEditor
            placeholder="Mô tả công việc"
            content='<ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p>Phát triển các module web cho các dự án được giao.</p></li><li class="tiptap-list-item"><p>Sử dụng Next.js, TypeScript và thư viện Mantine UI.</p></li><li class="tiptap-list-item"><p>Tham gia tổ chức và cấu trúc lại mã nguồn. Phối hợp với đội ngũ back-end để tích hợp API.</p></li></ul>'
          />
        </div>
      </div>
    </div>
  );
}
