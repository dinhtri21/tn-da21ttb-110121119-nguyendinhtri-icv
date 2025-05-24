using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class User
    {
        public string? id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string? password { get; set; }
        public string provider { get; set; }
        public DateTime createdAt { get; set; } = DateTime.UtcNow;
        public DateTime updatedAt { get; set; } = DateTime.UtcNow;
    }
}
