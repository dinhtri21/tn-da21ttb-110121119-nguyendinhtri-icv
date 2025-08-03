using iCV.Application.Common.DTOs;
using iCV.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Avatars.Commands.Create
{
    public class CreateAvatarCommand : IRequest<AvatarDto>
    {
        public string CVId { get; set; }
        public IFormFile File { get; set; }
        public string FileName { get; set; }
    }
}
