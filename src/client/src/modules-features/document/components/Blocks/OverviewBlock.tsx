import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { useState } from "react";
import { BLOCKS } from "../../constants/blocks";
import { IPersonalInfo } from "@/interface/cv";

interface OverviewBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function OverviewBlock({ value, onChange }: OverviewBlockProps) {
  const [project, setProject] = useState<IPersonalInfo>({
    overview: "",
  });

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-1 font-medium text-[18px] text-[#404041]">
        {BLOCKS.find((b) => b.type === "overview")?.label}
      </label>
      <div className="w-full h-[2px] mb-1 bg-[#608ABE]"></div>
      <TiptapEditor
        placeholder="Giới thiệu chung mục tiêu nghề nghiệp..."
        content="<p>- Mục tiêu: trở thành một full-stack developer.</p><p> - Khả năng: học hỏi và áp dụng công nghệ mới nhanh chóng.</p>"
      />
    </div>
  );
}
