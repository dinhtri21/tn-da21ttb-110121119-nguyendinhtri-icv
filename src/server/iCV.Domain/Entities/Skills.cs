using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class Skills
    {
        public string? id { get; set; }
        public string documentId { get; set; }
        public string name { get; set; }
        public bool main { get; set; } 
    }
}
