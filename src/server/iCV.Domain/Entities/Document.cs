using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class Document
    {
        public string? id { get; set; }
        public string userId { get; set; }
        public string title { get; set; }
        public string summary { get; set; }
        public string themeColor { get; set; }
        public string thumbnail { get; set; }
        public int currentPosition { get; set; }
        public string authorName { get; set; }
        public string authorEmail { get; set; }
        public DateTime createdAt { get; set; } = DateTime.UtcNow;
        public DateTime updatedAt { get; set; } = DateTime.UtcNow;
    }
}
