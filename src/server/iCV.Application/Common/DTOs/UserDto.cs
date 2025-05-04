using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.DTOs
{
    public class UserDto
    {
        public int id { get; set; }
        public string userName { get; set; }
        public string email { get; set; }
        public DateTime createdAt { get; set; }
        public DateTime updatedAt { get; set; }
    }

    public class UserProfileDto
    {
        public int id { get; set; }
        public string userName { get; set; }
        public string email { get; set; }
        public string? pictureUrl { get; set; }
        public DateTime createdAt { get; set; }
        public DateTime updatedAt { get; set; }
    }

    public class UserLoginDto
    {
        public string token { get; set; }
        public UserProfileDto user { get; set; }
    }
}
