using iCV.Application.Evaluate.Queries.EvaluateWithGemini;
using iCV.Application.ExternalServices.Suggestion.Queries.TavilyJobSuggestionQuery;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace iCV.API.Controllers
{
    [Route("api/Suggestion")]
    [ApiController]
    public class SuggestionController : ControllerBase
    {
        private readonly IMediator _mediator;
        public SuggestionController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet]
        public async Task<IActionResult> Suggestion([FromQuery] string id)
        {
            var query = new TavilyJobSuggestionQuery { id = id };
            var result = await _mediator.Send(query);
            return Ok(
                new
                {
                    isSuccess = true,
                    message = "Evaluation completed successfully.",
                    data = result
                }
            );
        }
    }
}
