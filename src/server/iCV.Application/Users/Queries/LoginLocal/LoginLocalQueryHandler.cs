using FluentValidation;
using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Users.Queries.LoginLocal
{
    public class LoginLocalQueryHandler : IRequestHandler<LoginLocalQuery, UserLoginDto>, IApplicationMarker
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        public LoginLocalQueryHandler(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }
        public async Task<UserLoginDto> Handle(LoginLocalQuery request, CancellationToken cancellationToken)
        {
            // Check if user exists
            var user = await _userRepository.GetUserByEmailAsync(request.Email);

            if(user != null && user.Provider == "google")
            {
                throw new ValidationException("Email này đã được đăng ký bằng hình thức Google!");
            }   

            if (user == null)
            {
                throw new ValidationException("Email hoặc mật khẩu không đúng");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.PassWord, user.Password))
            {
                throw new ValidationException("Email hoặc mật khẩu không đúng");
            }

            // Create claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
            };

            // Create token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(12),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Return token and user info
            var userInfo = new UserLoginDto
            {
                Token = tokenString,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Provider = user.Provider,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                }
            };

            return userInfo;
        }
    }
}
