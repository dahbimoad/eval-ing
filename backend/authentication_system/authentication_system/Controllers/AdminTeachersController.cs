using authentication_system.Models;
using authentication_system.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace authentication_system.Controllers;

[ApiController]
[Route("api/admin/teachers")]
[Authorize(Roles = "Admin")]
public class AdminTeachersController : ControllerBase
{
    private readonly TeacherAdminService _service;

    public AdminTeachersController(TeacherAdminService service)
    {
        _service = service;
    }

    /// <summary>
    /// Crée un enseignant avec profil lié à un utilisateur.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TeacherCreateDTO dto)
    {
        var (teacher, err) = await _service.CreateAsync(dto);
        if (teacher == null)
            return BadRequest(new { message = err });

        return Ok(new { teacher });
    }

    /// <summary>
    /// Liste tous les enseignants.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    /// <summary>
    /// Récupère un enseignant par ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var teacher = await _service.GetAsync(id);
        return teacher == null ? NotFound() : Ok(teacher);
    }

    /// <summary>
    /// Met à jour les informations d’un enseignant.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] TeacherUpdateDTO dto)
    {
        var (ok, err) = await _service.UpdateAsync(id, dto);
        return ok ? NoContent() : BadRequest(new { message = err });
    }

    /// <summary>
    /// Supprime un enseignant (et son User lié).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
