import { ICV, IPersonalInfo } from "@/interface/cv";
import { useEffect, useState } from "react";

interface PersonalInfoBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function BusinessCardBlock({ value, setCvData }: PersonalInfoBlockProps) {
  const [personalInfo, setPersonalInfo] = useState<IPersonalInfo>({
    fullName: value.personalInfo?.fullName || "",
    jobTitle: value.personalInfo?.jobTitle || "",
  });

  // Đồng bộ state khi có thay đổi
  useEffect(() => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: personalInfo,
    }));
  }, [personalInfo, setCvData]);
  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      {/* Thông tin liên hệ */}
      <div className="flex flex-col gap-0">
        {/* Họ tên */}
        <div className="flex items-center gap-1 flex-1">
          <input
            type="text"
            value={value.personalInfo?.fullName || ""}
            onChange={(e) =>
              setCvData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  fullName: e.target.value,
                },
              }))
            }
            placeholder="Họ tên"
            style={{
              color: "#404041",
            }}
            className="cv-input flex-1 w-[100%] !text-[32px] !font-bold !tracking-[2px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
          />
        </div>

        {/* Vị trí ứng tuyển */}
        <div className="flex items-center gap-1 flex-1">
          <input
            type="text"
            value={value.personalInfo?.jobTitle || ""}
            onChange={(e) =>
              setCvData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  jobTitle: e.target.value,
                },
              }))
            }
            placeholder="Vị trí ứng tuyển"
            style={{
              color: "#737373",
            }}
            className="cv-input flex-1 !text-[20px] !font-[400] text-gray-400 border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
