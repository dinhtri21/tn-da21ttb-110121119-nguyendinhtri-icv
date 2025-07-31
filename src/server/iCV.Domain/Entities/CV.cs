using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class CV
    {
        public string Id { get; set; }
        public string? UserId { get; set; }
        public FileData? File { get; set; }
        public Template? Template { get; set; }
        public Avatar? Avatar { get; set; }
        public List<Award>? Awards { get; set; }
        public List<Certificate>? Certificates { get; set; }
        public PersonalInfo? PersonalInfo { get; set; }
        public List<Project>? Projects { get; set; }
        public List<Education>? Education { get; set; }
        public List<Experience>? Experiences { get; set; }
        public Skill? Skill { get; set; }
    }
}
