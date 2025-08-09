using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class JobSuggestionDto
    {
        public string Title { get; set; }
        public string Company { get; set; }
        public string Location { get; set; }
        public string Summary { get; set; }
        public string Url { get; set; }
        public DateTime PostedDate { get; set; }
        public double FreshnessScore { get; set; }
    }
}
