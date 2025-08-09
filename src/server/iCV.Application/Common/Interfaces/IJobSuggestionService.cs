using iCV.Application.Common.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface IJobSuggestionService
    {
        Task<List<JobSuggestionDto>> SuggestJobsAsync(string normalizedJson);
    }
}
