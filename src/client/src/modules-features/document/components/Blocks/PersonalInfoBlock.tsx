import { ICV, IPersonalInfo } from "@/interface/cv";
import { IconCalendarEvent, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface PersonalInfoBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function PersonalInfoBlock({ value, setCvData }: PersonalInfoBlockProps) {
  // const [personalInfo, setPersonalInfo] = useState<IPersonalInfo>(
  //   {
  //   address: value.personalInfo?.address || "",
  //   dateOfBirth: value.personalInfo?.dateOfBirth || "",
  //   email: value.personalInfo?.email || "",
  //   phone: value.personalInfo?.phone || "",
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
      {/* Thông tin liên hệ */}
      <div className="flex flex-row gap-1 flex-wrap">
        {/* Địa chỉ */}

        <div className="flex items-center gap-1 flex-1">
          <IconMapPin stroke={1} size={18} />
          <input
            type="text"
            value={value.personalInfo?.address || ""}
            onChange={(e) =>
              setCvData((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, address: e.target.value },
              }))
            }
            placeholder="Địa chỉ"
            style={{
              color: "#737373",
            }}
            className="cv-input flex-1 text-gray-600 border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
          />
        </div>

        {/* Ngày sinh */}
        <div className="flex items-center gap-1 basis-1/3">
          <IconCalendarEvent stroke={1} size={18} />
          <input
            type="date"
            value={value.personalInfo?.dateOfBirth || ""}
            onChange={(e) =>
              setCvData((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value },
              }))
            }
            placeholder="Ngày sinh"
            style={{
              color: "#737373",
            }}
            className="cv-input w-[90px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
          />
        </div>

        {/* Email */}
        <div className="flex items-center gap-1 flex-1">
          <IconMail stroke={1} size={18} />
          <input
            type="email"
            value={value.personalInfo?.email || ""}
            onChange={(e) =>
              setCvData((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, email: e.target.value },
              }))
            }
            placeholder="Email"
            style={{
              color: "#737373",
            }}
            className="cv-input flex-1 border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
          />
        </div>

        {/* Số điện thoại */}
        <div className="flex items-center gap-1 basis-1/3">
          <IconPhone stroke={1} size={18} />
          <input
            type="tel"
            value={value.personalInfo?.phone || ""}
            onChange={(e) =>
              setCvData((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, phone: e.target.value },
              }))
            }
            placeholder="Số điện thoại"
            style={{
              color: "#737373",
            }}
            className="cv-input w-[90px] flex-1 border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
