// Controllers/AdminUsersController.cs
using authentication_system.Models;
using authentication_system.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace authentication_system.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController(IUserAdminService svc) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(UserCreateDTO dto)
    {
        var (user, pwd, err) = await svc.CreateAsync(dto);
        if (user == null) return BadRequest(new { message = err });

        return Ok(new { user, password = pwd });
    }

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await svc.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var user = await svc.GetAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UserUpdateDTO dto)
    {
        var (ok, err) = await svc.UpdateAsync(id, dto);
        return ok ? NoContent() : BadRequest(new { message = err });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
        => await svc.DeleteAsync(id) ? NoContent() : NotFound();
}
