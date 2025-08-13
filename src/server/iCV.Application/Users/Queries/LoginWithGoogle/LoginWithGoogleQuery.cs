using iCV.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Users.Queries.LoginWithGoogle
{
    public class LoginWithGoogleQuery : IRequest<UserLoginDto>
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string? PictureUrl { get; set; }
    }
}
