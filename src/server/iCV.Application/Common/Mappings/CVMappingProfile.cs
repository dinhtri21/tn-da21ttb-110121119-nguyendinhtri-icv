using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Mappings
{
    internal class CVMappingProfile : Profile
    {
        public CVMappingProfile()
        {
            CreateMap<CV, CVDto>();
        }
    }
}
