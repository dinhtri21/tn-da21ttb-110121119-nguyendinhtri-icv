using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Domain.Entities
{
    public class FileData
    {
        public string? FileName { get; set; }
        public string? CreateWhen { get; set; }
        public string? FileBase64String { get; set; }
        public string? Path { get; set; }
    }
}
