export interface ICV {
  file?: IFile;
  template?: Template1CV;
  avatar?: IAvatar;
  awards?: IAward[];
  certificates?: ICertificate[];
  personalInfo?: IPersonalInfo;
  projects?: IProject[];
  education?: IEducation[];
  experiences?: IExperience[];
  skill?: ISkill;
}

export interface IFile {
  fileName?: string;
  createWhen?: string;
}

export default interface IBlock {
  id?: number;
  type?: string;
  height?: number;
}

export interface Template1CV {
  id?: number;
  leftSizeColum?: number;
  rightSizeColum?: number;
  leftColumn?: IBlock[];
  rightColumn?: IBlock[];
}
export interface IAvatar {
  file?: File;
  fileBase64String?: string;
  fileName?: string;
  path?: string;
}

export interface IAward {
  id?: number;
  title?: string;
  date?: string;
  description?: string;
}

export interface IPersonalInfo {
  fullName?: string;
  jobTitle?: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  email?: string;
  overview?: string;
}
export interface IProject {
  id?: number;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ICertificate {
  id?: number;
  title?: string;
  date?: string;
  description?: string;
}

export interface IEducation {
  id?: number;
  universityName?: string;
  startDate?: string;
  endDate?: string;
  major?: string;
}

export interface IExperience {
   id?: number;
  title?: string;
  currentlyWorking?: boolean;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ISkill {
  description?: string;
}
