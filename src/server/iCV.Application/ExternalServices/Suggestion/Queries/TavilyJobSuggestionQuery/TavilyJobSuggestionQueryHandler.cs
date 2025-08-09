using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace iCV.Application.ExternalServices.Suggestion.Queries.TavilyJobSuggestionQuery
{
    public class TavilyJobSuggestionQueryHandler : IRequestHandler<TavilyJobSuggestionQuery, List<JobSuggestionDto>>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;
        private readonly IGeminiEvaluationService _geminiEvaluationService;
        private readonly IMapper _mapper;
        private IJobSuggestionService _jobSuggestionService;
        public TavilyJobSuggestionQueryHandler(ICVRepository cvRepository, IGeminiEvaluationService geminiEvaluationService, IMapper mapper, IJobSuggestionService jobSuggestionService)
        {
            _mapper = mapper;
            _cvRepository = cvRepository;
            _geminiEvaluationService = geminiEvaluationService;
            _jobSuggestionService = jobSuggestionService;
        }

        public async Task<List<JobSuggestionDto>> Handle(TavilyJobSuggestionQuery request, CancellationToken cancellationToken)
        {
            var cv = await _cvRepository.GetCVByIdAsync(request.id);
            if (cv == null)
            {
                throw new ArgumentException($"CV with id {request.id} not found.");
            }
            var cvDto = _mapper.Map<CVDto>(cv);

            var normalizedJson = await _geminiEvaluationService.NormalizeCVAsync(cvDto);
            var jobs = await _jobSuggestionService.SuggestJobsAsync(normalizedJson);

            return jobs;
        }
    }
}
