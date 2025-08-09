using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Commands.Delete
{
    public class DeleteCVCommandHandler : IRequestHandler<DeleteCVCommand, bool>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;

        public DeleteCVCommandHandler(ICVRepository cvRepository)
        {
            _cvRepository = cvRepository;
        }

        public async Task<bool> Handle(DeleteCVCommand request, CancellationToken cancellationToken)
        {
            // Get the CV first to verify it exists and belongs to the user
            var cv = await _cvRepository.GetCVByIdAsync(request.Id);
            
            if (cv == null)
            {
                throw new Exception("CV không tồn tại");
            }

            // Verify the CV belongs to the requesting user
            if (cv.UserId != request.UserId)
            {
                throw new Exception("Bạn không có quyền xóa CV này");
            }

            // Delete the CV
            await _cvRepository.DeleteCVAsync(request.Id);
            
            return true;
        }
    }
}