using Catalog.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        [HttpGet("auth")]
        public async Task<IActionResult> TestAuth([FromServices] IAuthServiceClient authClient)
        {
            var token = HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            
            if (string.IsNullOrEmpty(token))
                return BadRequest("Add 'Authorization: Bearer YOUR_TOKEN' header");

            var isValid = await authClient.ValidateTokenAsync(token);
            return Ok(new { 
                IsValid = isValid,
                Message = isValid ? "✅ Auth service connection works!" : "❌ Invalid token or auth service down"
            });
        }
    }
}