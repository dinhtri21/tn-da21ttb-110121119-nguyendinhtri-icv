import { IEducation } from "@/interface/education";
import { BLOCKS } from "../../constants/blocks";
import { useState } from "react";

interface EducationBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function EducationBlock({ value, onChange }: EducationBlockProps) {
  const [education, setEducation] = useState<IEducation>({
    universityName: "",
    startDate: "",
    endDate: "",
    major: "",
  });

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-1 font-medium text-[18px] text-[#404041]">
        {BLOCKS.find((b) => b.type === "education")?.label}
      </label>
      <div className="w-full h-[2px] mb-1 bg-[#608ABE]"></div>
      <div className="space-y-1">
        {/* Trường học và thời gian */}
        <div className="flex flex-wrap justify-between items-start gap-1">
          {/* Tên trường */}
          <div className="flex-1 min-w-[200px] text-gray-600">
            <input
              type="text"
              value={education.universityName}
              onChange={(e) => setEducation({ ...education, universityName: e.target.value })}
              placeholder="Tên trường"
              style={{
                color: "#404041",
              }}
              className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
          </div>
          {/* Thời gian */}
          <div className="flex-shrink-0 w-[90px] flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
            <input
              value={education.startDate}
              onChange={(e) => setEducation({ ...education, startDate: e.target.value })}
              placeholder="2020"
              type="text"
              maxLength={4}
              style={{
                color: "#a5a5a5",
                height: "20px",
              }}
              className="cv-input max-w-[32px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
            <div className="h-[20px] flex items-center">
              <span className="text-[#a5a5a5]">-</span>
            </div>
            <input
              value={education.endDate}
              onChange={(e) => setEducation({ ...education, endDate: e.target.value })}
              placeholder="2024"
              maxLength={4}
              type="text"
              style={{
                color: "#a5a5a5",
                height: "20px",
              }}
              className="cv-input max-w-[32px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
          </div>
        </div>

        {/* Ngành học */}
        <div>
          <input
            value={education.major}
            onChange={(e) => setEducation({ ...education, major: e.target.value })}
            type="text"
            style={{
              color: "#737373",
            }}
            placeholder="Ngành học"
            className="cv-input text-gray-600 w-full border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
