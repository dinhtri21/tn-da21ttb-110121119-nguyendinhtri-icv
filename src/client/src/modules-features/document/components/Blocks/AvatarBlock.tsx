import { IAvatar, ICV } from "@/interface/cv";
import { IconUpload, IconUserCircle } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface AvatarBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function AvatarBlock({ value, setCvData }: AvatarBlockProps) {
  const [avatar, setAvatar] = useState<IAvatar>({
    file: value.avatar?.file || undefined,
    path: value.avatar?.path || "",
    fileName: value.avatar?.fileName || "",
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
        const path = reader.result as string;
        setAvatar({ file, path });
        setCvData(
          (prevData) => ({
            ...prevData,
            avatar: { 
              file,
              fileName: file.name,

            }, // Cập nhật dữ liệu CV với ảnh đại diện mới
          })
        ); // Gửi path của ảnh lên component cha
      };
      reader.readAsDataURL(file);
    }
  };

  // Đồng bộ state khi có thay đổi
  useEffect(() => { 
    setCvData((prev) => ({
      ...prev,
      avatar: avatar,
    }));
  }, [avatar, setCvData]);
    

  return (
    <div className="hover:border flex items-center justify-center hover:border-gray-300 bg-transparent border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <div 
        className="relative flex items-center justify-center bg-transparent w-40 h-40 mx-auto cursor-pointer group border-[6px] border-gray-300 rounded-full"
        onClick={handleImageClick}
      >
        {/* Ảnh hiển thị */}
        {avatar.path ? (
          <img
            src={avatar.path}
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
