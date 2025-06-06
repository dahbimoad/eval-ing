using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Questionnaire.Application.DTOs;
using Questionnaire.Application.Services;

namespace Questionnaire.API.Controllers;

[ApiController]
[Route("api/publications")]
//[Authorize(Policy = "ReportAccess")]   // only Report service or Admin
public sealed class SubmissionExportController : ControllerBase
{
    private readonly ISubmissionExportService _svc;
    public SubmissionExportController(ISubmissionExportService svc) => _svc = svc;

    // GET /api/publications/{id}/submissions
    [HttpGet("{id:int}/submissions")]
    [ProducesResponseType(typeof(IReadOnlyList<SubmissionExportDto>), 200)]
    public async Task<IActionResult> GetAll(int id)
    {
        var list = await _svc.FetchAsync(id);
        return Ok(list);   // empty list ⇒ 200 with []  (report service can handle no-data)
    }
}
