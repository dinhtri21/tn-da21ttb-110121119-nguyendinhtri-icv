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

namespace iCV.Application.Users.Queries.LoginWithGoogle
{
    public class LoginWithGoogleQueryHandler : IRequestHandler<LoginWithGoogleQuery, UserLoginDto>, IApplicationMarker
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        public LoginWithGoogleQueryHandler(IUserRepository userRepository, IConfiguration configuration)
        {
            _configuration = configuration;
            _userRepository = userRepository;
        }
        public async Task<UserLoginDto> Handle(LoginWithGoogleQuery request, CancellationToken cancellationToken)
        {
            // Check if user exists
            var user = await _userRepository.GetUserByEmailAsync(request.email);
            if (user == null)
            {
                var newUser = new User
                {
                    name = request.name,
                    email = request.email,
                    provider = "google",
                };
                await _userRepository.CreateUserAsync(newUser);
                user = newUser;
            }

            // Create claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.id), 
                new Claim(ClaimTypes.Email, user.email),
                new Claim(ClaimTypes.Name, user.name),
            };

            // Create token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Return token and user info
            var userInfo = new UserLoginDto
            {
                token = tokenString,
                user = new UserDto
                {
                    id = user.id,
                    name = user.name,
                    email = user.email,
                    pictureUrl = request.pictureUrl,
                    provider = user.provider,
                    createdAt = user.createdAt,
                    updatedAt = user.updatedAt,
                }
            };

            return userInfo;
        }
    }

}
