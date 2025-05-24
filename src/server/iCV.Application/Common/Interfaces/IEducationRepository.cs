using iCV.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface IEducationRepository
    {
        Task CreateEducationAsync(Education education);
        Task<Education?> GetEducationByIdAsync(string id);
        Task<IEnumerable<Education>> GetAllEducationsAsync();
        Task UpdateEducationAsync(Education education);
        Task DeleteEducationAsync(string id);
    }
}
