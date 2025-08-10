export interface ICV {
  id?: string;
  userId?: string;
  fileName?: string;
  status?: string;
  createWhen?: Date;
  template?: Template;
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

export interface Template {
  id?: number;
  color?: string;
  leftSizeColum?: number;
  rightSizeColum?: number;
  leftColumn?: IBlock[];
  rightColumn?: IBlock[];
  language?: string;
}
export interface IAvatar {
  file?: File;
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
  description?: string;
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
