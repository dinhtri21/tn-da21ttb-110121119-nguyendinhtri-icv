using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class Certificate
    {
        public int? Id { get; set; }
        public string? Title { get; set; }
        public string? Date { get; set; }
        public string? Description { get; set; }
    }
}
