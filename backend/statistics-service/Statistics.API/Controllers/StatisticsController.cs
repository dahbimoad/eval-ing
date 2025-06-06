using Microsoft.AspNetCore.Mvc;
using Statistics.API.Models;
using Statistics.API.Services;

namespace Statistics.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        /// <summary>
        /// Get detailed statistics for a specific questionnaire publication
        /// </summary>
        [HttpGet("questionnaire/{publicationId}")]
        public async Task<ActionResult<QuestionnaireStatisticsDto>> GetQuestionnaireStatistics(int publicationId)
        {
            var stats = await _statisticsService.GetQuestionnaireStatisticsAsync(publicationId);
            return Ok(stats);
        }

        /// <summary>
        /// Get raw submission data for a publication (proxy to questionnaire service)
        /// </summary>
        [HttpGet("submissions/{publicationId}")]
        public async Task<ActionResult<List<SubmissionExportDto>>> GetSubmissions(int publicationId)
        {
            var submissions = await _statisticsService.GetSubmissionsByPublicationAsync(publicationId);
            return Ok(submissions);
        }

        /// <summary>
        /// Get overall statistics across all questionnaires
        /// </summary>
        [HttpGet("overall")]
        public async Task<ActionResult<OverallStatisticsDto>> GetOverallStatistics()
        {
            var stats = await _statisticsService.GetOverallStatisticsAsync();
            return Ok(stats);
        }
    }
}