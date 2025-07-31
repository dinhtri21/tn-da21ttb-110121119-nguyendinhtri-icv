using iCV.Application.CVs.Commands.Create;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateCV([FromForm] CreateCVCommand command)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Missing user ID in token.");

            command.UserId = userIdClaim;
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
