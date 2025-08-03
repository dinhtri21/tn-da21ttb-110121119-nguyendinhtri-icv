using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class CVEvaluationResultDto
    {
        public List<CVEvaluationAreaDto> Areas { get; set; } = new();
    }
}
