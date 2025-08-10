import { BlockTypeMultiLang } from "../interfaces/types";

export const BLOCKS_MULTI_LANG: BlockTypeMultiLang[] = [
  { 
    type: "avatar", 
    labels: {
      vi: "Ảnh đại diện",
      en: "Avatar"
    } 
  },
  { 
    type: "businessCard", 
    labels: {
      vi: "Danh thiếp",
      en: "Business Card"
    } 
  },
  { 
    type: "personalInfo", 
    labels: {
      vi: "Thông tin cá nhân",
      en: "Personal Information"
    } 
  },
  { 
    type: "overview", 
    labels: {
      vi: "Giới thiệu",
      en: "Overview"
    } 
  },
  { 
    type: "education", 
    labels: {
      vi: "Học vấn",
      en: "Education"
    } 
  },
  { 
    type: "experience", 
    labels: {
      vi: "Kinh nghiệm",
      en: "Experience"
    } 
  },
  { 
    type: "project", 
    labels: {
      vi: "Dự án",
      en: "Projects"
    } 
  },
  { 
    type: "skills", 
    labels: {
      vi: "Kỹ năng",
      en: "Skills"
    } 
  },
  { 
    type: "certificate", 
    labels: {
      vi: "Chứng chỉ",
      en: "Certificates"
    } 
  },
  { 
    type: "award", 
    labels: {
      vi: "Giải thưởng",
      en: "Awards"
    } 
  },
  { 
    type: "spacer", 
    labels: {
      vi: "Khoảng cách",
      en: "Spacer"
    } 
  },
];

// Helper function to get the label based on language
export const getBlockLabel = (type: string, language: string = 'vi'): string => {
  const block = BLOCKS_MULTI_LANG.find(b => b.type === type);
  if (!block) return type;
  
  return block.labels[language as keyof typeof block.labels] || block.labels.vi;
};
