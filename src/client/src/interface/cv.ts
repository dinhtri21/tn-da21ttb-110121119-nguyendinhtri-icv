export interface ICV {
  avatar?: IAvatar;
  awards?: IAward[];
  certificates?: ICertificate[];
  personalInfo?: IPersonalInfo;
  projects?: IProject[];
  education?: IEducation[];
  experiences?: IExperience[];
  skill?: ISkill;
}
export interface IAvatar {
  file?: File;
  fileBase64String?: string;
  fileName?: string;
  path?: string;
}

export interface IAward {
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
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ICertificate {
  title?: string;
  date?: string;
  description?: string;
}

export interface IEducation {
  universityName?: string;
  startDate?: string;
  endDate?: string;
  major?: string;
}

export interface IExperience {
  title?: string;
  currentlyWorking?: boolean;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ISkill {
  description?: string;
}
