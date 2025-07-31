using iCV.Application.Common.DTOs;
using iCV.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface ICVRepository
    {
        Task<CV?> GetCVByIdAsync(string id);
        Task CreateCVAsync(CV cv);
    }
}
