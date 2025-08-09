using iCV.Application.Common.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface IGeminiEvaluationService
    {
        Task<CVEvaluationResultDto> EvaluateCVWithNormalizationAsync(CVDto cv);
        Task<string> NormalizeCVAsync(CVDto cv);
        Task<List<string>> SuggestJobsAsync(CVDto cv);
    }
}
