using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class Block
    {
        public int? Id { get; set; }
        public string? Type { get; set; }
        public int? Height { get; set; }
    }
}
