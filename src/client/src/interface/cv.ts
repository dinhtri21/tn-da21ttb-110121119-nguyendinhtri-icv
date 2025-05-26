import { IDocument } from "./document";
import { IEducation } from "./education";
import { IExperience } from "./experience";
import { IPersonalInfo } from "./personalInfo";
import { ISkills } from "./skills";

export interface ICV {
    document: IDocument;
    pesonalInfo: IPersonalInfo;
    experiences: IExperience[];
    skills: ISkills[];
    education: IEducation[];
}