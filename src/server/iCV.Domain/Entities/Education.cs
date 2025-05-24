using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class Education
    {
        public string? id { get; set; }
        public string documentId { get; set; }
        public string universityName { get; set; }
        public string degree { get; set; }
        public string major { get; set; }
        public DateTime startDate { get; set; } = DateTime.UtcNow;
        public DateTime endDate { get; set; } = DateTime.UtcNow;
    }
}
