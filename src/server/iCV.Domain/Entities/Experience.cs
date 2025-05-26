using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class Experience
    {
        public string? id { get; set; }
        public string documentId { get; set; }
        public string title { get; set; }
        public string position { get; set; }
        public bool currentlyWorking { get; set; }
        public string description { get; set; }
        public DateTime startDate { get; set; } = DateTime.UtcNow;
        public DateTime endDate { get; set; } = DateTime.UtcNow;
    }
}
