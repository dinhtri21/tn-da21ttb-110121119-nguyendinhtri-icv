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
        public string email { get; set; }
        public string name { get; set; }
        public string? pictureUrl { get; set; }
    }
}
