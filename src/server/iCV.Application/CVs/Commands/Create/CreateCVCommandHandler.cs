using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace iCV.Application.CVs.Commands.Create
{
    public class CreateCVCommandHandler : IRequestHandler<CreateCVCommand, CVDto>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public CreateCVCommandHandler(ICVRepository cvRepository, IMapper mapper, IWebHostEnvironment webHostEnvironment)
        {
            _mapper = mapper;
            _cvRepository = cvRepository;
            _webHostEnvironment = webHostEnvironment;
        }
        public async Task<CVDto> Handle(CreateCVCommand request, CancellationToken cancellationToken)
        {
            string? avatarPath = null;
            if (request.Avatar?.File != null)
            {
                var fileName = $"{Guid.NewGuid()}_{request.Avatar.FileName}";
                var filePath = Path.Combine(_webHostEnvironment.WebRootPath, "images", "avatars", fileName);

                // Tạo thư mục nếu chưa tồn tại
                Directory.CreateDirectory(Path.GetDirectoryName(filePath));

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Avatar.File.CopyToAsync(stream);
                }

                avatarPath = $"/images/avatars/{fileName}";
            }
            //Create CV
            var cv = new CV
            {
                UserId = request.UserId,
                File = request.File,
                PersonalInfo = request.PersonalInfo,
                Template = request.Template,
                Avatar = request.Avatar != null ? new Avatar
                {
                    FileBase64String = request.Avatar.FileBase64String,
                    FileName = request.Avatar.FileName,
                    Path = avatarPath
                } : null,
                Awards = request.Awards,
                Certificates = request.Certificates,
                Projects = request.Projects,
                Education = request.Education,
                Experiences = request.Experiences,
                Skill = request.Skill
            };
            await _cvRepository.CreateCVAsync(cv);

            var cvRes = await _cvRepository.GetCVByIdAsync(cv.Id);

            var cvDtoRes = _mapper.Map<CVDto>(cvRes);
            return cvDtoRes;
        }
    }
}
