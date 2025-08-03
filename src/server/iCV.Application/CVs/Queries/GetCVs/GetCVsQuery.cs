using iCV.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Queries.GetCVs
{
    public class GetCVsQuery : IRequest<IList<CVDto>>
    {
        public string UserId { get; set; }
    }
}
