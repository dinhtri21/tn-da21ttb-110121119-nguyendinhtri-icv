import { ICV, IEducation } from "@/interface/cv";
import { BLOCKS } from "../../constants/blocks";
import { ActionIcon } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { getBlockLabel } from "../../constants/blocksMultiLang";

interface EducationBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function EducationBlock({ value, setCvData }: EducationBlockProps) {
  // Khởi tạo từ value.education hoặc mặc định nếu không có
  const [education, setEducation] = useState<IEducation[]>(
    value?.education?.length
      ? value.education
      : [
          {
            universityName: "",
            startDate: "",
            endDate: "",
            description: "",
          },
        ]
  );

  // Đồng bộ state khi có thay đổi
  useEffect(() => {
    setCvData((prev) => ({
      ...prev,
      education: education,
    }));
  }, [education, setCvData]);

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <div className="flex justify-between items-center mb-1">
        <label className="block font-medium text-[18px] text-[#404041]">
          {getBlockLabel("education", value.template?.language || "vi")}
        </label>
        <ActionIcon
          size="sm"
          className="opacity-0 group-hover:opacity-100"
          variant="light"
          color="green"
          onClick={() => {
            const newEducation = [
              ...education,
              {
                universityName: "",
                startDate: "",
                endDate: "",
                major: "",
              },
            ];
            setEducation(newEducation);
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
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={index} className="group">
            {/* Trường học và thời gian */}
            <div className="flex flex-wrap justify-between items-start gap-1">
              {/* Tên trường */}
              <div className="flex-1 min-w-[200px] text-gray-600">
                <input
                  type="text"
                  value={edu.universityName || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      universityName: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  placeholder="Tên trường"
                  style={{
                    color: "#404041",
                  }}
                  className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                />
              </div>
              {/* Thời gian */}
              <div className="relative flex-shrink-0 w-[130px] flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
                <input
                  value={edu.startDate || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      startDate: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  placeholder="01/2020"
                  type="text"
                  maxLength={4}
                  style={{
                    color: "#a5a5a5",
                    height: "20px",
                  }}
                  className="cv-input max-w-[52px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                />
                <div className="h-[20px] flex items-center">
                  <span className="text-[#a5a5a5]">-</span>
                </div>
                <input
                  value={edu.endDate || ""}
                  onChange={(e) => {
                    const newEducation = [...education];
                    newEducation[index] = {
                      ...newEducation[index],
                      endDate: e.target.value,
                    };
                    setEducation(newEducation);
                  }}
                  placeholder="01/2024"
                  maxLength={4}
                  type="text"
                  style={{
                    color: "#a5a5a5",
                    height: "20px",
                  }}
                  className="cv-input max-w-[52px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                />
                <div className="absolute right-[-24px] top-0">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      setEducation(education.filter((_, i) => i !== index));
                    }}
                  >
                    <IconMinus stroke={1.5} />
                  </ActionIcon>
                </div>
              </div>
            </div>

            {/* Ngành học */}
            <div className="mt-1">
              <TiptapEditor
                placeholder="Mô tả chuyển ngành, GPA,..."
                content={
                  edu.description
                  // ||
                  // '<p>Ngành Công nhệ thông tin</p><p>GPA: 3.2</p>'
                }
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index] = {
                    ...newEducation[index],
                    description: e,
                  };
                  setEducation(newEducation);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
