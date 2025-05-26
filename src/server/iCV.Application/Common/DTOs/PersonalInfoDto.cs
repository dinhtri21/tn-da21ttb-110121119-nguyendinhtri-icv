using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class PersonalInfoDto
    {
        public string? id { get; set; }
        public string documentId { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string jobTitle { get; set; }
        public string address { get; set; }
        public string phone { get; set; }
        public string email { get; set; }
    }
}
