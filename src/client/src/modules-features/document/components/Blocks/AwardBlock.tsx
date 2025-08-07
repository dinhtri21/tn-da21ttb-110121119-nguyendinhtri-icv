import { BLOCKS } from "../../constants/blocks";
import { useEffect, useState } from "react";
import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { IAward, ICV } from "@/interface/cv";
import { ActionIcon } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";

interface AwardBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function AwardBlock({ value, setCvData }: AwardBlockProps) {
  // Khởi tạo từ value.awards hoặc mặc định nếu không có
  const [awards, setAwards] = useState<IAward[]>(
    value?.awards?.length
      ? value.awards
      : [{
          title: "",
          date: "",
          description: "",
        }]
  );

  // Đồng bộ state khi có thay đổi
  useEffect(() => {
    setCvData(prev => ({
      ...prev,
      awards: awards
    }));
  }, [awards, setCvData]);

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <div className="flex justify-between items-center mb-1">
        <label className="block font-medium text-[18px] text-[#404041]">
          {BLOCKS.find((b) => b.type === "award")?.label}
        </label>
        <ActionIcon
          size="sm"
          className="opacity-0 group-hover:opacity-100"
          variant="light"
          color="green"
          onClick={() => {
            const newAwards = [
              ...awards,
              {
                title: "",
                date: "",
                description: "",
              },
            ];
            setAwards(newAwards);
          }}
        >
          <IconPlus stroke={1.5} />
        </ActionIcon>
      </div>
      <div 
        className="w-full h-[2px] mb-1" 
        style={{ 
          backgroundColor: value.template?.color || '#608ABE'
        }}
      ></div>
      <div className="space-y-4">
        {awards.map((award, index) => (
          <div key={index} className="group relative">
            <div className="flex flex-wrap justify-between items-start gap-1">
              {/* Tên giải thưởng */}
              <div className="flex-1 min-w-[200px] text-gray-600">
                <input
                  type="text"
                  value={award.title || ""}
                  onChange={(e) => {
                    const newAwards = [...awards];
                    newAwards[index] = {
                      ...newAwards[index],
                      title: e.target.value
                    };
                    setAwards(newAwards);
                  }}
                  placeholder="Tên giải thưởng"
                  style={{
                    color: "#404041",
                  }}
                  className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                />
              </div>
              {/* Thời gian */}
              <div className="relative flex-shrink-0 w-[64px] flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
                <input
                  value={award.date || ""}
                  onChange={(e) => {
                    const newAwards = [...awards];
                    newAwards[index] = {
                      ...newAwards[index],
                      date: e.target.value
                    };
                    setAwards(newAwards);
                  }}
                  placeholder="01/2020"
                  type="text"
                  maxLength={7}
                  style={{
                    color: "#a5a5a5",
                    height: "20px",
                  }}
                  className="cv-input max-w-[52px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                />
                {/* Nút xóa */}
                <div className="absolute top-0 right-[-26px]">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      setAwards(awards.filter((_, i) => i !== index));
                    }}
                  >
                    <IconMinus stroke={1.5} />
                  </ActionIcon>
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div className="mt-2">
              <TiptapEditor
                placeholder="Mô tả giải thưởng"
                content={award.description || ""}
                onChange={(content) => {
                  const newAwards = [...awards];
                  newAwards[index] = {
                    ...newAwards[index],
                    description: content
                  };
                  setAwards(newAwards);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
