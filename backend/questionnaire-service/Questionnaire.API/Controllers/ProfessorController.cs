using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.DTOs;
using Questionnaire.Application.Services;
using System.Security.Claims;

namespace Questionnaire.API.Controllers
{
    [ApiController]
    [Route("api/professor/questionnaires")]
    [Authorize(Roles = "Enseignant")]
    public class ProfessorController : ControllerBase
    {
        private readonly ProfessorService _professorService;

        public ProfessorController(ProfessorService professorService)
        {
            _professorService = professorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPublishedQuestionnaires()
        {
            var questionnaires = await _professorService.GetPublishedQuestionnairesForProfAsync();
            return Ok(questionnaires);
        }

        [HttpGet("{templateCode}")]
        public async Task<IActionResult> GetQuestionnaireDetails(string templateCode)
        {
            try
            {
                var questionnaire = await _professorService.GetTemplateDetailsAsync(templateCode);
                return Ok(questionnaire);
            }
            catch (KeyNotFoundException e)
            {
                return NotFound(new { message = e.Message });
            }
        }

        [HttpPost("submit/{templateCode}")]
        public async Task<IActionResult> SubmitAnswers(string templateCode, [FromBody] SubmitAnswersRequestDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid userId))
                return Unauthorized();

            try
            {
                await _professorService.SubmitAnswersAsync(userId, templateCode, request);
                return Ok(new { message = "Submission saved successfully." });
            }
            catch (KeyNotFoundException e)
            {
                return NotFound(new { message = e.Message });
            }
            catch (InvalidOperationException e)
            {
                return BadRequest(new { message = e.Message });
            }
        }
    }
}
