using iCV.Application.Common.DTOs;
using MediatR;

namespace iCV.Application.CVs.Queries.GetPublicCVById
{
    public class GetPublicCVByIdQuery : IRequest<CVDto?>
    {
        public string Id { get; set; }
    }
}