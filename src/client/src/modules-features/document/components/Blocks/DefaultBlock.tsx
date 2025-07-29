import { ICV } from "@/interface/cv";
import { BLOCKS } from "../../constants/blocks";

interface DefaultBlockProps {
  type: string;
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function DefaultBlock({ type, value, setCvData }: DefaultBlockProps) {
  const getPlaceholder = (type: string): string => {
    switch (type) {
      case "name":
        return "Nhập tên và chức danh của bạn...";
      case "objective":
        return "Nhập mục tiêu nghề nghiệp...";
      case "experience":
        return "Nhập kinh nghiệm làm việc...";
      case "education":
        return "Nhập thông tin học vấn...";
      case "skills":
        return "Nhập các kỹ năng của bạn...";
      case "project":
        return "Nhập thông tin về các dự án...";
      case "certificate":
        return "Nhập các chứng chỉ...";
      case "award":
        return "Nhập các giải thưởng...";
      default:
        return "Nhập nội dung...";
    }
  };

  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-2 font-medium text-gray-700">
        {BLOCKS.find((b) => b.type === type)?.label}
      </label>
      <textarea
        value={""}
        onChange={(e) => setCvData((prevData) => ({
          ...prevData,
          template: {
            ...prevData.template,
            [type]: e.target.value,
          },
        }))}
        placeholder={getPlaceholder(type)}
        className="cv-input w-full p-[2px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 resize-y min-h-[100px] print:border-transparent print:ring-0"
        rows={4}
      />
    </div>
  );
} 