using Microsoft.AspNetCore.Mvc;

namespace iCV.API.Controllers
{
    [Route("api/healthcheck")]
    [ApiController]
    public class HealthCheckController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                version = "1.0.0"
            });
        }
    }
}