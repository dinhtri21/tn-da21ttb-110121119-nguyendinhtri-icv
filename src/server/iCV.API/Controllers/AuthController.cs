using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using iCV.Application.Common.DTOs;
using MediatR;
using iCV.Application.Users.Queries.LoginWithGoogle;

namespace iCV.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var redirectUrl = Url.Action("GoogleResponse", "Auth");
            var properties = new AuthenticationProperties
            {
                RedirectUri = redirectUrl,
                Items = { { "prompt", "select_account" } }  // Force the user to select an account
            };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google-response")]
        public async Task<IActionResult> GoogleResponse()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!result.Succeeded) return BadRequest(); // login failed

            var claims = result.Principal.Identities
                .FirstOrDefault()?.Claims.Select(claim => new
                {
                    claim.Type,
                    claim.Value
                });

            var loginData = await _mediator.Send(new LoginWithGoogleQuery
            {
                email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value,
                name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value,
                pictureUrl = claims.FirstOrDefault(c => c.Type == "picture")?.Value
            });

            return Ok(loginData);
        }
    }
}
