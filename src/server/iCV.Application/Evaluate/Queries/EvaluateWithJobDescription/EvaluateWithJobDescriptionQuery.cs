using iCV.Application.Common.DTOs;
using MediatR;

namespace iCV.Application.Evaluate.Queries.EvaluateWithJobDescription
{
    public class EvaluateWithJobDescriptionQuery : IRequest<CVEvaluationResultDto>
    {
        public string Id { get; set; }
        public string JobDescription { get; set; }
    }
}