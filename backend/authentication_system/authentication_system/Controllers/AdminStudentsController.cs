// Controllers/AdminStudentsController.cs
using authentication_system.Models;
using authentication_system.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace authentication_system.Controllers;

[ApiController]
[Route("api/admin/students")]
[Authorize(Roles = "Admin")]
public class AdminStudentsController(StudentAdminService svc) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(StudentCreateDTO dto)
    {
        var (student, pwd, err) = await svc.CreateAsync(dto);
        if (student == null) return BadRequest(new { message = err });
        return Ok(new { student, password = pwd });
    }

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await svc.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var student = await svc.GetAsync(id);
        return student == null ? NotFound() : Ok(student);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, StudentUpdateDTO dto)
    {
        var (ok, err) = await svc.UpdateAsync(id, dto);
        return ok ? NoContent() : BadRequest(new { message = err });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
        => await svc.DeleteAsync(id) ? NoContent() : NotFound();
}
