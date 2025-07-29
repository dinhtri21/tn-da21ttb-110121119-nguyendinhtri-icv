import { BLOCKS } from "../../constants/blocks";
import { useState } from "react";
import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { IAward } from "@/interface/cv";

interface AwardBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function AwardBlock({ value, onChange }: AwardBlockProps) {
  const [award, setAward] = useState<IAward>({
    title: "",
    date: "",
    description: "",
  });

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-1 font-medium text-[18px] text-[#404041]">
        {BLOCKS.find((b) => b.type === "award")?.label}
      </label>
      <div className="w-full h-[2px] mb-1 bg-[#608ABE]"></div>
      <div className="space-y-1">
        {/* Trường học và thời gian */}
        <div className="flex flex-wrap justify-between items-start gap-1">
          {/* Tên trường */}
          <div className="flex-1 min-w-[200px] text-gray-600">
            <input
              type="text"
              value={award.title}
              onChange={(e) => setAward({ ...award, title: e.target.value })}
              placeholder="Tên giải thưởng"
              style={{
                color: "#404041",
              }}
              className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
          </div>
          {/* Thời gian */}
          <div className="flex-shrink-0 w-[64px] flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
            <input
              value={award.date}
              onChange={(e) => setAward({ ...award, date: e.target.value })}
              placeholder="01/2020"
              type="text"
              maxLength={7}
              style={{
                color: "#a5a5a5",
                height: "20px",
              }}
              className="cv-input max-w-[52px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <TiptapEditor
            placeholder="Mô tả giải thưởng"
            onChange={(content) => setAward({ ...award, description: content })}
            content=''
          />
        </div>
      </div>
    </div>
  );
}
