import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { useEffect, useState } from "react";
import { BLOCKS } from "../../constants/blocks";
import { ICV, IPersonalInfo } from "@/interface/cv";

interface OverviewBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function OverviewBlock({ value, setCvData }: OverviewBlockProps) {
  // const [personalInfo, setPersonalInfo] = useState<IPersonalInfo>({
  //   overview: value.personalInfo?.overview || "",
  // });

  // // Đồng bộ state khi có thay đổi
  // useEffect(() => {
  //   setCvData((prev) => ({
  //     ...prev,
  //     personalInfo: personalInfo,
  //   }));
  // }, [personalInfo, setCvData]);

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-1 font-medium text-[18px] text-[#404041]">
        {BLOCKS.find((b) => b.type === "overview")?.label}
      </label>
      <div
        className="w-full h-[2px] mb-1"
        style={{
          backgroundColor: value.template?.color || "#608ABE",
        }}
      ></div>
      <TiptapEditor
        onChange={(content) =>
          setCvData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              overview: content,
            },
          }))
        }
        content={value.personalInfo?.overview || ""}
        placeholder="Giới thiệu chung"
        // content="<p>- Mục tiêu: trở thành một full-stack developer.</p><p> - Khả năng: học hỏi và áp dụng công nghệ mới nhanh chóng.</p>"
      />
    </div>
  );
}
