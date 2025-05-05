// Controllers/AdminProfessionalsController.cs
using authentication_system.Models;
using authentication_system.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace authentication_system.Controllers;

[ApiController]
[Route("api/admin/professionals")]
[Authorize(Roles = "Admin")]
public class AdminProfessionalsController(ProfessionalAdminService service) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProfessionalCreateDTO dto)
    {
        var (user, password, err) = await service.CreateAsync(dto);
        return user == null
            ? BadRequest(new { message = err })
            : Ok(new { user, password });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var prof = await service.GetAsync(id);
        return prof == null ? NotFound() : Ok(prof);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProfessionalUpdateDTO dto)
    {
        var (ok, err) = await service.UpdateAsync(id, dto);
        return ok ? NoContent() : BadRequest(new { message = err });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        return await service.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
