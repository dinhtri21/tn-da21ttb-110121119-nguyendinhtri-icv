using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Queries.GetCVs
{
    public class GetCVsQueryHandler : IRequestHandler<GetCVsQuery, IList<CVDto>>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;
        private readonly IMapper _mapper;
        public GetCVsQueryHandler(ICVRepository cvRepository, IMapper mapper)
        {
            _mapper = mapper;
            _cvRepository = cvRepository;
        }
        public Task<IList<CVDto>> Handle(GetCVsQuery request, CancellationToken cancellationToken)
        {
            var cvs = _cvRepository.GetCVsAsync(request.UserId);
            var cvDtos = _mapper.Map<IList<CVDto>>(cvs.Result);
            return Task.FromResult(cvDtos);
        }
    }
}
