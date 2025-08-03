using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class CVNormalizedDto
    {
        public string FullName { get; set; }
        public string JobTitle { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Overview { get; set; }
        public List<string> Experiences { get; set; }
        public List<string> Projects { get; set; }
        public List<string> Educations { get; set; }
        public List<string> Skills { get; set; }
        public List<string> Awards { get; set; }
        public List<string> Certificates { get; set; }
        public string CareerObjective { get; set; }
        public List<string> Achievements { get; set; }
    }
}
