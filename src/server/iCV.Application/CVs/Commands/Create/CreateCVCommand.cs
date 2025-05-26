using iCV.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Commands.Create
{
    public class CreateCVCommand : IRequest<CVDto>
    {
        public DocumentRequest Document { get; set; }
        public PersonalInfoRequest? PersonalInfo { get; set; }
        public List<ExperienceRequest>? Experiences { get; set; }
        public List<EducationRequest>? Educations { get; set; }
        public List<SkillRequest>? Skills { get; set; }
    }

    public class DocumentRequest
    {
        public string userId { get; set; }
        public string title { get; set; }
        public string summary { get; set; }
        public string themeColor { get; set; }
        public string thumbnail { get; set; }
        public int currentPosition { get; set; }
        public string authorName { get; set; }
        public string authorEmail { get; set; }
    }

    public class ExperienceRequest
    {
        public string title { get; set; }
        public string position { get; set; }
        public bool currentlyWorking { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }

    public class EducationRequest
    {
        public string universityName { get; set; }
        public string degree { get; set; }
        public string major { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }

    public class SkillRequest
    {
        public string name { get; set; }
        public bool main { get; set; }
    }

    public class PersonalInfoRequest
    {
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string jobTitle { get; set; }
        public string address { get; set; }
        public string phone { get; set; }
        public string email { get; set; }
    }

}
