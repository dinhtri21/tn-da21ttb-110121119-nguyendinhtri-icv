using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Application.Users.Commands.Create.CreateUserCommand;
using iCV.Application.Users.Queries.LoginLocal;
using iCV.Application.Users.Queries.LoginWithGoogle;
using iCV.Domain.Entities;
using iCV.Infrastructure.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Web;

namespace iCV.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IConfiguration _configuration;

        public AuthController(IMediator mediator, IConfiguration configuration)
        {
            _mediator = mediator;
            _configuration = configuration;
        }

        [HttpPost("signUp")]
        public async Task<IActionResult> AddUser(CreateUserCommand command)
        {
            var userId = await _mediator.Send(command);
            if (userId == null)
            {
                return BadRequest(new { message = "Đăng ký tài khoản không thành công!" });
            }
            return Ok(new
            {
                isSuccess = true,
                message = "Đăng ký tài khoản thành công!",
                data = new { id = userId }
            });
        }

        [HttpPost("signIn")]
        public async Task<IActionResult> Login([FromBody] LoginLocalQuery query)
        {
            var loginData = await _mediator.Send(query);
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                Expires = DateTime.UtcNow.AddHours(12),
                SameSite = SameSiteMode.None,
                MaxAge = TimeSpan.FromHours(12),
            };
            Response.Cookies.Append("accessToken", loginData.token, cookieOptions);

            return Ok(new
            {
                isSuccess = true,
                message = "Đăng nhập thành công!",
                data = loginData
            });
        }

        [HttpGet("google-login")]
        public IActionResult GoogleLogin([FromQuery] string? returnUrl = null, [FromQuery] string? origin = null)
        {
            try
            {
                var redirectUrl = Url.Action("GoogleCallback", "Auth", null, Request.Scheme, Request.Host.Value);
                var state = GenerateSecureState();

                // Xác định frontend origin
                var frontendOrigin = GetFrontendOrigin(origin);

                // Xác định callback URL - ưu tiên returnUrl, fallback về default
                var callbackUrl = !string.IsNullOrEmpty(returnUrl) ? returnUrl : $"{frontendOrigin}/auth/google-callback";

                // Lưu state và return URL vào session
                HttpContext.Session.SetString("oauth_state", state);
                HttpContext.Session.SetString("oauth_return_url", callbackUrl);
                HttpContext.Session.SetString("oauth_created_at", DateTimeOffset.UtcNow.ToString());

                var googleClientId = _configuration["Authentication:Google:ClientId"];
                var scopes = Uri.EscapeDataString("openid profile email");

                var googleAuthUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                    $"client_id={googleClientId}&" +
                    $"scope={scopes}&" +
                    $"response_type=code&" +
                    $"redirect_uri={Uri.EscapeDataString(redirectUrl)}&" +
                    $"state={state}&" +
                    $"prompt=select_account&" +
                    $"access_type=offline";

                return Ok(new { redirectUrl = googleAuthUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string state, [FromQuery] string? error = null)
        {
            // Lấy return URL từ session thay vì hardcode
            var returnUrl = HttpContext.Session.GetString("oauth_return_url");
            var frontendOrigin = GetFrontendOrigin();

            // Sử dụng returnUrl từ session, fallback về default callback
            var callbackUrl = !string.IsNullOrEmpty(returnUrl) ? returnUrl : $"{frontendOrigin}/auth/google-callback";

            try
            {
                // Kiểm tra error từ Google
                if (!string.IsNullOrEmpty(error))
                {
                    ClearSessionData();
                    return Redirect($"{callbackUrl}?error={Uri.EscapeDataString(error)}");
                }

                // Validate state
                var sessionState = HttpContext.Session.GetString("oauth_state");
                var createdAtStr = HttpContext.Session.GetString("oauth_created_at");

                if (string.IsNullOrEmpty(sessionState) || sessionState != state)
                {
                    ClearSessionData();
                    return Redirect($"{callbackUrl}?error=invalid_state");
                }

                // Kiểm tra thời gian hết hạn (10 phút)
                if (DateTimeOffset.TryParse(createdAtStr, out var createdAt))
                {
                    if (DateTimeOffset.UtcNow.Subtract(createdAt).TotalMinutes > 10)
                    {
                        ClearSessionData();
                        return Redirect($"{callbackUrl}?error=session_expired");
                    }
                }

                // Kiểm tra code
                if (string.IsNullOrEmpty(code))
                {
                    ClearSessionData();
                    return Redirect($"{callbackUrl}?error=missing_code");
                }

                // Lấy access token từ Google
                var tokenResponse = await GetGoogleAccessToken(code);
                if (tokenResponse == null)
                {
                    ClearSessionData();
                    return Redirect($"{callbackUrl}?error=token_exchange_failed");
                }

                // Lấy user info từ Google
                var userInfo = await GetGoogleUserInfo(tokenResponse.AccessToken);
                if (userInfo == null)
                {
                    ClearSessionData();
                    return Redirect($"{callbackUrl}?error=user_info_failed");
                }

                // Xử lý login/register user
                var loginData = await _mediator.Send(new LoginWithGoogleQuery
                {
                    email = userInfo.email,
                    name = userInfo.name,
                    pictureUrl = userInfo.picture
                });

                ClearSessionData();

                // Redirect về callback page với thông tin thành công
                var userJson = Uri.EscapeDataString(JsonSerializer.Serialize(loginData.user));
                var redirectUrl = $"{callbackUrl}?success=true&token={Uri.EscapeDataString(loginData.token)}&user={userJson}";

                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                ClearSessionData();
                return Redirect($"{callbackUrl}?error={Uri.EscapeDataString("authentication_failed")}");
            }
        }

        private void ClearSessionData()
        {
            HttpContext.Session.Remove("oauth_state");
            HttpContext.Session.Remove("oauth_return_url");
            HttpContext.Session.Remove("oauth_created_at");
        }

        private string GenerateSecureState()
        {
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        }

        private string GetFrontendOrigin(string? preferredOrigin = null)
        {
            var allowedOrigins = _configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

            // Nếu có preferredOrigin và nó nằm trong allowedOrigins
            if (!string.IsNullOrEmpty(preferredOrigin) && allowedOrigins?.Contains(preferredOrigin) == true)
            {
                return preferredOrigin;
            }

            // Nếu không có preferredOrigin hợp lệ, lấy từ cấu hình
            var defaultOrigin = _configuration["Frontend:DefaultOrigin"];
            return defaultOrigin ?? "http://localhost:3000";
        }


        private async Task<GoogleTokenResponse?> GetGoogleAccessToken(string code)
        {
            try
            {
                var clientId = _configuration["Authentication:Google:ClientId"];
                var clientSecret = _configuration["Authentication:Google:ClientSecret"];
                var redirectUri = Url.Action("GoogleCallback", "Auth", null, Request.Scheme, Request.Host.Value);

                var tokenRequest = new Dictionary<string, string>
                {
                    ["code"] = code,
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                    ["redirect_uri"] = redirectUri,
                    ["grant_type"] = "authorization_code"
                };

                using var httpClient = new HttpClient();
                var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token",
                    new FormUrlEncodedContent(tokenRequest));

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Google token request failed: {response.StatusCode} - {errorContent}");
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<GoogleTokenResponse>(json, options);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting Google access token: {ex.Message}");
                return null;
            }
        }

        private async Task<GoogleUserInfo?> GetGoogleUserInfo(string accessToken)
        {
            try
            {
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

                var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Google userinfo request failed: {response.StatusCode} - {errorContent}");
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<GoogleUserInfo>(json, options);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting Google user info: {ex.Message}");
                return null;
            }
        }
    }

    public class GoogleTokenResponse
    {
        public string access_token { get; set; } = string.Empty;
        public string token_type { get; set; } = string.Empty;
        public int expires_in { get; set; }
        public string refresh_token { get; set; } = string.Empty;
        public string scope { get; set; } = string.Empty;
        public string AccessToken => access_token;
    }

    public class GoogleUserInfo
    {
        public string id { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public bool verified_email { get; set; } = false;
        public string name { get; set; } = string.Empty;
        public string given_name { get; set; } = string.Empty;
        public string family_name { get; set; } = string.Empty;
        public string picture { get; set; } = string.Empty;
        public string locale { get; set; } = string.Empty;
    }
}