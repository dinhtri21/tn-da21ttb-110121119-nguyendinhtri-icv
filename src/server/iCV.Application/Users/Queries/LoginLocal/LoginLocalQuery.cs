using iCV.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Users.Queries.LoginLocal
{
    public class LoginLocalQuery : IRequest<UserLoginDto>
    {
        public string Email { get; set; }
        public string PassWord { get; set; }
    }
}
