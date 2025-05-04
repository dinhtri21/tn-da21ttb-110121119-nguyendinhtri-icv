using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using iCV.Domain.Entities;

namespace iCV.Application.Common.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task CreateUserAsync(User user);
    }
}
