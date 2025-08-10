import TiptapEditor from "@/components/Input/RichText/TiptapEditor";
import { useEffect, useState } from "react";
import { BLOCKS } from "../../constants/blocks";
import { ICertificate, ICV } from "@/interface/cv";
import { ActionIcon } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { getBlockLabel } from "../../constants/blocksMultiLang";

interface CertificateBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function CertificateBlock({ value, setCvData }: CertificateBlockProps) {
  // Khởi tạo từ value.certificates hoặc mặc định nếu không có
  const [certificates, setCertificates] = useState<ICertificate[]>(
    value?.certificates?.length
      ? value.certificates
      : [
          {
            title: "",
            date: "",
            description: "",
          },
        ]
  );

  // Đồng bộ state khi có thay đổi
  useEffect(() => {
    setCvData((prev) => ({
      ...prev,
      certificates: certificates,
    }));
  }, [certificates, setCvData]);

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <div className="flex justify-between items-center mb-1">
        <label className="block font-medium text-[18px] text-[#404041]">
          {getBlockLabel("certificate", value.template?.language || "vi")}
        </label>
        <ActionIcon
          size="sm"
          className="opacity-0 group-hover:opacity-100"
          variant="light"
          color="green"
          onClick={() => {
            const newCertificates = [
              ...certificates,
              {
                title: "",
                date: "",
                description: "",
              },
            ];
            setCertificates(newCertificates);
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
        {certificates.map((certificate, index) => (
          <div key={index} className="group relative">
            <div className="flex flex-wrap justify-between items-start gap-1">
              {/* Tên chứng chỉ */}
              <div className="flex-1 min-w-[200px] text-gray-600">
                <input
                  type="text"
                  value={certificate.title || ""}
                  onChange={(e) => {
                    const newCertificates = [...certificates];
                    newCertificates[index] = {
                      ...newCertificates[index],
                      title: e.target.value,
                    };
                    setCertificates(newCertificates);
                  }}
                  placeholder="Tên chứng chỉ"
                  style={{
                    color: "#404041",
                  }}
                  className="cv-input w-full !text-[16px] !font-medium border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-transparent print:ring-0"
                />
              </div>
              {/* Thời gian */}
              <div className="relative flex-shrink-0 w-[64px] flex items-center gap-1 whitespace-nowrap bg-[#ECECEC] px-[6px] rounded-md text-gray-500">
                <input
                  value={certificate.date || ""}
                  onChange={(e) => {
                    const newCertificates = [...certificates];
                    newCertificates[index] = {
                      ...newCertificates[index],
                      date: e.target.value,
                    };
                    setCertificates(newCertificates);
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
                      setCertificates(certificates.filter((_, i) => i !== index));
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
                placeholder="Mô tả chứng chỉ"
                content={certificate.description || ""}
                onChange={(content) => {
                  const newCertificates = [...certificates];
                  newCertificates[index] = {
                    ...newCertificates[index],
                    description: content,
                  };
                  setCertificates(newCertificates);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
