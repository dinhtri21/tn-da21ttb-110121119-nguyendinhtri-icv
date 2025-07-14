import { BLOCKS } from "../constants/blocks";

export interface BlockEditorProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
}

export default function BlockEditor({ type, value, onChange }: BlockEditorProps) {
  if (type === "profile") {
    return (
      <div>
        <label className="block mb-2 font-medium text-gray-700">Ảnh đại diện</label>
        <input
          type="file"
          accept="image/*"
          className="cv-input mb-2 w-full p-[2px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-0 print:ring-0"
        />
      </div>
    );
  }

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
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        {BLOCKS.find((b) => b.type === type)?.label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder(type)}
        className="cv-input w-full p-[2px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 resize-y min-h-[100px] print:border-0 print:ring-0"
        rows={4}
      />
    </div>
  );
}
