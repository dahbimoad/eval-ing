using Catalog.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.Net.Http.Headers;

namespace Catalog.API.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;
        private readonly IWebHostEnvironment _env;

        public TestController(ILogger<TestController> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        [HttpGet("auth")]
        public async Task<IActionResult> TestAuth(
            [FromServices] IAuthServiceClient authClient,
            [FromHeader(Name = "Authorization")] string? authHeader)
        {
            try
            {
                if (string.IsNullOrEmpty(authHeader))
                    return BadRequest(new { Error = "Authorization header is required" });

                var token = authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) 
                    ? authHeader["Bearer ".Length..].Trim() 
                    : authHeader;

                if (string.IsNullOrWhiteSpace(token))
                    return BadRequest(new { Error = "Invalid token format" });

                var isValid = await authClient.ValidateTokenAsync(token);

                return Ok(new 
                {
                    IsValid = isValid,
                    Message = isValid ? "✅ Valid token" : "❌ Invalid token",
                    TokenPreview = token.Length > 10 ? token[..10] + "..." : token
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token validation error");
                return StatusCode(500, new
                {
                    Error = "Validation failed",
                    Details = ex.Message,
                    StackTrace = _env.IsDevelopment() ? ex.StackTrace : null
                });
            }
        }

        [HttpGet("direct-validate")]
        public async Task<IActionResult> DirectValidation(
            [FromServices] HttpClient httpClient,
            [FromHeader(Name = "Authorization")] string? authHeader)
        {
            if (string.IsNullOrEmpty(authHeader))
                return BadRequest("Authorization header required");

            var token = authHeader.StartsWith("Bearer ") ? authHeader[7..] : authHeader;

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/health");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var response = await httpClient.SendAsync(request);

                return Ok(new
                {
                    StatusCode = response.StatusCode,
                    IsSuccess = response.IsSuccessStatusCode,
                    Body = await response.Content.ReadAsStringAsync()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Error = ex.Message,
                    StackTrace = _env.IsDevelopment() ? ex.StackTrace : null
                });
            }
        }
    }
}