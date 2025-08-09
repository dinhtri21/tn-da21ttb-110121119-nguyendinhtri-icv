using iCV.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.ExternalServices.Suggestion.Queries.TavilyJobSuggestionQuery
{
    public class TavilyJobSuggestionQuery : IRequest<List<JobSuggestionDto>>
    {
        public string id { get; set; }
    }
}
