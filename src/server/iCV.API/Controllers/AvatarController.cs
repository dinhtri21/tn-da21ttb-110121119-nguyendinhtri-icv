using iCV.Application.Avatars.Commands.Create;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace iCV.API.Controllers
{
    [Route("api/avatar")]
    [ApiController]
    public class AvatarController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AvatarController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAvatar([FromForm] CreateAvatarCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
