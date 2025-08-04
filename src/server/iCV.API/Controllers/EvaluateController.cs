using iCV.Application.Evaluate.Queries.EvaluateWithGemini;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace iCV.API.Controllers
{
    [Route("api/evaluate")]
    [ApiController]
    public class EvaluateController : ControllerBase
    {
        private readonly IMediator _mediator;
        public EvaluateController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet]
        public async Task<IActionResult> EvaluateWithGemini([FromQuery] string id)
        {
            var query = new EvaluateWithGeminiQuery { id = id };
            var result = await _mediator.Send(query);
            return Ok(
                new
                {
                    isSuccess = true,
                    message = "Evaluation completed successfully.",
                    data = result.Areas
                }
            );
        }
    }
}
