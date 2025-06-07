using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.DTOs;
using Questionnaire.Application.Services;

namespace Questionnaire.API.Controllers;

[ApiController]
[Route("api/formation-cache")]
public sealed class FormationCacheController : ControllerBase
{
    private readonly FormationCacheService _svc;

    public FormationCacheController(FormationCacheService svc) => _svc = svc;

    /// POST /api/formation-cache
    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] FormationDto dto)
    {
        try
        {
            await _svc.AddOrUpdateAsync(dto);
            return Ok(new { message = "Formation cached successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet]
    public async Task<IActionResult> GetAllFormations()
    {
        var list = await _svc.GetAllAsync();
        return Ok(list);
    }
}