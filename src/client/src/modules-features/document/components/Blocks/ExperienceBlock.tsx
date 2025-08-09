import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { ActionIcon } from "@mantine/core";
import { IconBrowserCheck, IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { BLOCKS } from "../../constants/blocks";
import { ICV, IExperience } from "@/interface/cv";
import { getBlockLabel } from "../../constants/blocksMultiLang";

interface ExperienceBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function ExperienceBlock({ value, setCvData }: ExperienceBlockProps) {
  // Khởi tạo từ value.experiences hoặc mặc định nếu không có
  const [experience, setExperience] = useState<IExperience[]>(
    value?.experiences?.length
      ? value.experiences
      : [
          {
            title: "",
            startDate: "",
            endDate: "",
            description: "",
            currentlyWorking: false,
          },
          {
            title: "",
            startDate: "",
            endDate: "",
            description: "",
            currentlyWorking: false,
          },
        ]
  );

  // Đồng bộ state khi có thay đổi
  useEffect(() => {
    setCvData((prev) => ({
      ...prev,
      experiences: experience,
    }));
  }, [experience, setCvData]);

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <div className="flex justify-between items-center mb-1">
        <label className="block font-medium text-[18px] text-[#404041]">
         {getBlockLabel("experience", value.template?.language || "vi")}
        </label>
        <ActionIcon
          size="sm"
          className="opacity-0 group-hover:opacity-100"
          variant="light"
          color="green"
          onClick={() => {
            const newExperience = [
              ...experience,
              {
                title: "",
                startDate: "",
                endDate: "",
                description: "",
                currentlyWorking: false,
              },
            ];
            setExperience(newExperience);
          }}
        >
          <IconPlus stroke={1.5} />
        </ActionIcon>
      </div>
      <div
        className="w-full h-[2px] mb-1"
        style={{
          backgroundColor: value.template?.color || "#608ABE",
        }}
      ></div>
      <div className="space-y-1">
        {experience.map((exp, index) => (
          <div key={index}>
            {/* Tên kinh nghiệm và thời gian */}
            <div className="flex flex-wrap justify-between items-start gap-1">
              {/* Tên kinh nghiệm */}
              <div className="flex-1 min-w-[200px] text-gray-600">
                <input
                  type="text"
                  placeholder="Tên kinh nghiệm"
                  value={exp.title || ""}
                  onChange={(e) => {
                    const newExperience = [...experience];
                    newExperience[index] = {
                      ...newExperience[index],
                      title: e.target.value,
                    };
                    setExperience(newExperience);
                  }}
                  className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                />
              </div>
              {/* Thời gian */}
              <div className="relative flex-shrink-0 minw-[90px] flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
                <input
                  value={exp.startDate || ""}
                  onChange={(e) => {
                    const newExperience = [...experience];
                    newExperience[index] = {
                      ...newExperience[index],
                      startDate: e.target.value,
                    };
                    setExperience(newExperience);
                  }}
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
                  {exp.currentlyWorking ? (
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
                      value={exp.endDate || ""}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index] = {
                          ...newExperience[index],
                          endDate: e.target.value,
                        };
                        setExperience(newExperience);
                      }}
                      placeholder="12/2024"
                      maxLength={10}
                      type="text"
                      style={{
                        color: "#a5a5a5",
                        height: "20px",
                      }}
                      className="cv-input max-w-[52px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                    />
                  )}
                </div>
                <div className="absolute top-0 right-[-26px] flex flex-col">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      setExperience(experience.filter((_, i) => i !== index));
                    }}
                  >
                    <IconMinus stroke={1.5} />
                  </ActionIcon>
                </div>
                <div className="absolute top-[-2px] left-[-24px] flex flex-col">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="green"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      // Tạo một bản sao mới của mảng và cập nhật trực tiếp
                      const newExperience = [...experience];
                      newExperience[index] = {
                        ...newExperience[index],
                        currentlyWorking: !newExperience[index].currentlyWorking,
                      };
                      setExperience(newExperience);
                    }}
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
                content={
                  exp.description ||
                  '<ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p>Phát triển các module web cho các dự án được giao.</p></li><li class="tiptap-list-item"><p>Sử dụng Next.js, TypeScript và thư viện Mantine UI.</p></li><li class="tiptap-list-item"><p>Tham gia tổ chức và cấu trúc lại mã nguồn. Phối hợp với đội ngũ back-end để tích hợp API.</p></li></ul>'
                }
                onChange={(content) => {
                  const newExperience = [...experience];
                  newExperience[index] = {
                    ...newExperience[index],
                    description: content,
                  };
                  setExperience(newExperience);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
