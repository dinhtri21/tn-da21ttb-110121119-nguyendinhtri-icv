using iCV.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface IExperienceRepository
    {
        Task CreateExperienceAsync(Experience experience);
        Task<Experience?> GetExperienceByIdAsync(string id);
        Task<IEnumerable<Experience>> GetAllExperiencesAsync();
        Task UpdateExperienceAsync(Experience experience);
        Task DeleteExperienceAsync(string id);
    }
}
