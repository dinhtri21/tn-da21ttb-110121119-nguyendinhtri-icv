using MediatR;

namespace iCV.Application.CVs.Commands.Delete
{
    public class DeleteCVCommand : IRequest<bool>
    {
        public string Id { get; set; }
        public string UserId { get; set; }
    }
}