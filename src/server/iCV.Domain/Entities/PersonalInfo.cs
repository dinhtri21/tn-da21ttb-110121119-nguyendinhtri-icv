using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class PersonalInfo
    {
        public string? FullName { get; set; }
        public string? JobTitle { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Overview { get; set; }
    }
}
