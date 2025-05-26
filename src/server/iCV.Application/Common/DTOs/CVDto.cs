using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class CVDto
    {
        public DocumentDto Document { get; set; }
        public PersonalInfoDto PersonalInfo { get; set; }
        public List<SkillsDto> Skills { get; set; }
        public List<ExperienceDto> Experiences { get; set; }
        public List<EducationDto> Educations { get; set; }
    }
}
