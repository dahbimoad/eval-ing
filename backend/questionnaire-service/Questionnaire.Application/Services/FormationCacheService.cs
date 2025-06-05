namespace Questionnaire.Application.Services;

using Questionnaire.Infrastructure;
using Questionnaire.Application.DTOs;
using Questionnaire.Domain.Entities;

public class FormationCacheService
{
    private readonly QuestionnaireDbContext _context;

    public FormationCacheService(QuestionnaireDbContext context)
    {
        _context = context;
    }

    public async Task AddFormationAsync(FormationDto formationDto)
    {
        var formationCache = new FormationCache
        {
            Title = formationDto.Title,
            Description = formationDto.Description,
            Code = formationDto.Code,
            Credits = formationDto.Credits,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Formations.Add(formationCache);
        await _context.SaveChangesAsync();
    }
}