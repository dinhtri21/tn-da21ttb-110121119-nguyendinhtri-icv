using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Users.Commands.Create.CreateUserCommand
{
    public class CreateUserCommand : IRequest<string>
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string? PassWord { get; set; }
    }
}
