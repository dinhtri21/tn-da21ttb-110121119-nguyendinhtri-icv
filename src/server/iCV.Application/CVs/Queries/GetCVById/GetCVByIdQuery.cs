using iCV.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Queries.GetCVById
{
    public class GetCVByIdQuery : IRequest<CVDto>
    {
        public string id { get; set; }
    }
}
