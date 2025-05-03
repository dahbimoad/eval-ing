// Controllers/UserProfileController.cs
using authentication_system.Models;
using authentication_system.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace authentication_system.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserProfileController(IUserProfileService _profileService) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetMyProfile()
    {
        var profile = await _profileService.GetAsync(UserId);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProfile([FromBody] UserProfileCreateDTO dto)
    {
        var profile = await _profileService.CreateAsync(UserId, dto);
        if (profile is null) return Conflict(new { message = "Profile already exists." });
        return CreatedAtAction(nameof(GetMyProfile), profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfileUpdateDTO dto)
    {
        var profile = await _profileService.UpdateAsync(UserId, dto);
        if (profile is null) return NotFound(new { message = "Profile not found." });
        return Ok(profile);
    }

    [HttpGet("exists")]
    public async Task<IActionResult> CheckIfProfileExists()
    {
        var hasProfile = await _profileService.HasProfileAsync(UserId);
        return Ok(new { hasProfile });
    }
}
