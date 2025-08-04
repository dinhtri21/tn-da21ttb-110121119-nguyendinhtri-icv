using iCV.Application.CVs.Commands.Create;
using iCV.Application.CVs.Commands.Update;
using iCV.Application.CVs.Queries.GetCVById;
using iCV.Application.CVs.Queries.GetCVs;
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
        [HttpGet]
        public async Task<IActionResult> GetCVs()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Missing user ID in token.");
            var query = new GetCVsQuery { UserId = userIdClaim };
            var result = await _mediator.Send(query);
            return Ok(new
            {
                isSuccess = true,
                message = "CVs retrieved successfully.",
                data = result
            }
             );
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCVById([FromRoute] string id)
        {
            var query = new GetCVByIdQuery { id = id };
            var result = await _mediator.Send(query);
            if (result == null) return NotFound("CV not found.");
            return Ok(
                new
                {
                    isSuccess = true,
                    message = "CV retrieved successfully.",
                    data = result
                }
            );
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateCV([FromBody] CreateCVCommand command)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Missing user ID in token.");

            command.UserId = userIdClaim;
            var result = await _mediator.Send(command);
            return Ok(
                new
                {
                    iSuccess = true,
                    message = "CV created successfully.",
                    data = result
                }
                );
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCV([FromRoute] string id, [FromBody] UpdateCVCommand command)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Missing user ID in token.");

            command.UserId = userIdClaim;
            command.Id = id;
            var result = await _mediator.Send(command);
            return Ok(
                new
                {
                    isSuccess = true,
                    message = "CV updated successfully.",
                    data = result
                }
                );
        }
    }
}
