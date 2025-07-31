using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class Template
    {
        public int? Id { get; set; }
        public int? LeftSizeColum { get; set; }
        public int? RightSizeColum { get; set; }
        public List<Block>? LeftColumn { get; set; }
        public List<Block>? RightColumn { get; set; }
    }
}
