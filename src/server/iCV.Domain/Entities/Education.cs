using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class Education
    {
        public int? Id { get; set; }
        public string? UniversityName { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? Major { get; set; }
    }
}
