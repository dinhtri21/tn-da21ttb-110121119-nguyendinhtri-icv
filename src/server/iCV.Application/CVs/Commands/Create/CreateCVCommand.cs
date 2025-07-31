using iCV.Application.Common.DTOs;
using iCV.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Commands.Create
{
    public class CreateCVCommand : IRequest<CVDto>
    {
        public string? UserId { get; set; }
        public FileData? File { get; set; }
        public Template? Template { get; set; }
        public AvatarRequest? Avatar { get; set; }
        public List<Award>? Awards { get; set; }
        public List<Certificate>? Certificates { get; set; }
        public PersonalInfo? PersonalInfo { get; set; }
        public List<Project>? Projects { get; set; }
        public List<Education>? Education { get; set; }
        public List<Experience>? Experiences { get; set; }
        public Skill? Skill { get; set; }

    }

    public class AvatarRequest
    {
        public IFormFile? File { get; set; }
        public string? FileBase64String { get; set; }
        public string? FileName { get; set; }
        public string? Path { get; set; }
    }
}
