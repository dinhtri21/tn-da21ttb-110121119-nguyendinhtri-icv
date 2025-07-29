import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { useState } from "react";
import { BLOCKS } from "../../constants/blocks";
import { ICertificate } from "@/interface/cv";

interface CertificateBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function CertificateBlock({ value, onChange }: CertificateBlockProps ) {
  const [certificate, setCertificate] = useState<ICertificate>({
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
              value={certificate.title}
              onChange={(e) => setCertificate({ ...certificate, title: e.target.value })}
              placeholder="Tên chứng chỉ"
              style={{
                color: "#404041",
              }}
              className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
            />
          </div>
          {/* Thời gian */}
          <div className="flex-shrink-0 w-[64px] flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
            <input
              value={certificate.date}
              onChange={(e) => setCertificate({ ...certificate, date: e.target.value })}
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
            placeholder="Mô tả chứng chỉ"
            onChange={(content) => setCertificate({ ...certificate, description: content })}
            content=''
          />
        </div>
      </div>
    </div>
  );
}

  