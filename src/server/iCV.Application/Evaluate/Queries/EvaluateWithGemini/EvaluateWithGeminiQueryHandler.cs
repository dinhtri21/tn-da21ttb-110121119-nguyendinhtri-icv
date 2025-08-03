using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace iCV.Application.Evaluate.Queries.EvaluateWithGemini
{
    public class EvaluateWithGeminiQueryHandler : IRequestHandler<EvaluateWithGeminiQuery, CVEvaluationResultDto>
    {
        private readonly ICVRepository _cvRepository;
        private readonly IGeminiEvaluationService _geminiEvaluationService;
        private readonly IMapper _mapper;
        public EvaluateWithGeminiQueryHandler(ICVRepository cvRepository, IGeminiEvaluationService geminiEvaluationService, IMapper mapper)
        {
            _mapper = mapper;
            _cvRepository = cvRepository;
            _geminiEvaluationService = geminiEvaluationService;
        }
        public async Task<CVEvaluationResultDto> Handle(EvaluateWithGeminiQuery request, CancellationToken cancellationToken)
        {
            var cv = await _cvRepository.GetCVByIdAsync(request.id);
            if (cv == null)
            {
                throw new ArgumentException($"CV with id {request.id} not found.");
            }
            var CVDto = _mapper.Map<CVDto>(cv);

            var evaluationResult = await _geminiEvaluationService.EvaluateCVWithNormalizationAsync(CVDto);
            return evaluationResult;
        }
    }
}
