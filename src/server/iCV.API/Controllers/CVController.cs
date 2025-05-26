using iCV.Application.CVs.Commands.Create;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace iCV.API.Controllers
{
    [Route("api/CV")]
    [ApiController]
    public class CVController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CVController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCV([FromBody] CreateCVCommand command)
        {
            if (command == null) return BadRequest("Invalid CV data.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
