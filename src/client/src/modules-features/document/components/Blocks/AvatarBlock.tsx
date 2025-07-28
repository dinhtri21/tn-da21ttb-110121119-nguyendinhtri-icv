import { IAvatar } from "@/interface/avatar";
import { IconUpload, IconUserCircle } from "@tabler/icons-react";
import { useRef, useState } from "react";

interface AvatarBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function AvatarBlock({ value, onChange }: AvatarBlockProps) {
  const [avatar, setAvatar] = useState<IAvatar>({
    file: undefined,
    url: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setAvatar({ file, url });
        onChange(url); // Gửi url của ảnh lên component cha
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="hover:border flex items-center justify-center hover:border-gray-300 bg-transparent border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <div 
        className="relative flex items-center justify-center bg-transparent w-40 h-40 mx-auto cursor-pointer group border-[6px] border-gray-300 rounded-full"
        onClick={handleImageClick}
      >
        {/* Ảnh hiển thị */}
        {avatar.url ? (
          <img
            src={avatar.url}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
            <IconUserCircle 
              size={80} 
              className="text-gray-400"
            />
          </div>
        )}

        {/* Overlay khi hover */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconUpload 
            size={24} 
            className="text-white"
          />
        </div>

        {/* Input file ẩn */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

    </div>
  );
}
