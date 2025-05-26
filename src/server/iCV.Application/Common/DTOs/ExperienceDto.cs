using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class ExperienceDto
    {
        public string? id { get; set; }
        public string documentId { get; set; }
        public string title { get; set; }
        public string position { get; set; }
        public bool currentlyWorking { get; set; }
        public string description { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}
