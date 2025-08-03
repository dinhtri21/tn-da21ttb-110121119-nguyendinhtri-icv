using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Queries.GetCVById
{
    public class GetCVByIdQueryHandler : IRequestHandler<GetCVByIdQuery, CVDto>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;
        private readonly IMapper _mapper;
        public GetCVByIdQueryHandler(ICVRepository cvRepository, IMapper mapper)
        {
            _mapper = mapper;
            _cvRepository = cvRepository;
        }
        public async Task<CVDto> Handle(GetCVByIdQuery request, CancellationToken cancellationToken)
        {
            var cv = await _cvRepository.GetCVByIdAsync(request.id);

            return _mapper.Map<CVDto>(cv);
        }
    }
}
