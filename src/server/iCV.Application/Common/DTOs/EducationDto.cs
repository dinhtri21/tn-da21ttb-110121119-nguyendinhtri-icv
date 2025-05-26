using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class EducationDto
    {
        public string? id { get; set; }
        public string documentId { get; set; }
        public string universityName { get; set; }
        public string degree { get; set; }
        public string major { get; set; }
        public DateTime startDate { get; set; } 
        public DateTime endDate { get; set; } 
    }
}
