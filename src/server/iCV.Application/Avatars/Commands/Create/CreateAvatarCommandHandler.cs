using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Application.CVs.Commands.Create;
using iCV.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Avatars.Commands.Create
{
    public class CreateAvatarCommandHandler : IRequestHandler<CreateAvatarCommand, AvatarDto>, IApplicationMarker
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IAvatarRepository _avatarRepository;

        public CreateAvatarCommandHandler(IWebHostEnvironment webHostEnvironment, IAvatarRepository avatarRepository)
        {
            _webHostEnvironment = webHostEnvironment;
            _avatarRepository = avatarRepository;
        }

        public async Task<AvatarDto> Handle(CreateAvatarCommand request, CancellationToken cancellationToken)
        {
            string? avatarPath = null;

            if (request?.File != null)
            {
                var fileName = $"{Guid.NewGuid()}_{request.FileName}";
                var filePath = Path.Combine(_webHostEnvironment.WebRootPath, "images", "avatars", fileName);

                // Create directory if it doesn't exist
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }

                avatarPath = $"/images/avatars/{fileName}";
            }

            // Update avatar
            var updatedAvatar = await _avatarRepository.CreateAvatarAsync(new Avatar 
            {
                FileName = request?.FileName, 
                Path = avatarPath
            }, request.CVId); 

            if (updatedAvatar == null)
            {
                throw new Exception("CV not found or update failed.");
            }

            return new AvatarDto 
            {
                FileName = updatedAvatar.FileName,
                Path = updatedAvatar.Path
            };
        }
    }
}
