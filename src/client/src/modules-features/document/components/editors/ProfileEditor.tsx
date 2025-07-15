interface ProfileEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProfileEditor({ value, onChange }: ProfileEditorProps) {
  return (
    <div className="hover:border hover:border-gray-300 border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <label className="block mb-2 font-medium text-gray-700">Ảnh đại diện</label>
      <input
        type="file"
        accept="image/*"
        className="cv-input w-full p-[2px] border border-transparent hover:border hover:border-gray-300 focus:border focus:border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-0 print:ring-0"
      />
    </div>
  );
} 