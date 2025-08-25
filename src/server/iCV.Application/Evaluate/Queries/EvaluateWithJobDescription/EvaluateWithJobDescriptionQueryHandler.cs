using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace iCV.Application.Evaluate.Queries.EvaluateWithJobDescription
{
    public class EvaluateWithJobDescriptionQueryHandler : IRequestHandler<EvaluateWithJobDescriptionQuery, CVEvaluationResultDto>
    {
        private readonly ICVRepository _cvRepository;
        private readonly IGeminiEvaluationService _geminiEvaluationService;
        private readonly IMapper _mapper;

        public EvaluateWithJobDescriptionQueryHandler(ICVRepository cvRepository, IGeminiEvaluationService geminiEvaluationService, IMapper mapper)
        {
            _mapper = mapper;
            _cvRepository = cvRepository;
            _geminiEvaluationService = geminiEvaluationService;
        }

        public async Task<CVEvaluationResultDto> Handle(EvaluateWithJobDescriptionQuery request, CancellationToken cancellationToken)
        {
            var cv = await _cvRepository.GetCVByIdAsync(request.Id);
            if (cv == null)
            {
                throw new ArgumentException($"CV with id {request.Id} not found.");
            }
            
            var cvDto = _mapper.Map<CVDto>(cv);
            var evaluationResult = await _geminiEvaluationService.EvaluateCVWithJobDescriptionAsync(cvDto, request.JobDescription);
            
            return evaluationResult;
        }
    }
}