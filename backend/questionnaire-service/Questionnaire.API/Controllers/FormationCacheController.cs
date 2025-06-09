using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.Services;
using Questionnaire.Application.DTOs;
using Questionnaire.Domain.Entities.Events;

namespace Questionnaire.API.Controllers
{
    [ApiController]
    [Route("api/formation-cache")]
    public class FormationCacheController : ControllerBase
    {
        private readonly FormationCacheService _formationCacheService;

        public FormationCacheController(FormationCacheService formationCacheService)
        {
            _formationCacheService = formationCacheService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFormations()
        {
            try
            {
                var formations = await _formationCacheService.GetAllFormationsAsync();
                return Ok(formations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving formations: {ex.Message}" });
            }
        }

        [HttpGet("{code}")]
        public async Task<IActionResult> GetFormationByCode(string code)
        {
            try
            {
                var formation = await _formationCacheService.GetFormationAsync(code);
                if (formation == null)
                {
                    return NotFound(new { message = $"Formation with code '{code}' not found." });
                }
                return Ok(formation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving formation: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddFormationToCache([FromBody] FormationCreatedEvent formationDto)
        {
            try
            {
                await _formationCacheService.AddOrUpdateFormationAsync(formationDto);
                return Ok(new { message = "Formation added to cache successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
    }
}