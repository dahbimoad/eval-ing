using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.Services;
using Questionnaire.Domain.Entities;
using Questionnaire.Domain.Entities.Events;

namespace Questionnaire.API.Controllers
{
    [ApiController]
    [Route("api/formation-cache")]
    public class FormationCacheController : ControllerBase
    {
        private readonly IFormationCacheService _svc;

        public FormationCacheController(IFormationCacheService svc)
        {
            _svc = svc;
        }

        /// <summary>
        /// Receive a FormationCreatedEvent and insert/update the cache.
        /// POST /api/formation-cache/event
        /// </summary>
        [HttpPost("event")]
        public async Task<IActionResult> UpsertFromEvent([FromBody] FormationCreatedEvent @event)
        {
            if (@event is null) return BadRequest("Event payload is required.");
            await _svc.AddOrUpdateFormationAsync(@event);
            return Ok(new { message = $"Filière '{@event.Code}' cached/updated." });
        }

        /// <summary>
        /// Return all cached filières.
        /// GET /api/formation-cache
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormationCacheDto>>> GetAll()
        {
            var all = await _svc.GetAllFormationsAsync();
            return Ok(all);
        }

        /// <summary>
        /// Return a single filière by its Code.
        /// GET /api/formation-cache/{code}
        /// </summary>
        [HttpGet("{code}")]
        public async Task<ActionResult<FormationCacheDto>> GetByCode(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest("Code is required.");

            var dto = await _svc.GetFormationAsync(code);
            if (dto is null) return NotFound();
            return Ok(dto);
        }
    }
     [HttpGet]
        public async Task<ActionResult<IEnumerable<FormationCacheDto>>> GetAllFromDb()
        {
            var list = await _svc.GetAllFromDbAsync();
            return Ok(list);
        }
}
