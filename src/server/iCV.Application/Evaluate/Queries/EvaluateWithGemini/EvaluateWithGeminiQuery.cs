using iCV.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Evaluate.Queries.EvaluateWithGemini
{
    public class EvaluateWithGeminiQuery : IRequest<CVEvaluationResultDto>
    {
        public string id { get; set; }
    }
}
