using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Users.Commands.Create.CreateUserCommand
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, string>, IApplicationMarker
    {
        private readonly IUserRepository _userRepository;
        public CreateUserCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task<string> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var isUserExist = await _userRepository.GetUserByEmailAsync(request.Email);

            if (isUserExist != null && isUserExist.Provider == "google")
            {
                throw new Exception("Email này đăng nhập bằng hình thức google!");
            } else if (isUserExist != null)
            {
                throw new Exception("Email này đã được đăng ký!");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = hashedPassword,
                Provider = "local",
            };

            await _userRepository.CreateUserAsync(user);
            return user.Id;
        }
    }
}
