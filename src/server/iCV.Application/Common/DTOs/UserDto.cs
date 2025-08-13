using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class UserDto
    {
        public string? Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Provider { get; set; }
        public string? PictureUrl { get; set; }
        public DateTime CreatedAt { get; set; } 
        public DateTime UpdatedAt { get; set; } 
    }

    public class UserLoginDto
    {
        public string Token { get; set; }
        public UserDto User { get; set; }
    }
}
