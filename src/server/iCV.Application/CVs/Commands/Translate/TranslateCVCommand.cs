using iCV.Application.Common.DTOs;
using MediatR;

namespace iCV.Application.CVs.Commands.Translate
{
    public class TranslateCVCommand : IRequest<CVDto>
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string TargetLanguage { get; set; }
    }
}